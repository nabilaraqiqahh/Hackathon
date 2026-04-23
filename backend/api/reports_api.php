<?php
// backend/api/reports_api.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once '../core_functions.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $reportType = $_GET['type'] ?? 'district_demand';
    
    switch ($reportType) {
        case 'revenue_analysis':
            // 1. REVENUE BY DISTRICT (JOIN + SUM + GROUP BY)
            $query = "
                SELECT 
                    s.district, 
                    SUM(r.actual_cost) AS total_revenue,
                    AVG(r.actual_cost) AS avg_revenue_per_session,
                    COUNT(r.reservation_id) AS total_sessions
                FROM 
                    stations s
                INNER JOIN 
                    reservations r ON s.station_id = r.station_id
                WHERE 
                    r.status = 'Completed'
                GROUP BY 
                    s.district
                ORDER BY 
                    total_revenue DESC
            ";
            break;

        case 'station_performance':
            // 2. STATION PERFORMANCE (JOIN + COUNT + AVG + SUBQUERY)
            $query = "
                SELECT 
                    s.station_name,
                    s.district,
                    COUNT(r.reservation_id) AS session_count,
                    COALESCE(AVG(r.actual_energy), 0) AS avg_energy_delivered,
                    (SELECT COUNT(*) FROM station_ports sp WHERE sp.station_id = s.station_id) AS port_count
                FROM 
                    stations s
                LEFT JOIN 
                    reservations r ON s.station_id = r.station_id
                GROUP BY 
                    s.station_id
                ORDER BY 
                    session_count DESC
                LIMIT 10
            ";
            break;

        case 'district_demand':
        default:
            // 3. DISTRICT DEMAND (JOIN + COUNT + SUM + COALESCE)
            $query = "
                SELECT 
                    s.district, 
                    COUNT(r.reservation_id) AS total_sessions, 
                    COALESCE(SUM(r.actual_energy), 0) AS total_energy_consumed,
                    COUNT(DISTINCT s.station_id) AS active_stations
                FROM 
                    stations s
                LEFT JOIN 
                    reservations r ON s.station_id = r.station_id
                GROUP BY 
                    s.district
                ORDER BY 
                    total_sessions DESC
            ";
            break;
    }
    
    $reportData = executeQuery($query);
    
    echo json_encode([
        "success" => true, 
        "report_type" => $reportType,
        "data" => $reportData
    ]);
}
 else {
    echo json_encode(["success" => false, "message" => "Invalid method, use GET"]);
}
?>
