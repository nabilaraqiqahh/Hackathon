<?php
// backend/core_functions.php
require_once 'db_connect.php';

/**
 * Execute a SELECT query and return matching rows.
 */
function executeQuery($query, $params = []) {
    global $pdo;
    try {
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch(PDOException $e) {
        header('Content-Type: application/json');
        echo json_encode(["success" => false, "message" => "DB Error: " . $e->getMessage()]);
        exit();
    }
}

/**
 * Execute an INSERT, UPDATE, or DELETE query.
 */
function executeAction($query, $params = []) {
    global $pdo;
    try {
        $stmt = $pdo->prepare($query);
        return $stmt->execute($params);
    } catch(PDOException $e) {
        header('Content-Type: application/json');
        echo json_encode(["success" => false, "message" => "DB Error: " . $e->getMessage()]);
        exit();
    }
}

/**
 * Execute an INSERT and return the last inserted ID.
 */
function executeInsert($query, $params = []) {
    global $pdo;
    try {
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        return $pdo->lastInsertId();
    } catch(PDOException $e) {
        header('Content-Type: application/json');
        echo json_encode(["success" => false, "message" => "DB Error: " . $e->getMessage()]);
        exit();
    }
}
?>