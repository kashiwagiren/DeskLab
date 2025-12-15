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

// Get current time and day
$currentTime = date('H:i:s');
$currentDay = strtoupper(date('D'));

// Calculate time 10 minutes from now
$tenMinutesLater = date('H:i:s', strtotime('+10 minutes'));

// Check if there's a class starting within the next 10 minutes
$query = $conn->prepare("
    SELECT class_id, course_subject, instructor, start_time,
           TIME_FORMAT(start_time, '%h:%i %p') as start_time_formatted,
           TIMESTAMPDIFF(MINUTE, NOW(), CONCAT(CURDATE(), ' ', start_time)) as minutes_until_start
    FROM Classes
    WHERE room_number = ?
    AND start_time > ?
    AND start_time <= ?
    AND FIND_IN_SET(?, REPLACE(days, ', ', ',')) > 0
    LIMIT 1
");

$query->bind_param('ssss', $room, $currentTime, $tenMinutesLater, $currentDay);
$query->execute();
$result = $query->get_result();

if ($result->num_rows > 0) {
    $class = $result->fetch_assoc();
    $minutesRemaining = $class['minutes_until_start'];

    // Check if class has already started (0 or negative minutes)
    if ($minutesRemaining <= 0) {
        // Class has started - force logout all active sessions in this room
        $logoutQuery = $conn->prepare("
            UPDATE Logins
            SET time_out = NOW(), is_active = FALSE
            WHERE room_number = ? AND is_active = TRUE
        ");
        $logoutQuery->bind_param('s', $room);
        $logoutQuery->execute();
        $logoutQuery->close();

        $query->close();
        $conn->close();

        echo json_encode([
            'success' => true,
            'force_logout' => true,
            'message' => "Class has started. You have been logged out automatically.",
            'class_info' => $class
        ]);
    } else {
        // Class is upcoming (1-10 minutes)
        $query->close();
        $conn->close();

        echo json_encode([
            'success' => true,
            'warning' => true,
            'message' => "A class ({$class['course_subject']}) will start in {$minutesRemaining} minutes. Please prepare to log out.",
            'minutes_remaining' => $minutesRemaining,
            'class_info' => $class
        ]);
    }
} else {
    // Check if a class is currently running
    $currentClassQuery = $conn->prepare("
        SELECT class_id, course_subject, instructor
        FROM Classes
        WHERE room_number = ?
        AND start_time <= ?
        AND end_time >= ?
        AND FIND_IN_SET(?, REPLACE(days, ', ', ',')) > 0
        LIMIT 1
    ");

    $currentClassQuery->bind_param('ssss', $room, $currentTime, $currentTime, $currentDay);
    $currentClassQuery->execute();
    $currentClassResult = $currentClassQuery->get_result();

    if ($currentClassResult->num_rows > 0) {
        // A class is currently running - force logout
        $logoutQuery = $conn->prepare("
            UPDATE Logins
            SET time_out = NOW(), is_active = FALSE
            WHERE room_number = ? AND is_active = TRUE
        ");
        $logoutQuery->bind_param('s', $room);
        $logoutQuery->execute();
        $logoutQuery->close();

        $currentClassQuery->close();
        $query->close();
        $conn->close();

        echo json_encode([
            'success' => true,
            'force_logout' => true,
            'message' => 'A class is currently in session. You have been logged out automatically.'
        ]);
    } else {
        $currentClassQuery->close();
        $query->close();
        $conn->close();

        echo json_encode([
            'success' => true,
            'warning' => false,
            'message' => 'No upcoming classes'
        ]);
    }
}
?>
