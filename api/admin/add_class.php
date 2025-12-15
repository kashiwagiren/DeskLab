<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$edpCode = isset($input['edp_code']) ? trim($input['edp_code']) : '';
$courseSubject = isset($input['course_subject']) ? trim($input['course_subject']) : '';
$instructor = isset($input['instructor']) ? trim($input['instructor']) : '';
$roomNumber = isset($input['room_number']) ? trim($input['room_number']) : '';
$startTime = isset($input['start_time']) ? trim($input['start_time']) : '';
$endTime = isset($input['end_time']) ? trim($input['end_time']) : '';
$days = isset($input['days']) ? trim($input['days']) : '';

if (empty($edpCode) || empty($courseSubject) || empty($instructor) || empty($roomNumber) || empty($startTime) || empty($endTime) || empty($days)) {
    echo json_encode(['success' => false, 'error' => 'All fields are required']);
    exit;
}

if (!preg_match('/^\d{5}$/', $edpCode)) {
    echo json_encode(['success' => false, 'error' => 'EDP code must be 5 digits']);
    exit;
}

$conn = getDBConnection();

// Check if EDP code already exists
$checkQuery = $conn->prepare("SELECT edp_code FROM Classes WHERE edp_code = ?");
$checkQuery->bind_param('s', $edpCode);
$checkQuery->execute();
$exists = $checkQuery->get_result()->num_rows > 0;
$checkQuery->close();

if ($exists) {
    $conn->close();
    echo json_encode(['success' => false, 'error' => 'EDP code already exists']);
    exit;
}

// Insert class
$insertQuery = $conn->prepare("
    INSERT INTO Classes (edp_code, course_subject, instructor, room_number, start_time, end_time, days)
    VALUES (?, ?, ?, ?, ?, ?, ?)
");

if (!$insertQuery) {
    $conn->close();
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $conn->error]);
    exit;
}

$insertQuery->bind_param('sssssss', $edpCode, $courseSubject, $instructor, $roomNumber, $startTime, $endTime, $days);

if (!$insertQuery->execute()) {
    $error = $insertQuery->error;
    $insertQuery->close();
    $conn->close();
    echo json_encode(['success' => false, 'error' => 'Failed to add class: ' . $error]);
    exit;
}

$insertQuery->close();
$conn->close();

echo json_encode([
    'success' => true,
    'message' => 'Class added successfully'
]);
?>
