<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
// This line below is what is currently missing and causing the red errors
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle the browser's preflight check
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../core_functions.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['user_id'])) {
            $query = "SELECT r.*, u.full_name, COALESCE(s.station_name, r.station_name) as station_name, COALESCE(s.district, '') as district 
                      FROM reservations r 
                      LEFT JOIN users u ON r.user_id = u.user_id 
                      LEFT JOIN stations s ON r.station_id = s.station_id 
                      WHERE r.user_id = ? 
                      ORDER BY r.reservation_date DESC, r.reservation_time DESC";
            $data = executeQuery($query, [$_GET['user_id']]);
        } else {
            $query = "SELECT r.*, u.full_name, COALESCE(s.station_name, 'Unknown Station') as station_name, COALESCE(s.district, '') as district 
                      FROM reservations r 
                      LEFT JOIN users u ON r.user_id = u.user_id 
                      LEFT JOIN stations s ON r.station_id = s.station_id 
                      ORDER BY r.reservation_date DESC";
            $data = executeQuery($query);
        }
        echo json_encode(["success" => true, "data" => $data]);
        break;

    case 'POST':
        $input = json_decode(file_get_contents("php://input"), true);
        
        if (isset($input['user_id'], $input['station_id'])) {
            
            // 1. AUTO-FILL defaults if missing from Checkout screen
            $res_date = $input['reservation_date'] ?? date('Y-m-d');
            $res_time = $input['reservation_time'] ?? date('H:i:s');
            $status   = $input['status'] ?? 'Confirmed';
            $user_id  = is_numeric($input['user_id']) ? (int)$input['user_id'] : 2; // Default to Rafiq if dummy ID
            $connector = $input['connector'] ?? 'Port 1';
            $target_amount = $input['targetAmount'] ?? 0;

            try {
                // 2. JIT SYNC: Ensure Station exists (Prevent Foreign Key Error)
                $syncStation = "INSERT INTO stations (station_id, station_name, district) 
                                VALUES (?, ?, ?) 
                                ON DUPLICATE KEY UPDATE station_name = VALUES(station_name)";
                executeAction($syncStation, [
                    $input['station_id'], 
                    $input['station_name'] ?? 'Unknown Station', 
                    $input['district'] ?? 'Melaka Tengah'
                ]);

                // 3. JIT SYNC: Ensure Port exists (Robust Lookup)
                $port_id = null;
                $portSearchName = null;
                if (preg_match('/Port \d+/', $connector, $matches)) {
                    $portSearchName = $matches[0];
                } else {
                    // Fallback: If no port number in string, check if it's the only port or use "Port 1"
                    $portSearchName = 'Port 1';
                }

                $portCheck = executeQuery("SELECT port_id FROM station_ports WHERE station_id = ? AND port_name = ?", [$input['station_id'], $portSearchName]);
                
                if (empty($portCheck)) {
                    // If still not found, just take the first available port for this station
                    $anyPort = executeQuery("SELECT port_id FROM station_ports WHERE station_id = ? LIMIT 1", [$input['station_id']]);
                    if (!empty($anyPort)) {
                        $port_id = $anyPort[0]['port_id'];
                    } else {
                        // Truly missing? Create it.
                        $port_id = executeInsert("INSERT INTO station_ports (station_id, port_name, charger_type, price_per_kwh, status) VALUES (?, ?, ?, ?, 'Available')", 
                                                [$input['station_id'], $portSearchName, $input['power'] ?? 'DC Fast', 1.20]);
                    }
                } else {
                    $port_id = $portCheck[0]['port_id'];
                }

                // 4. INSERT FINAL RESERVATION
                $query = "INSERT INTO reservations (user_id, station_id, port_id, station_name, reservation_date, reservation_time, status, duration, connector, power, target_amount) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

                $new_res_id = executeInsert($query, [
                    $user_id, 
                    $input['station_id'], 
                    $port_id, 
                    $input['station_name'] ?? 'Unknown Station',
                    $res_date,
                    $res_time,
                    $status, 
                    $input['duration'] ?? null, 
                    $connector, 
                    $input['power'] ?? null,
                    $target_amount
                ]);
                if ($new_res_id) {
                    // 5. UPDATE PORT STATUS TO OCCUPIED
                    if ($port_id) {
                        executeAction("UPDATE station_ports SET status = 'Occupied' WHERE port_id = ?", [$port_id]);
                    }

                    echo json_encode([
                        "success" => true, 
                        "message" => "Reservation created successfully", 
                        "reservation_id" => $new_res_id
                    ]);
                } else {
                    echo json_encode([
                        "success" => false, 
                        "message" => "Failed to insert reservation"
                    ]);
                }
            } catch (Exception $e) {
                echo json_encode([
                    "success" => false, 
                    "message" => "Error creating reservation: " . $e->getMessage()
                ]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Missing user_id or station_id"]);
        }
        break;

    case 'PUT':
        $input = json_decode(file_get_contents("php://input"), true);
        if (isset($input['reservation_id'], $input['status'])) {
            $actual_cost = $input['actualCost'] ?? null;
            $actual_duration = $input['actualDuration'] ?? null;
            $actual_energy = $input['actualEnergy'] ?? null;
            
            $query = "UPDATE reservations SET status = ?, actual_cost = COALESCE(?, actual_cost), actual_duration = COALESCE(?, actual_duration), actual_energy = COALESCE(?, actual_energy) WHERE reservation_id = ?";
            $success = executeAction($query, [
                $input['status'],
                $actual_cost,
                $actual_duration,
                $actual_energy,
                $input['reservation_id']
            ]);

            // 2. IF COMPLETED, RELEASE THE PORT
            if ($success && $input['status'] === 'Completed') {
                $res = executeQuery("SELECT port_id FROM reservations WHERE reservation_id = ?", [$input['reservation_id']]);
                if (!empty($res) && $res[0]['port_id']) {
                    executeAction("UPDATE station_ports SET status = 'Available' WHERE port_id = ?", [$res[0]['port_id']]);
                }
            }

            echo json_encode(["success" => $success]);
        }
        break;

    case 'DELETE':
        $input = json_decode(file_get_contents("php://input"), true);
        if (isset($input['reservation_id'])) {
            $success = executeAction("DELETE FROM reservations WHERE reservation_id = ?", [$input['reservation_id']]);
            echo json_encode(["success" => $success]);
        }
        break;

    default:
        echo json_encode(["success" => false, "message" => "Invalid method"]);
        break;
}
?>