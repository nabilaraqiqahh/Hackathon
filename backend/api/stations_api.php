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
        // Fetch specific station or all stations
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            $data = executeQuery("SELECT * FROM stations WHERE station_id = ?", [$id]);
        } else {
            $data = executeQuery("SELECT * FROM stations");
        }
        echo json_encode(["success" => true, "data" => $data]);
        break;

    case 'POST':
        // Add new station
        $input = json_decode(file_get_contents("php://input"), true);
        if (isset($input['station_name'], $input['district'], $input['total_bays'])) {
            $available_bays = $input['available_bays'] ?? $input['total_bays'];
            $status = $input['status'] ?? 'Active';
            
            $query = "INSERT INTO stations (station_name, district, total_bays, available_bays, status) VALUES (?, ?, ?, ?, ?)";
            $success = executeAction($query, [$input['station_name'], $input['district'], $input['total_bays'], $available_bays, $status]);
            
            echo json_encode(["success" => $success, "message" => $success ? "Station created" : "Failed to create station"]);
        } else {
            echo json_encode(["success" => false, "message" => "Missing required fields"]);
        }
        break;

    case 'PUT':
        // Update station bays/status
        $input = json_decode(file_get_contents("php://input"), true);
        if (isset($input['station_id'], $input['available_bays'], $input['status'])) {
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
