<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$studentName = isset($input['student_name']) ? trim($input['student_name']) : '';
$studentId = isset($input['student_id']) ? trim($input['student_id']) : '';
$yearSection = isset($input['year_section']) ? trim($input['year_section']) : '';
$roomNumber = isset($input['room_number']) ? trim($input['room_number']) : '';
$purpose = isset($input['purpose']) ? trim($input['purpose']) : '';

// Validate inputs
if (empty($studentName) || empty($studentId) || empty($yearSection) || empty($roomNumber)) {
    echo json_encode(['success' => false, 'error' => 'All fields are required']);
    exit;
}

if (!preg_match('/^\d{8}$/', $studentId)) {
    echo json_encode(['success' => false, 'error' => 'Student ID must be 8 digits']);
    exit;
}

$conn = getDBConnection();

// Step 1: Register student if not exists
$checkStudent = $conn->prepare("SELECT student_id FROM Students WHERE student_id = ?");
$checkStudent->bind_param('s', $studentId);
$checkStudent->execute();
$studentExists = $checkStudent->get_result()->num_rows > 0;
$checkStudent->close();

if (!$studentExists) {
    $insertStudent = $conn->prepare("INSERT INTO Students (student_id, student_name, year_section) VALUES (?, ?, ?)");
    $insertStudent->bind_param('sss', $studentId, $studentName, $yearSection);
    $insertStudent->execute();
    $insertStudent->close();
}

// Step 2: Check current time against class schedule
$currentTime = date('H:i:s');
$currentDay = strtoupper(date('D')); // MON, TUE, WED, THU, FRI, SAT, SUN

$classQuery = $conn->prepare("
    SELECT class_id, edp_code, course_subject, instructor
    FROM Classes
    WHERE room_number = ?
    AND ? BETWEEN start_time AND end_time
    AND (
        days LIKE CONCAT('%', ?, '%')
        OR REPLACE(days, ', ', ',') LIKE CONCAT('%', ?, '%')
    )
    LIMIT 1
");

$classQuery->bind_param('ssss', $roomNumber, $currentTime, $currentDay, $currentDay);
$classQuery->execute();
$classResult = $classQuery->get_result();

if ($classResult->num_rows > 0) {
    // SCENARIO A: There is an ongoing class
    $currentClass = $classResult->fetch_assoc();
    $classId = $currentClass['class_id'];

    // Check if student is enrolled in this class
    $enrollmentQuery = $conn->prepare("
        SELECT enrollment_id
        FROM Enrolled_Students
        WHERE student_id = ? AND class_id = ?
    ");
    $enrollmentQuery->bind_param('si', $studentId, $classId);
    $enrollmentQuery->execute();
    $enrollmentResult = $enrollmentQuery->get_result();

    if ($enrollmentResult->num_rows > 0) {
        // Case A1.1: Student is enrolled - Auto allow
        $loginQuery = $conn->prepare("
            INSERT INTO Logins (student_id, student_name, year_section, room_number, class_id, status)
            VALUES (?, ?, ?, ?, ?, 'Enrolled (Allowed)')
        ");
        $loginQuery->bind_param('ssssi', $studentId, $studentName, $yearSection, $roomNumber, $classId);
        $loginQuery->execute();
        $loginId = $conn->insert_id;
        $loginQuery->close();

        $enrollmentQuery->close();
        $classQuery->close();
        $conn->close();

        echo json_encode([
            'success' => true,
            'status' => 'allowed',
            'message' => 'Welcome! You are enrolled in the current class.',
            'login_id' => $loginId,
            'room_number' => $roomNumber
        ]);
        exit;
    } else {
        // Case A1.2: Student is not enrolled
        $enrollmentQuery->close();

        if (empty($purpose)) {
            // Ask for purpose
            $classQuery->close();
            $conn->close();

            echo json_encode([
                'success' => true,
                'status' => 'ask_purpose',
                'message' => 'You are not enrolled in the current class. Please state your purpose for using this computer.',
                'class_info' => $currentClass
            ]);
            exit;
        } else {
            // Create pending request
            $requestQuery = $conn->prepare("
                INSERT INTO Pending_Requests (student_id, student_name, year_section, room_number, class_id, purpose)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $requestQuery->bind_param('ssssis', $studentId, $studentName, $yearSection, $roomNumber, $classId, $purpose);
            $requestQuery->execute();
            $requestId = $conn->insert_id;
            $requestQuery->close();

            $classQuery->close();
            $conn->close();

            echo json_encode([
                'success' => true,
                'status' => 'pending',
                'message' => 'Your request has been sent to the administrator. Please wait for approval.',
                'request_id' => $requestId
            ]);
            exit;
        }
    }
} else {
    // SCENARIO B: No ongoing class
    $classQuery->close();

    if (empty($purpose)) {
        // Ask for purpose
        $conn->close();

        echo json_encode([
            'success' => true,
            'status' => 'ask_purpose',
            'message' => 'No class is currently running. Please state your purpose for using this computer.'
        ]);
        exit;
    } else {
        // Auto allow
        $loginQuery = $conn->prepare("
            INSERT INTO Logins (student_id, student_name, year_section, room_number, purpose, status)
            VALUES (?, ?, ?, ?, ?, 'No class - Auto Allowed')
        ");
        $loginQuery->bind_param('sssss', $studentId, $studentName, $yearSection, $roomNumber, $purpose);
        $loginQuery->execute();
        $loginId = $conn->insert_id;
        $loginQuery->close();
        $conn->close();

        echo json_encode([
            'success' => true,
            'status' => 'allowed',
            'message' => 'Access granted. No class is currently running.',
            'login_id' => $loginId,
            'room_number' => $roomNumber
        ]);
        exit;
    }
}
?>
