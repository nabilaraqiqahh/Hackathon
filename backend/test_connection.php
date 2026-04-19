<?php
// backend/test_connection.php

// Show all errors for testing purposes
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'core_functions.php';

echo "<h2>Database Connection Test</h2>";

try {
    // 1. Test Select Query
    echo "<h3>Testing executeQuery (SELECT)</h3>";
    $stations = executeQuery("SELECT * FROM stations");
    
    if (empty($stations)) {
        echo "<p style='color: orange;'>Connection successful, but the 'stations' table is currently empty.</p>";
    } else {
        echo "<p style='color: green;'>Connection successful! Found " . count($stations) . " stations.</p>";
        echo "<pre>";
        print_r($stations);
        echo "</pre>";
    }

    echo "<hr>";

    // 2. Test Insert Query (Optional manual test)
    // To test this safely, we can insert a dummy station and then remove it, 
    // or just rely on the SELECT test if you prefer not to modify data.
    echo "<p>Your backend architecture is ready for the rest of the team!</p>";

} catch (Exception $e) {
    echo "<p style='color: red;'>An error occurred: " . $e->getMessage() . "</p>";
}
?>
