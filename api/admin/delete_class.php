<?php
header('Content-Type: application/json');
require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$classId = isset($input['class_id']) ? intval($input['class_id']) : 0;

if ($classId <= 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid class ID']);
    exit;
}

$conn = getDBConnection();

$deleteQuery = $conn->prepare("DELETE FROM Classes WHERE class_id = ?");
$deleteQuery->bind_param('i', $classId);
$deleteQuery->execute();
$deleteQuery->close();
$conn->close();

echo json_encode([
    'success' => true,
    'message' => 'Class deleted successfully'
]);
?>
