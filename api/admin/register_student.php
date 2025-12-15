<?php
header('Content-Type: application/json');
require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$studentId = isset($input['student_id']) ? trim($input['student_id']) : '';
$studentName = isset($input['student_name']) ? trim($input['student_name']) : '';
$yearSection = isset($input['year_section']) ? trim($input['year_section']) : '';
$classes = isset($input['classes']) ? $input['classes'] : [];

if (empty($studentId) || empty($studentName) || empty($yearSection)) {
    echo json_encode(['success' => false, 'error' => 'All fields are required']);
    exit;
}

if (!preg_match('/^\d{8}$/', $studentId)) {
    echo json_encode(['success' => false, 'error' => 'Student ID must be 8 digits']);
    exit;
}

$conn = getDBConnection();

// Check if student already exists
$checkQuery = $conn->prepare("SELECT student_id FROM Students WHERE student_id = ?");
$checkQuery->bind_param('s', $studentId);
$checkQuery->execute();
$exists = $checkQuery->get_result()->num_rows > 0;
$checkQuery->close();

if ($exists) {
    $conn->close();
    echo json_encode(['success' => false, 'error' => 'Student ID already exists']);
    exit;
}

// Insert student
$insertStudent = $conn->prepare("INSERT INTO Students (student_id, student_name, year_section) VALUES (?, ?, ?)");
$insertStudent->bind_param('sss', $studentId, $studentName, $yearSection);
$insertStudent->execute();
$insertStudent->close();

// Enroll in classes
if (!empty($classes)) {
    foreach ($classes as $classId) {
        // Get EDP code for this class
        $edpQuery = $conn->prepare("SELECT edp_code FROM Classes WHERE class_id = ?");
        $edpQuery->bind_param('i', $classId);
        $edpQuery->execute();
        $edpResult = $edpQuery->get_result();

        if ($edpResult->num_rows > 0) {
            $edpCode = $edpResult->fetch_assoc()['edp_code'];

            $enrollQuery = $conn->prepare("INSERT INTO Enrolled_Students (student_id, class_id, edp_code) VALUES (?, ?, ?)");
            $enrollQuery->bind_param('sis', $studentId, $classId, $edpCode);
            $enrollQuery->execute();
            $enrollQuery->close();
        }

        $edpQuery->close();
    }
}

$conn->close();

echo json_encode([
    'success' => true,
    'message' => 'Student registered successfully'
]);
?>
