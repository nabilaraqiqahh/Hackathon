<?php
// backend/api/reservations_api.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");

require_once '../core_functions.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Fetch reservations for a user, or all
        if (isset($_GET['user_id'])) {
            $query = "SELECT r.*, s.station_name, s.district FROM reservations r JOIN stations s ON r.station_id = s.station_id WHERE r.user_id = ? ORDER BY r.reservation_date DESC, r.reservation_time DESC";
            $data = executeQuery($query, [$_GET['user_id']]);
        } else {
            $query = "SELECT r.*, u.full_name, s.station_name, s.district FROM reservations r JOIN users u ON r.user_id = u.user_id JOIN stations s ON r.station_id = s.station_id ORDER BY r.reservation_date DESC";
            $data = executeQuery($query);
        }
        echo json_encode(["success" => true, "data" => $data]);
        break;

    case 'POST':
        // Create new reservation
        $input = json_decode(file_get_contents("php://input"), true);
        if (isset($input['user_id'], $input['station_id'], $input['reservation_date'], $input['reservation_time'])) {
            $status = $input['status'] ?? 'Confirmed';
            
            $query = "INSERT INTO reservations (user_id, station_id, reservation_date, reservation_time, status) VALUES (?, ?, ?, ?, ?)";
            $new_res_id = executeInsert($query, [$input['user_id'], $input['station_id'], $input['reservation_date'], $input['reservation_time'], $status]);
            
            echo json_encode(["success" => (bool)$new_res_id, "message" => $new_res_id ? "Reservation created" : "Failed to create reservation", "reservation_id" => $new_res_id]);
        } else {
            echo json_encode(["success" => false, "message" => "Missing required fields"]);
        }
        break;

    case 'PUT':
        // Update reservation status
        $input = json_decode(file_get_contents("php://input"), true);
        if (isset($input['reservation_id'], $input['status'])) {
            $query = "UPDATE reservations SET status = ? WHERE reservation_id = ?";
            $success = executeAction($query, [$input['status'], $input['reservation_id']]);
            
            echo json_encode(["success" => $success, "message" => $success ? "Reservation updated" : "Failed to update reservation"]);
        } else {
            echo json_encode(["success" => false, "message" => "Missing required fields"]);
        }
        break;

    case 'DELETE':
        $input = json_decode(file_get_contents("php://input"), true);
        if (isset($input['reservation_id'])) {
            $success = executeAction("DELETE FROM reservations WHERE reservation_id = ?", [$input['reservation_id']]);
            echo json_encode(["success" => $success, "message" => $success ? "Reservation deleted" : "Failed to delete reservation"]);
        } else {
            echo json_encode(["success" => false, "message" => "Missing reservation_id"]);
        }
        break;

    default:
        echo json_encode(["success" => false, "message" => "Invalid method"]);
        break;
}
?>
