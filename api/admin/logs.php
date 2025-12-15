<?php
header('Content-Type: application/json');
require_once '../../config/database.php';

$date = isset($_GET['date']) ? $_GET['date'] : '';
$status = isset($_GET['status']) ? $_GET['status'] : '';

$conn = getDBConnection();

$query = "
    SELECT student_id, student_name, year_section, room_number,
           status, purpose,
           DATE_FORMAT(time_in, '%Y-%m-%d %h:%i %p') as time_in,
           DATE_FORMAT(time_out, '%h:%i %p') as time_out,
           CASE
               WHEN time_out IS NULL THEN 'Active'
               ELSE CONCAT(
                   FLOOR(TIMESTAMPDIFF(SECOND, time_in, time_out) / 3600), 'h ',
                   FLOOR((TIMESTAMPDIFF(SECOND, time_in, time_out) % 3600) / 60), 'm'
               )
           END as duration
    FROM Logins
    WHERE 1=1
";

$params = [];
$types = '';

if (!empty($date)) {
    $query .= " AND DATE(time_in) = ?";
    $params[] = $date;
    $types .= 's';
}

if (!empty($status)) {
    $query .= " AND status = ?";
    $params[] = $status;
    $types .= 's';
}

$query .= " ORDER BY time_in DESC LIMIT 100";

if (!empty($params)) {
    $stmt = $conn->prepare($query);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $result = $conn->query($query);
}

$logs = [];
while ($row = $result->fetch_assoc()) {
    $logs[] = $row;
}

if (!empty($params)) {
    $stmt->close();
}

$conn->close();

echo json_encode([
    'success' => true,
    'logs' => $logs
]);
?>
