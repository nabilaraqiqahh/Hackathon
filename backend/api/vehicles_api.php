<?php
// backend/api/vehicles_api.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../db_connect.php';
require_once '../core_functions.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'OPTIONS') {
    http_response_code(200);
    exit();
}

switch ($method) {
    case 'GET':
        if (isset($_GET['user_id'])) {
            $user_id = $_GET['user_id'];
            $data = executeQuery("SELECT * FROM vehicles WHERE user_id = ?", [$user_id]);
            echo json_encode(["success" => true, "data" => $data]);
        } else {
            echo json_encode(["success" => false, "message" => "user_id is required"]);
        }
        break;

    case 'POST':
        $input = json_decode(file_get_contents("php://input"), true);
        if (isset($input['user_id'], $input['plat_no'], $input['car_model'])) {
            $query = "INSERT INTO vehicles (user_id, plat_no, car_model) VALUES (?, ?, ?)";
            $success = executeAction($query, [$input['user_id'], $input['plat_no'], $input['car_model']]);
            echo json_encode(["success" => $success, "message" => $success ? "Vehicle added successfully" : "Failed to add vehicle"]);
        } else {
            echo json_encode(["success" => false, "message" => "Missing required fields"]);
        }
        break;

    case 'PUT':
        $input = json_decode(file_get_contents("php://input"), true);
        if (isset($input['vehicle_id'], $input['plat_no'], $input['car_model'])) {
            $query = "UPDATE vehicles SET plat_no = ?, car_model = ? WHERE vehicle_id = ?";
            $success = executeAction($query, [$input['plat_no'], $input['car_model'], $input['vehicle_id']]);
            echo json_encode(["success" => $success, "message" => $success ? "Vehicle updated successfully" : "Failed to update vehicle"]);
        } else {
            echo json_encode(["success" => false, "message" => "Missing required fields"]);
        }
        break;

    case 'DELETE':
        $input = json_decode(file_get_contents("php://input"), true);
        if (isset($input['vehicle_id'])) {
            $query = "DELETE FROM vehicles WHERE vehicle_id = ?";
            $success = executeAction($query, [$input['vehicle_id']]);
            echo json_encode(["success" => $success, "message" => $success ? "Vehicle deleted successfully" : "Failed to delete vehicle"]);
        } else {
            echo json_encode(["success" => false, "message" => "vehicle_id is required"]);
        }
        break;

    default:
        echo json_encode(["success" => false, "message" => "Invalid method"]);
        break;
}
?>
