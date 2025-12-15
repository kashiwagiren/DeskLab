<?php
header('Content-Type: application/json');
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit;
}

$requestId = isset($_GET['request_id']) ? intval($_GET['request_id']) : 0;

if ($requestId <= 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid request ID']);
    exit;
}

$conn = getDBConnection();

$query = $conn->prepare("
    SELECT admin_decision, student_id, student_name, year_section, room_number, class_id, purpose
    FROM Pending_Requests
    WHERE request_id = ?
");

$query->bind_param('i', $requestId);
$query->execute();
$result = $query->get_result();

if ($result->num_rows === 0) {
    $query->close();
    $conn->close();
    echo json_encode(['success' => false, 'error' => 'Request not found']);
    exit;
}

$request = $result->fetch_assoc();
$decision = $request['admin_decision'];

$query->close();

if ($decision === 'Accepted') {
    // Create login entry
    $loginQuery = $conn->prepare("
        INSERT INTO Logins (student_id, student_name, year_section, room_number, class_id, purpose, status)
        VALUES (?, ?, ?, ?, ?, ?, 'Admin Approved')
    ");

    $loginQuery->bind_param(
        'ssssis',
        $request['student_id'],
        $request['student_name'],
        $request['year_section'],
        $request['room_number'],
        $request['class_id'],
        $request['purpose']
    );

    $loginQuery->execute();
    $loginId = $conn->insert_id;
    $loginQuery->close();

    $conn->close();

    echo json_encode([
        'success' => true,
        'decision' => 'Accepted',
        'login_id' => $loginId,
        'message' => 'Your request has been approved!'
    ]);
} elseif ($decision === 'Rejected') {
    $conn->close();

    echo json_encode([
        'success' => true,
        'decision' => 'Rejected',
        'message' => 'Your request has been rejected.'
    ]);
} else {
    $conn->close();

    echo json_encode([
        'success' => true,
        'decision' => 'Pending',
        'message' => 'Your request is still pending.'
    ]);
}
?>
