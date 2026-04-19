<?php
// backend/core_functions.php
require_once 'db_connect.php';

/**
 * Execute a SELECT query and return all matching rows.
 * Used for fetching data (e.g., retrieving users, stations, generating reports).
 * 
 * @param string $query The SQL query
 * @param array $params The parameters to bind (optional)
 * @return array The fetched data
 */
function executeQuery($query, $params = []) {
    global $pdo;
    try {
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll();
    } catch(PDOException $e) {
        die("Query Failed: " . $e->getMessage());
    }
}

/**
 * Execute an INSERT, UPDATE, or DELETE query.
 * Used for CRUD operations.
 * 
 * @param string $query The SQL query
 * @param array $params The parameters to bind (optional)
 * @return bool True if successful, throws error otherwise
 */
function executeAction($query, $params = []) {
    global $pdo;
    try {
        $stmt = $pdo->prepare($query);
        return $stmt->execute($params);
    } catch(PDOException $e) {
        die("Action Failed: " . $e->getMessage());
    }
}

/**
 * Execute an INSERT query and return the last inserted ID.
 * 
 * @param string $query The SQL query
 * @param array $params The parameters to bind (optional)
 * @return string The last inserted ID
 */
function executeInsert($query, $params = []) {
    global $pdo;
    try {
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        return $pdo->lastInsertId();
    } catch(PDOException $e) {
        die("Insert Failed: " . $e->getMessage());
    }
}
?>
