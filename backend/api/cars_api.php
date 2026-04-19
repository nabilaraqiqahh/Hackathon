<?php
// backend/api/cars_api.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once '../core_functions.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch all brands and models to populate frontend dropdowns
    $brands = executeQuery("SELECT * FROM car_brands ORDER BY brand_name ASC");
    $models = executeQuery("SELECT * FROM car_models ORDER BY model_name ASC");
    
    echo json_encode([
        "success" => true,
        "data" => [
            "brands" => $brands,
            "models" => $models
        ]
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Invalid method, use GET"]);
}
?>
