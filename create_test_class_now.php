<?php
require_once 'config/database.php';

$conn = getDBConnection();

// Get current time and create a class starting now
$currentTime = date('H:i:s');
$currentDay = strtoupper(date('D'));
$currentDate = date('Y-m-d H:i:s (l)');

// Calculate start time (5 minutes ago) and end time (10 minutes from now)
$startTime = date('H:i:s', strtotime('-5 minutes'));
$endTime = date('H:i:s', strtotime('+10 minutes'));

echo "<h1>Create Test Class At Current Time</h1>";
echo "<hr>";
echo "<p><strong>Current Date/Time:</strong> $currentDate</p>";
echo "<p><strong>Current Day:</strong> $currentDay</p>";
echo "<hr>";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $edpCode = $_POST['edp_code'];
    $course = $_POST['course'];
    $instructor = $_POST['instructor'];
    $room = $_POST['room'];
    $startTime = $_POST['start_time'];
    $endTime = $_POST['end_time'];
    $days = $_POST['days'];

    $insertQuery = $conn->prepare("
        INSERT INTO Classes (edp_code, course_subject, instructor, room_number, start_time, end_time, days)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

    $insertQuery->bind_param('sssssss', $edpCode, $course, $instructor, $room, $startTime, $endTime, $days);

    if ($insertQuery->execute()) {
        echo "<div style='background: #d1fae5; padding: 15px; border-radius: 5px; margin: 20px 0;'>";
        echo "<h3 style='color: #047857;'>✓ Class Created Successfully!</h3>";
        echo "<p><a href='test_class_detection.php'>Run Detection Test</a> | <a href='admin.html'>Go to Admin</a></p>";
        echo "</div>";
    } else {
        echo "<div style='background: #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0;'>";
        echo "<h3 style='color: #dc2626;'>✗ Error: " . $conn->error . "</h3>";
        echo "</div>";
    }

    $insertQuery->close();
}

$conn->close();
?>

<form method="POST" style="max-width: 600px; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <h3>Create a Class Running RIGHT NOW</h3>
    <p style="color: #718096; margin-bottom: 20px;">This will create a class that started 5 minutes ago and ends in 10 minutes.</p>

    <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 600;">EDP Code (5 digits):</label>
        <input type="text" name="edp_code" required maxlength="5" pattern="[0-9]{5}"
               value="<?php echo rand(10000, 99999); ?>"
               style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 5px;">
    </div>

    <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Course Subject:</label>
        <input type="text" name="course" required value="TEST CLASS"
               style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 5px;">
    </div>

    <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Instructor:</label>
        <input type="text" name="instructor" required value="Test Instructor"
               style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 5px;">
    </div>

    <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Room Number:</label>
        <input type="text" name="room" required value="TEST-ROOM"
               style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 5px;">
    </div>

    <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Start Time:</label>
        <input type="time" name="start_time" required value="<?php echo $startTime; ?>"
               style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 5px;">
        <small style="color: #718096;">Default: 5 minutes ago (<?php echo date('h:i A', strtotime('-5 minutes')); ?>)</small>
    </div>

    <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 600;">End Time:</label>
        <input type="time" name="end_time" required value="<?php echo $endTime; ?>"
               style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 5px;">
        <small style="color: #718096;">Default: 10 minutes from now (<?php echo date('h:i A', strtotime('+10 minutes')); ?>)</small>
    </div>

    <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Days:</label>
        <input type="text" name="days" required value="<?php echo $currentDay; ?>"
               style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 5px;">
        <small style="color: #718096;">Today is: <?php echo $currentDay; ?></small>
    </div>

    <button type="submit" style="background: #667eea; color: white; padding: 12px 24px; border: none; border-radius: 5px; font-weight: 600; cursor: pointer; width: 100%;">
        Create Test Class
    </button>
</form>

<div style="margin-top: 30px;">
    <p><a href="test_class_detection.php">← Back to Detection Test</a> | <a href="admin.html">Go to Admin</a></p>
</div>
