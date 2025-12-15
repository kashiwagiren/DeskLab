<?php
header('Content-Type: application/json');
require_once '../../config/database.php';

$conn = getDBConnection();

$query = "
    SELECT login_id, student_id, student_name, year_section, room_number,
           status, purpose,
           DATE_FORMAT(time_in, '%h:%i %p') as time_in
    FROM Logins
    WHERE is_active = TRUE
    ORDER BY time_in DESC
";

$result = $conn->query($query);

$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}

$conn->close();

echo json_encode([
    'success' => true,
    'users' => $users
]);
?>
