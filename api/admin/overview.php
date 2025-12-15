<?php
header('Content-Type: application/json');
require_once '../../config/database.php';

$conn = getDBConnection();

// Get pending requests count
$pendingQuery = $conn->query("SELECT COUNT(*) as count FROM Pending_Requests WHERE admin_decision = 'Pending'");
$pendingCount = $pendingQuery->fetch_assoc()['count'];

// Get active users count
$activeQuery = $conn->query("SELECT COUNT(*) as count FROM Logins WHERE is_active = TRUE");
$activeCount = $activeQuery->fetch_assoc()['count'];

// Get current class
$currentTime = date('H:i:s');
$currentDay = strtoupper(date('D')); // MON, TUE, WED, etc.

// Map day abbreviations to full names for better matching
$dayMap = [
    'MON' => 'MON',
    'TUE' => 'TUE',
    'WED' => 'WED',
    'THU' => 'THU',
    'FRI' => 'FRI',
    'SAT' => 'SAT',
    'SUN' => 'SUN'
];

$currentClassQuery = $conn->prepare("
    SELECT course_subject, instructor, room_number,
           DATE_FORMAT(start_time, '%h:%i %p') as start_time,
           DATE_FORMAT(end_time, '%h:%i %p') as end_time,
           days
    FROM Classes
    WHERE ? BETWEEN start_time AND end_time
    AND (
        days LIKE CONCAT('%', ?, '%')
        OR REPLACE(days, ', ', ',') LIKE CONCAT('%', ?, '%')
    )
    ORDER BY start_time
    LIMIT 1
");

$currentClassQuery->bind_param('sss', $currentTime, $currentDay, $currentDay);
$currentClassQuery->execute();
$currentClassResult = $currentClassQuery->get_result();
$currentClass = $currentClassResult->num_rows > 0 ? $currentClassResult->fetch_assoc() : null;

// Get upcoming class (within next hour, not just 10 minutes for better visibility)
$oneHourLater = date('H:i:s', strtotime('+1 hour'));

$upcomingClassQuery = $conn->prepare("
    SELECT course_subject, instructor, room_number,
           DATE_FORMAT(start_time, '%h:%i %p') as start_time,
           TIMESTAMPDIFF(MINUTE, ?, start_time) as minutes_until
    FROM Classes
    WHERE start_time > ?
    AND start_time <= ?
    AND (
        days LIKE CONCAT('%', ?, '%')
        OR REPLACE(days, ', ', ',') LIKE CONCAT('%', ?, '%')
    )
    ORDER BY start_time
    LIMIT 1
");

$upcomingClassQuery->bind_param('sssss', $currentTime, $currentTime, $oneHourLater, $currentDay, $currentDay);
$upcomingClassQuery->execute();
$upcomingClassResult = $upcomingClassQuery->get_result();
$upcomingClass = $upcomingClassResult->num_rows > 0 ? $upcomingClassResult->fetch_assoc() : null;

$currentClassQuery->close();
$upcomingClassQuery->close();
$conn->close();

echo json_encode([
    'success' => true,
    'pending_count' => $pendingCount,
    'active_count' => $activeCount,
    'current_class' => $currentClass,
    'upcoming_class' => $upcomingClass
]);
?>
