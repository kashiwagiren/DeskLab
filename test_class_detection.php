<?php
require_once 'config/database.php';

$conn = getDBConnection();

echo "<h1>Class Detection Debug</h1>";
echo "<hr>";

// Current info
$currentTime = date('H:i:s');
$currentDay = strtoupper(date('D'));
$currentDateTime = date('Y-m-d H:i:s (l)');

echo "<h2>Current Information</h2>";
echo "<p><strong>Date/Time:</strong> $currentDateTime</p>";
echo "<p><strong>Time:</strong> $currentTime</p>";
echo "<p><strong>Day:</strong> $currentDay</p>";
echo "<hr>";

// All classes in database
echo "<h2>All Classes in Database</h2>";
$allClasses = $conn->query("SELECT * FROM Classes ORDER BY start_time");
if ($allClasses->num_rows > 0) {
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>EDP</th><th>Course</th><th>Room</th><th>Start</th><th>End</th><th>Days</th></tr>";
    while ($class = $allClasses->fetch_assoc()) {
        echo "<tr>";
        echo "<td>{$class['edp_code']}</td>";
        echo "<td>{$class['course_subject']}</td>";
        echo "<td>{$class['room_number']}</td>";
        echo "<td>{$class['start_time']}</td>";
        echo "<td>{$class['end_time']}</td>";
        echo "<td>{$class['days']}</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "<p>No classes found in database.</p>";
}
echo "<hr>";

// Test current class detection
echo "<h2>Current Class Detection Test</h2>";
$currentClassQuery = $conn->prepare("
    SELECT course_subject, instructor, room_number,
           start_time, end_time, days,
           DATE_FORMAT(start_time, '%h:%i %p') as start_time_formatted,
           DATE_FORMAT(end_time, '%h:%i %p') as end_time_formatted
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

if ($currentClassResult->num_rows > 0) {
    $currentClass = $currentClassResult->fetch_assoc();
    echo "<div style='background: #d1fae5; padding: 15px; border-radius: 5px;'>";
    echo "<h3 style='color: #047857;'>✓ CURRENT CLASS FOUND</h3>";
    echo "<p><strong>Course:</strong> {$currentClass['course_subject']}</p>";
    echo "<p><strong>Instructor:</strong> {$currentClass['instructor']}</p>";
    echo "<p><strong>Room:</strong> {$currentClass['room_number']}</p>";
    echo "<p><strong>Time:</strong> {$currentClass['start_time_formatted']} - {$currentClass['end_time_formatted']}</p>";
    echo "<p><strong>Days:</strong> {$currentClass['days']}</p>";
    echo "<p><strong>Raw Start:</strong> {$currentClass['start_time']}</p>";
    echo "<p><strong>Raw End:</strong> {$currentClass['end_time']}</p>";
    echo "</div>";
} else {
    echo "<div style='background: #fee2e2; padding: 15px; border-radius: 5px;'>";
    echo "<h3 style='color: #dc2626;'>✗ NO CURRENT CLASS FOUND</h3>";
    echo "<p>No class is currently running that matches:</p>";
    echo "<ul>";
    echo "<li>Time between start and end: $currentTime</li>";
    echo "<li>Day contains: $currentDay</li>";
    echo "</ul>";
    echo "</div>";
}
$currentClassQuery->close();
echo "<hr>";

// Test upcoming class detection
echo "<h2>Upcoming Class Detection Test</h2>";
$oneHourLater = date('H:i:s', strtotime('+1 hour'));

$upcomingClassQuery = $conn->prepare("
    SELECT course_subject, instructor, room_number,
           start_time, days,
           DATE_FORMAT(start_time, '%h:%i %p') as start_time_formatted,
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

if ($upcomingClassResult->num_rows > 0) {
    $upcomingClass = $upcomingClassResult->fetch_assoc();
    echo "<div style='background: #fef5e7; padding: 15px; border-radius: 5px;'>";
    echo "<h3 style='color: #d97706;'>⚠ UPCOMING CLASS FOUND</h3>";
    echo "<p><strong>Course:</strong> {$upcomingClass['course_subject']}</p>";
    echo "<p><strong>Instructor:</strong> {$upcomingClass['instructor']}</p>";
    echo "<p><strong>Room:</strong> {$upcomingClass['room_number']}</p>";
    echo "<p><strong>Starts at:</strong> {$upcomingClass['start_time_formatted']}</p>";
    echo "<p><strong>Minutes until start:</strong> {$upcomingClass['minutes_until']} minutes</p>";
    echo "<p><strong>Days:</strong> {$upcomingClass['days']}</p>";
    echo "</div>";
} else {
    echo "<div style='background: #f3f4f6; padding: 15px; border-radius: 5px;'>";
    echo "<h3 style='color: #4b5563;'>ℹ NO UPCOMING CLASS FOUND</h3>";
    echo "<p>No class starting within next hour that matches:</p>";
    echo "<ul>";
    echo "<li>Start time between: $currentTime and $oneHourLater</li>";
    echo "<li>Day contains: $currentDay</li>";
    echo "</ul>";
    echo "</div>";
}
$upcomingClassQuery->close();
echo "<hr>";

// Manual test with specific times
echo "<h2>Manual Day Matching Test</h2>";
$testClasses = $conn->query("SELECT edp_code, course_subject, days FROM Classes LIMIT 5");
if ($testClasses->num_rows > 0) {
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>EDP</th><th>Course</th><th>Days</th><th>Match Test</th></tr>";
    while ($class = $testClasses->fetch_assoc()) {
        $match1 = (strpos($class['days'], $currentDay) !== false) ? '✓ LIKE' : '✗ LIKE';
        $match2 = (strpos(str_replace(', ', ',', $class['days']), $currentDay) !== false) ? '✓ REPLACE' : '✗ REPLACE';

        echo "<tr>";
        echo "<td>{$class['edp_code']}</td>";
        echo "<td>{$class['course_subject']}</td>";
        echo "<td>{$class['days']}</td>";
        echo "<td>$match1 | $match2</td>";
        echo "</tr>";
    }
    echo "</table>";
}

$conn->close();

echo "<hr>";
echo "<p><a href='admin.html'>Back to Admin</a> | <a href='test_class_detection.php'>Refresh Test</a></p>";
?>
