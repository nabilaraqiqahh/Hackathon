<?php
require_once 'backend/db_connect.php';
require_once 'backend/core_functions.php';
$stations = executeQuery("SELECT station_id, station_name, status FROM stations LIMIT 5");
$ports = executeQuery("SELECT station_id, port_name, status FROM station_ports LIMIT 10");
echo json_encode(["stations" => $stations, "ports" => $ports], JSON_PRETTY_PRINT);
?>
