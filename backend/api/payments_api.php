<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
// This line below is what is currently missing and causing the red errors
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle the browser's preflight check
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../core_functions.php';
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Fetch payments for a specific user, or all payments
        if (isset($_GET['user_id'])) {
            $data = executeQuery("SELECT * FROM payments WHERE user_id = ? ORDER BY payment_date DESC", [$_GET['user_id']]);
        } else {
            // Usually we'd join with users table to get names
            $query = "SELECT p.*, u.full_name FROM payments p JOIN users u ON p.user_id = u.user_id ORDER BY p.payment_date DESC";
            $data = executeQuery($query);
        }
        echo json_encode(["success" => true, "data" => $data]);
        break;

    case 'POST':
        // Create new payment
        $input = json_decode(file_get_contents("php://input"), true);
        if (isset($input['transaction_id'], $input['user_id'], $input['amount'])) {
            $payment_date = $input['payment_date'] ?? date('Y-m-d');
            $status = $input['status'] ?? 'Success';
            $payment_method = $input['payment_method'] ?? null;
            $energy = $input['energy'] ?? null;
            $receipt_no = $input['receipt_no'] ?? null;
            
            // Sanitize user_id (if it's a dummy ID like 'D001', default to 2)
            $user_id = is_numeric($input['user_id']) ? (int)$input['user_id'] : 2;

            $query = "INSERT INTO payments (transaction_id, user_id, amount, payment_method, energy, receipt_no, payment_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $success = executeAction($query, [$input['transaction_id'], $user_id, $input['amount'], $payment_method, $energy, $receipt_no, $payment_date, $status]);
            
            echo json_encode(["success" => $success, "message" => $success ? "Payment recorded" : "Failed to record payment"]);
        } else {
            echo json_encode(["success" => false, "message" => "Missing required fields"]);
        }
        break;

    default:
        echo json_encode(["success" => false, "message" => "Invalid method"]);
        break;
}
?>
