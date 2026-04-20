<?php
// backend/api/auth_api.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once '../core_functions.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    
    if (isset($input['email'], $input['password'])) {
        $email = $input['email'];
        $password = $input['password'];
        
        $query = "SELECT * FROM users WHERE email = ? AND password = ?";
        $users = executeQuery($query, [$email, $password]);
        
        if (count($users) > 0) {
            $user = $users[0];
            // Remove password from response
            unset($user['password']);
            
            echo json_encode([
                "success" => true,
                "message" => "Login successful",
                "user" => $user
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "Invalid email or password"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Email and password required"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid method, use POST"]);
}
?>
