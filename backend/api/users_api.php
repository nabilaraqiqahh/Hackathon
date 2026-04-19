<?php
// backend/api/users_api.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../core_functions.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Fetch specific user or all users
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            $data = executeQuery("SELECT * FROM users WHERE user_id = ?", [$id]);
        } else {
            $data = executeQuery("SELECT * FROM users");
        }
        echo json_encode(["success" => true, "data" => $data]);
        break;

    case 'POST':
        // Create new user
        $input = json_decode(file_get_contents("php://input"), true);
        if (isset($input['full_name'], $input['email'])) {
            $car_model = $input['car_model'] ?? null;
            $user_type = $input['user_type'] ?? 'Driver';
            
            $query = "INSERT INTO users (full_name, email, car_model, user_type) VALUES (?, ?, ?, ?)";
            $success = executeAction($query, [$input['full_name'], $input['email'], $car_model, $user_type]);
            
            echo json_encode(["success" => $success, "message" => $success ? "User created" : "Failed to create user"]);
        } else {
            echo json_encode(["success" => false, "message" => "Missing required fields"]);
        }
        break;

    case 'PUT':
        // Update user
        $input = json_decode(file_get_contents("php://input"), true);
        if (isset($input['user_id'])) {
            // Simplified update logic (assume all fields provided for simplicity)
            $query = "UPDATE users SET full_name = ?, car_model = ?, user_type = ? WHERE user_id = ?";
            $success = executeAction($query, [$input['full_name'], $input['car_model'], $input['user_type'], $input['user_id']]);
            
            echo json_encode(["success" => $success, "message" => $success ? "User updated" : "Failed to update user"]);
        } else {
            echo json_encode(["success" => false, "message" => "Missing user_id"]);
        }
        break;

    case 'DELETE':
        // Delete user
        $input = json_decode(file_get_contents("php://input"), true);
        if (isset($input['user_id'])) {
            // WARNING: In a real app, delete associated usage_logs first to avoid foreign key constraints errors
            executeAction("DELETE FROM usage_logs WHERE user_id = ?", [$input['user_id']]);
            $success = executeAction("DELETE FROM users WHERE user_id = ?", [$input['user_id']]);
            
            echo json_encode(["success" => $success, "message" => $success ? "User deleted" : "Failed to delete user"]);
        } else {
            echo json_encode(["success" => false, "message" => "Missing user_id"]);
        }
        break;

    default:
        echo json_encode(["success" => false, "message" => "Invalid method"]);
        break;
}
?>
