<?php
header('Content-Type: application/json');
require_once '../../config/database.php';

$conn = getDBConnection();

$query = "
    SELECT pr.request_id, pr.student_id, pr.student_name, pr.year_section,
           pr.room_number, pr.purpose,
           DATE_FORMAT(pr.request_time, '%h:%i %p') as request_time,
           c.course_subject, c.instructor
    FROM Pending_Requests pr
    LEFT JOIN Classes c ON pr.class_id = c.class_id
    WHERE pr.admin_decision = 'Pending'
    ORDER BY pr.request_time DESC
";

$result = $conn->query($query);

$requests = [];
while ($row = $result->fetch_assoc()) {
    $requests[] = $row;
}

$conn->close();

echo json_encode([
    'success' => true,
    'requests' => $requests
]);
?>
