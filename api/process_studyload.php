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

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit;
}

if (!isset($_FILES['studyload'])) {
    echo json_encode(['success' => false, 'error' => 'No file uploaded']);
    exit;
}

$file = $_FILES['studyload'];
$uploadDir = '../public/uploads/';

// Create upload directory if it doesn't exist
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

if (!in_array($file['type'], $allowedTypes)) {
    echo json_encode(['success' => false, 'error' => 'Invalid file type. Only JPG, PNG, and PDF are allowed.']);
    exit;
}

// Generate unique filename
$fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
$fileName = uniqid('studyload_', true) . '.' . $fileExtension;
$filePath = $uploadDir . $fileName;

if (!move_uploaded_file($file['tmp_name'], $filePath)) {
    echo json_encode(['success' => false, 'error' => 'Failed to save file']);
    exit;
}

// Process the file using OCR or text extraction
$extractedData = processFile($filePath, $file['type']);

// Clean up uploaded file after processing
// unlink($filePath);

echo json_encode([
    'success' => true,
    'student_id' => $extractedData['student_id'] ?? '',
    'student_name' => $extractedData['student_name'] ?? '',
    'year_section' => $extractedData['year_section'] ?? '',
    'classes' => $extractedData['classes'] ?? [],
    'message' => 'File processed successfully. Please verify the extracted information.'
]);

function processFile($filePath, $fileType) {
    // This is a placeholder for OCR processing
    // In a production environment, you would integrate with:
    // - Tesseract OCR for images
    // - PDF parsing libraries for PDFs
    // - Cloud OCR services (Google Vision API, AWS Textract, Azure Computer Vision)

    $extractedData = [
        'student_id' => '',
        'student_name' => '',
        'year_section' => '',
        'classes' => []
    ];

    // For demonstration, we'll use simple pattern matching
    // In production, implement actual OCR here

    if ($fileType === 'application/pdf') {
        // PDF processing would go here
        // You can use libraries like TCPDF, FPDF, or pdf2text
        $extractedData = processPDF($filePath);
    } else {
        // Image processing would go here
        // You can use Tesseract OCR
        $extractedData = processImage($filePath);
    }

    return $extractedData;
}

function processImage($filePath) {
    // Placeholder for Tesseract OCR integration
    // Example command: exec("tesseract $filePath output", $output);

    // For now, return empty data structure
    // User will need to fill manually or you can integrate actual OCR

    /*
    // Example integration with Tesseract OCR (requires tesseract installed):
    $outputFile = sys_get_temp_dir() . '/ocr_output';
    exec("tesseract " . escapeshellarg($filePath) . " " . escapeshellarg($outputFile), $output, $returnCode);

    if ($returnCode === 0 && file_exists($outputFile . '.txt')) {
        $text = file_get_contents($outputFile . '.txt');
        unlink($outputFile . '.txt');

        return parseStudyLoadText($text);
    }
    */

    return [
        'student_id' => '',
        'student_name' => '',
        'year_section' => '',
        'classes' => []
    ];
}

function processPDF($filePath) {
    // Try to extract text from PDF using pdftotext
    $text = '';

    // Method 1: Try pdftotext (if available)
    if (function_exists('exec')) {
        $outputFile = sys_get_temp_dir() . '/pdf_output_' . uniqid() . '.txt';
        @exec("pdftotext " . escapeshellarg($filePath) . " " . escapeshellarg($outputFile) . " 2>&1", $output, $returnCode);

        if ($returnCode === 0 && file_exists($outputFile)) {
            $text = file_get_contents($outputFile);
            @unlink($outputFile);
        }
    }

    // Method 2: Try basic PDF text extraction (limited)
    if (empty($text)) {
        $content = file_get_contents($filePath);
        // Very basic PDF text extraction - works for simple PDFs
        if (preg_match_all('/\((.*?)\)/s', $content, $matches)) {
            $text = implode(' ', $matches[1]);
        }
    }

    if (!empty($text)) {
        return parseStudyLoadText($text);
    }

    return [
        'student_id' => '',
        'student_name' => '',
        'year_section' => '',
        'classes' => []
    ];
}

function parseStudyLoadText($text) {
    $data = [
        'student_id' => '',
        'student_name' => '',
        'year_section' => '',
        'classes' => []
    ];

    // Clean up text
    $text = preg_replace('/\s+/', ' ', $text); // Normalize whitespace

    // Pattern matching for University of Cebu study load format

    // Student ID (8 digits) - Look for pattern like "22653075"
    if (preg_match('/\b(\d{8})\b/', $text, $matches)) {
        $data['student_id'] = $matches[1];
    }

    // Student Name - Look for uppercase name format
    // Pattern: LASTNAME FIRSTNAME M. LASTNAME or variations
    if (preg_match('/([A-Z]+(?:\s+[A-Z]+)+\s+[A-Z]\.?\s+[A-Z]+)/', $text, $matches)) {
        $data['student_name'] = trim($matches[1]);
    } elseif (preg_match('/([A-Z][a-z]+(?:\s+[A-Z][a-z]+){2,})/', $text, $matches)) {
        $data['student_name'] = trim($matches[1]);
    }

    // Year & Section - Look for patterns like "BSCPE 4", "BSIT-3A", etc.
    if (preg_match('/(BS[A-Z]{2,4})\s*[-\s]*(\d)/', $text, $matches)) {
        $data['year_section'] = $matches[1] . ' - ' . $matches[2];
    } elseif (preg_match('/([A-Z]{2,6}\s*-?\s*\d[A-Z]?)/', $text, $matches)) {
        $data['year_section'] = trim($matches[1]);
    }

    // Alternative: Look for "SY" pattern which often comes with year/section info
    if (empty($data['year_section']) && preg_match('/([A-Z]{2,6})\s+(\d)/', $text, $matches)) {
        $data['year_section'] = $matches[1] . ' - ' . $matches[2];
    }

    // If student name is empty, try alternative patterns
    if (empty($data['student_name'])) {
        // Look for name after student ID
        if (!empty($data['student_id']) && preg_match('/' . $data['student_id'] . '\s+([A-Z][A-Z\s\.]+)/', $text, $matches)) {
            $nameParts = explode(' ', trim($matches[1]));
            if (count($nameParts) >= 2) {
                $data['student_name'] = trim($matches[1]);
            }
        }
    }

    return $data;
}
?>
