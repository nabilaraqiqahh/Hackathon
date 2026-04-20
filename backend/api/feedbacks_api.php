<?php
// backend/api/feedbacks_api.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
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
        // Only admins should really get this, but we'll fetch all for simplicity
        $data = executeQuery("SELECT f.*, u.full_name as user_name FROM feedbacks f LEFT JOIN users u ON f.user_id = u.user_id ORDER BY f.submitted_at DESC");
        echo json_encode(["success" => true, "data" => $data]);
        break;

    case 'POST':
        $input = json_decode(file_get_contents("php://input"), true);
        if (isset($input['user_id'], $input['feedback_type'], $input['message'])) {
            $station = $input['station_name'] ?? null;
            $query = "INSERT INTO feedbacks (user_id, feedback_type, station_name, message) VALUES (?, ?, ?, ?)";
            $success = executeAction($query, [$input['user_id'], $input['feedback_type'], $station, $input['message']]);
            echo json_encode(["success" => $success, "message" => $success ? "Feedback submitted successfully" : "Failed to submit feedback"]);
        } else {
            echo json_encode(["success" => false, "message" => "Missing required fields"]);
        }
        break;

    default:
        echo json_encode(["success" => false, "message" => "Invalid method"]);
        break;
}
?>
