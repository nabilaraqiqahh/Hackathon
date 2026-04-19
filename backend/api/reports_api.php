<?php
// backend/api/reports_api.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once '../core_functions.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Member 4: District Demand Report
    // This query joins stations and usage_logs to calculate total energy consumed and number of sessions per district
    
    $query = "
        SELECT 
            s.district, 
            COUNT(u.log_id) AS total_sessions, 
            COALESCE(SUM(u.energy_consumed), 0) AS total_energy_consumed,
            COUNT(DISTINCT s.station_id) AS total_stations
        FROM 
            stations s
        LEFT JOIN 
            usage_logs u ON s.station_id = u.station_id
        GROUP BY 
            s.district
        ORDER BY 
            total_energy_consumed DESC
    ";
    
    $reportData = executeQuery($query);
    
    echo json_encode([
        "success" => true, 
        "report_name" => "District Demand Report",
        "data" => $reportData
    ]);

} else {
    echo json_encode(["success" => false, "message" => "Invalid method, use GET"]);
}
?>
