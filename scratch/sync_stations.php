<?php
require_once 'backend/db_connect.php';
require_once 'backend/core_functions.php';

$OCM_API_KEY = "292877f3-6142-4c76-b36b-fb1f0524e86d";
$MELAKA_CENTER = [2.2900, 102.3000];

function fetchOCM() {
    global $OCM_API_KEY, $MELAKA_CENTER;
    $url = "https://api.openchargemap.io/v3/poi/?key=$OCM_API_KEY&latitude={$MELAKA_CENTER[0]}&longitude={$MELAKA_CENTER[1]}&distance=20&distanceunit=KM&maxresults=100&compact=true&verbose=false&output=json&countrycode=MY";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $output = curl_exec($ch);
    curl_close($ch);
    return json_decode($output, true);
}

$data = fetchOCM();
if (!$data) {
    echo "Failed to fetch from OCM";
    exit;
}

foreach ($data as $poi) {
    $sid = $poi['ID'];
    $name = $poi['AddressInfo']['Title'] ?? 'Unknown Station';
    $lat = $poi['AddressInfo']['Latitude'];
    $lng = $poi['AddressInfo']['Longitude'];
    $address = $poi['AddressInfo']['AddressLine1'] ?? '';
    $district = 'Melaka Tengah'; // Simple default
    
    // Upsert station
    $query = "INSERT INTO stations (station_id, station_name, address, latitude, longitude, district, status) 
              VALUES (?, ?, ?, ?, ?, ?, 'Available') 
              ON DUPLICATE KEY UPDATE latitude = VALUES(latitude), longitude = VALUES(longitude)";
    executeAction($query, [$sid, $name, $address, $lat, $lng, $district]);
    
    // Ensure at least one port
    $checkPort = executeQuery("SELECT port_id FROM station_ports WHERE station_id = ?", [$sid]);
    if (empty($checkPort)) {
        executeAction("INSERT INTO station_ports (station_id, port_name, charger_type, price_per_kwh, status) VALUES (?, 'Port 1', 'AC Standard', 1.20, 'Available')", [$sid]);
    }
}

echo "Sync completed. Total stations: " . count($data);
?>
