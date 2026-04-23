<?php
require_once 'backend/core_functions.php';
$admin = executeQuery("SELECT email, password FROM users WHERE user_type = 'Admin' LIMIT 1");
echo json_encode($admin);
?>
