<?php
// test_api.php
require_once 'backend/db_connect.php';

$input = [
    'station_id' => 999999,
    'station_name' => 'Test Station',
    'district' => 'Melaka Tengah'
];

try {
    $stmt = $conn->prepare("INSERT INTO stations (station_id, station_name, district) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE station_name = VALUES(station_name)");
    $stmt->execute([$input['station_id'], $input['station_name'], $input['district']]);
    echo "Station insert success.\n";
} catch (PDOException $e) {
    echo "Station insert failed: " . $e->getMessage() . "\n";
}

$resInput = [
    'user_id' => 1, // assuming user_id 1 exists (Nabil)
    'station_id' => 999999,
    'reservation_date' => '2026-04-20',
    'reservation_time' => '14:00',
    'status' => 'Confirmed'
];

try {
    $stmt = $conn->prepare("INSERT INTO reservations (user_id, station_id, reservation_date, reservation_time, status) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$resInput['user_id'], $resInput['station_id'], $resInput['reservation_date'], $resInput['reservation_time'], $resInput['status']]);
    echo "Reservation insert success.\n";
} catch (PDOException $e) {
    echo "Reservation insert failed: " . $e->getMessage() . "\n";
}
