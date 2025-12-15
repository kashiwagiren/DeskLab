<?php
header('Content-Type: application/json');
require_once '../../config/database.php';

$conn = getDBConnection();

$query = "
    SELECT class_id, edp_code, course_subject, instructor, room_number,
           DATE_FORMAT(start_time, '%h:%i %p') as start_time,
           DATE_FORMAT(end_time, '%h:%i %p') as end_time,
           days
    FROM Classes
    ORDER BY room_number, start_time
";

$result = $conn->query($query);

$classes = [];
while ($row = $result->fetch_assoc()) {
    $classes[] = $row;
}

$conn->close();

echo json_encode([
    'success' => true,
    'classes' => $classes
]);
?>
