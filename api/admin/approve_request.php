<?php
header('Content-Type: application/json');
require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$requestId = isset($input['request_id']) ? intval($input['request_id']) : 0;
$decision = isset($input['decision']) ? trim($input['decision']) : '';

if ($requestId <= 0 || !in_array($decision, ['Accepted', 'Rejected'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid parameters']);
    exit;
}

$conn = getDBConnection();

// Update the request
$updateQuery = $conn->prepare("
    UPDATE Pending_Requests
    SET admin_decision = ?, decided_at = NOW()
    WHERE request_id = ?
");

$updateQuery->bind_param('si', $decision, $requestId);
$updateQuery->execute();
$updateQuery->close();
$conn->close();

echo json_encode([
    'success' => true,
    'message' => "Request {$decision}"
]);
?>
