<?php
// Database Configuration - TEMPLATE FILE
// Copy this file to database.php and fill in your actual credentials

define('DB_HOST', 'localhost');
define('DB_USER', 'your_database_username');
define('DB_PASS', 'your_database_password');
define('DB_NAME', 'your_database_name');

// Set timezone (adjust to your location)
// Common timezones:
// - Philippines: 'Asia/Manila'
// - USA (Eastern): 'America/New_York'
// - USA (Pacific): 'America/Los_Angeles'
// - UK: 'Europe/London'
// - Full list: https://www.php.net/manual/en/timezones.php
date_default_timezone_set('Asia/Manila');

// Create database connection
function getDBConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

    if ($conn->connect_error) {
        die(json_encode([
            'success' => false,
            'error' => 'Database connection failed: ' . $conn->connect_error
        ]));
    }

    $conn->set_charset('utf8mb4');
    return $conn;
}

// Helper function to execute queries
function executeQuery($query, $params = [], $types = '') {
    $conn = getDBConnection();

    if (!empty($params)) {
        $stmt = $conn->prepare($query);
        if ($stmt === false) {
            $conn->close();
            return ['success' => false, 'error' => 'Query preparation failed: ' . $conn->error];
        }

        if (!empty($types)) {
            $stmt->bind_param($types, ...$params);
        }

        $stmt->execute();
        $result = $stmt->get_result();
        $stmt->close();
    } else {
        $result = $conn->query($query);
    }

    $conn->close();
    return $result;
}
?>
