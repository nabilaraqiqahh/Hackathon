<?php
// backend/db_connect.php

$host = '127.0.0.1'; // Default XAMPP host
$dbname = 'volt_park'; // The name of your database
$username = 'root'; // Default XAMPP username
$password = ''; // Default XAMPP password is empty

try {
    // Create a new PDO instance
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    
    // Set the PDO error mode to exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Set default fetch mode to associative array
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
} catch(PDOException $e) {
    // If the connection fails, show a clean error message
    die("Database Connection Failed: " . $e->getMessage() . " - Please check if XAMPP is running and the database 'volt_park' exists.");
}
?>
