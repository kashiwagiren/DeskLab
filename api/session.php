<?php
header('Content-Type: application/json');
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit;
}

$loginId = isset($_GET['login_id']) ? intval($_GET['login_id']) : 0;

if ($loginId <= 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid login ID']);
    exit;
}

$conn = getDBConnection();

$query = $conn->prepare("
    SELECT student_id, student_name, year_section, room_number, status,
           DATE_FORMAT(time_in, '%h:%i %p') as time_in,
           time_in as time_in_full,
           time_out,
           is_active
    FROM Logins
    WHERE login_id = ?
");

$query->bind_param('i', $loginId);
$query->execute();
$result = $query->get_result();

if ($result->num_rows === 0) {
    $query->close();
    $conn->close();
    echo json_encode(['success' => false, 'error' => 'Session not found']);
    exit;
}

$session = $result->fetch_assoc();

$query->close();
$conn->close();

// Return session data regardless of active status so client can handle it
echo json_encode([
    'success' => true,
    'session' => $session,
    'is_active' => (bool)$session['is_active']
]);
?>
