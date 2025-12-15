<?php
header('Content-Type: application/json');
require_once '../config/database.php';

$conn = getDBConnection();

// Get all unique room numbers from Classes table
$query = "SELECT DISTINCT room_number FROM Classes ORDER BY room_number";
$result = $conn->query($query);

$rooms = [];
while ($row = $result->fetch_assoc()) {
    $rooms[] = $row['room_number'];
}

$conn->close();

echo json_encode([
    'success' => true,
    'rooms' => $rooms
]);
?>
