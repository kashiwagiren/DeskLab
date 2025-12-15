<?php
header('Content-Type: application/json');
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$loginId = isset($input['login_id']) ? intval($input['login_id']) : 0;

if ($loginId <= 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid login ID']);
    exit;
}

$conn = getDBConnection();

// Update login record to set time_out and is_active = false
$updateQuery = $conn->prepare("
    UPDATE Logins
    SET time_out = NOW(), is_active = FALSE
    WHERE login_id = ? AND is_active = TRUE
");

$updateQuery->bind_param('i', $loginId);
$updateQuery->execute();
$affected = $updateQuery->affected_rows;
$updateQuery->close();
$conn->close();

if ($affected > 0) {
    echo json_encode([
        'success' => true,
        'message' => 'Logged out successfully'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Session not found or already logged out'
    ]);
}
?>
