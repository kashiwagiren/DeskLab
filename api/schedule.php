<?php
header('Content-Type: application/json');
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit;
}

$room = isset($_GET['room']) ? trim($_GET['room']) : '';

if (empty($room)) {
    echo json_encode(['success' => false, 'error' => 'Room number is required']);
    exit;
}

$conn = getDBConnection();

// Get current day
$currentDay = strtoupper(date('D')); // MON, TUE, WED, THU, FRI, SAT, SUN

// Query classes for this room
$query = "SELECT edp_code, course_subject, instructor,
          DATE_FORMAT(start_time, '%h:%i%p') as start_time,
          DATE_FORMAT(end_time, '%h:%i%p') as end_time,
          days
          FROM Classes
          WHERE room_number = ?
          ORDER BY start_time";

$stmt = $conn->prepare($query);
$stmt->bind_param('s', $room);
$stmt->execute();
$result = $stmt->get_result();

$classes = [];
while ($row = $result->fetch_assoc()) {
    $classes[] = $row;
}

$stmt->close();
$conn->close();

echo json_encode([
    'success' => true,
    'classes' => $classes,
    'room' => $room
]);
?>
