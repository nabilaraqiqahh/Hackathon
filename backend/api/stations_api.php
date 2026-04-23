<?php
// backend/api/stations_api.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../core_functions.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Fetch specific station or all stations, joining with ports to determine status
        $query = "SELECT s.* FROM stations s";
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            $data = executeQuery("$query WHERE s.station_id = ?", [$id]);
        } else {
            $data = executeQuery($query);
        }

        // 1. ENSURE PORTS EXIST AND ATTACH TO DATA
        foreach ($data as &$row) {
            $sid = $row['station_id'];
            
            // Check if ports exist
            $ports = executeQuery("SELECT * FROM station_ports WHERE station_id = ?", [$sid]);
            
            if (empty($ports)) {
                // JIT insert at least one port based on station info
                $portType = (stripos($row['charger_type'], 'DC') !== false) ? 'DC Fast' : 'AC Standard';
                $new_id = executeInsert("INSERT INTO station_ports (station_id, port_name, charger_type, price_per_kwh, status) VALUES (?, 'Port 1', ?, ?, 'Available')", 
                               [$sid, $portType, $row['price_per_kwh']]);
                $ports = executeQuery("SELECT * FROM station_ports WHERE port_id = ?", [$new_id]);
            }

            $row['ports'] = $ports;

            // Now calculate derived status from port table
            $portStatus = executeQuery("SELECT 
                                        CASE 
                                            WHEN EXISTS (SELECT 1 FROM station_ports WHERE station_id = ? AND status = 'Available') THEN 'Available'
                                            WHEN NOT EXISTS (SELECT 1 FROM station_ports WHERE station_id = ? AND status != 'Maintenance') THEN 'Maintenance'
                                            ELSE 'Full'
                                        END as s", [$sid, $sid])[0]['s'];
            
            $row['status'] = $row['derived_status'] = $portStatus;
        }
        echo json_encode(["success" => true, "data" => $data]);
        break;

    case 'POST':
        // Add or Upsert station (JIT Insertion from Map)
        $input = json_decode(file_get_contents("php://input"), true);
        if (isset($input['station_id'], $input['station_name'], $input['district'])) {
            $address = $input['address'] ?? null;
            $operator_name = $input['operator_name'] ?? 'Unknown Operator';
            $charger_type = $input['charger_type'] ?? 'AC Standard(22kW+)';
            $total_bays = $input['total_bays'] ?? 1;
            $connectors = $input['connectors'] ?? 1;
            $available_bays = $input['available_bays'] ?? $total_bays;
            $status = $input['status'] ?? 'Available';
            $price_per_kwh = $input['price_per_kwh'] ?? 1.20;
            $idle_fee = $input['idle_fee'] ?? 0.00;
            
            $query = "INSERT INTO stations (station_id, station_name, address, operator_name, charger_type, district, total_bays, connectors, available_bays, status, price_per_kwh, idle_fee, latitude, longitude) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                      ON DUPLICATE KEY UPDATE 
                      station_name = VALUES(station_name),
                      status = VALUES(status),
                      available_bays = VALUES(available_bays),
                      latitude = VALUES(latitude),
                      longitude = VALUES(longitude)";
                      
            $success = executeAction($query, [
                $input['station_id'], $input['station_name'], $address, $operator_name, 
                $charger_type, $input['district'], $total_bays, $connectors, 
                $available_bays, $status, $price_per_kwh, $idle_fee,
                $input['latitude'] ?? null, $input['longitude'] ?? null
            ]);
            
            if ($success) {
                // JIT upsert station ports
                for ($i = 1; $i <= $connectors; $i++) {
                    // Logic from MapExplorer.jsx getPortInfo
                    $isDC = stripos($charger_type, 'DC') !== false;
                    $portType = $charger_type;
                    $rate = $price_per_kwh;
                    if ($connectors > 1) {
                        if ($i % 2 == 1) {
                            $portType = 'DC Fast';
                            $rate = 1.20;
                        } else {
                            $portType = 'AC Standard';
                            $rate = 0.90;
                        }
                    } else {
                        if ($isDC) {
                            $portType = 'DC Fast';
                            $rate = 1.20;
                        } else {
                            $portType = 'AC Standard';
                            $rate = 0.90;
                        }
                    }

                    $portName = "Port $i";
                    // Only insert if not exists (using ON DUPLICATE KEY UPDATE to avoid errors)
                    // Wait, station_ports doesn't have a unique key on (station_id, port_name).
                    // So we do a SELECT first.
                    $checkQuery = "SELECT port_id FROM station_ports WHERE station_id = ? AND port_name = ?";
                    $existingPort = executeQuery($checkQuery, [$input['station_id'], $portName]);
                    if (empty($existingPort)) {
                        $insertPortQuery = "INSERT INTO station_ports (station_id, port_name, charger_type, price_per_kwh, status) VALUES (?, ?, ?, ?, 'Available')";
                        executeAction($insertPortQuery, [$input['station_id'], $portName, $portType, $rate]);
                    }
                }
            }

            echo json_encode(["success" => $success, "message" => $success ? "Station synchronized" : "Failed to sync station"]);
        } else {
            echo json_encode(["success" => false, "message" => "Missing required fields"]);
        }
        break;

    case 'PUT':
        // Update station bays/status OR individual ports
        $input = json_decode(file_get_contents("php://input"), true);
        
        if (isset($input['port_id'], $input['status'])) {
            $success = executeAction("UPDATE station_ports SET status = ? WHERE port_id = ?", [$input['status'], $input['port_id']]);
            echo json_encode(["success" => $success, "message" => $success ? "Port updated" : "Failed to update port"]);
        } else if (isset($input['station_id'], $input['available_bays'], $input['status'])) {
            $query = "UPDATE stations SET available_bays = ?, status = ? WHERE station_id = ?";
            $success = executeAction($query, [$input['available_bays'], $input['status'], $input['station_id']]);
            echo json_encode(["success" => $success, "message" => $success ? "Station updated" : "Failed to update station"]);
        } else {
            echo json_encode(["success" => false, "message" => "Missing required fields"]);
        }
        break;

    case 'DELETE':
        // Delete station
        $input = json_decode(file_get_contents("php://input"), true);
        if (isset($input['station_id'])) {
            // Clear usage logs first
            executeAction("DELETE FROM usage_logs WHERE station_id = ?", [$input['station_id']]);
            $success = executeAction("DELETE FROM stations WHERE station_id = ?", [$input['station_id']]);
            
            echo json_encode(["success" => $success, "message" => $success ? "Station deleted" : "Failed to delete station"]);
        } else {
            echo json_encode(["success" => false, "message" => "Missing station_id"]);
        }
        break;

    default:
        echo json_encode(["success" => false, "message" => "Invalid method"]);
        break;
}
?>
