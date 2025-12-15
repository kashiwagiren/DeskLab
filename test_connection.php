<!DOCTYPE html>
<html>
<head>
    <title>DeskLab - Connection Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
        }
        .test-result {
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
        }
        .success {
            background: #d1fae5;
            border-left: 4px solid #48bb78;
            color: #065f46;
        }
        .error {
            background: #fee2e2;
            border-left: 4px solid #f56565;
            color: #991b1b;
        }
        .info {
            background: #dbeafe;
            border-left: 4px solid #3b82f6;
            color: #1e40af;
        }
        h1 {
            color: #2d3748;
        }
        code {
            background: #f3f4f6;
            padding: 2px 6px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <h1>DeskLab Connection Test</h1>

    <?php
    // Test 1: PHP Version
    echo '<div class="test-result info">';
    echo '<strong>PHP Version:</strong> ' . phpversion();
    echo '</div>';

    // Test 2: Required Extensions
    $requiredExtensions = ['mysqli', 'json', 'fileinfo'];
    $missingExtensions = [];

    foreach ($requiredExtensions as $ext) {
        if (!extension_loaded($ext)) {
            $missingExtensions[] = $ext;
        }
    }

    if (empty($missingExtensions)) {
        echo '<div class="test-result success">';
        echo '<strong>✓ PHP Extensions:</strong> All required extensions loaded (mysqli, json, fileinfo)';
        echo '</div>';
    } else {
        echo '<div class="test-result error">';
        echo '<strong>✗ Missing Extensions:</strong> ' . implode(', ', $missingExtensions);
        echo '</div>';
    }

    // Test 3: Database Configuration File
    if (file_exists('config/database.php')) {
        echo '<div class="test-result success">';
        echo '<strong>✓ Config File:</strong> config/database.php exists';
        echo '</div>';

        // Test 4: Database Connection
        require_once 'config/database.php';

        try {
            $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

            if ($conn->connect_error) {
                echo '<div class="test-result error">';
                echo '<strong>✗ Database Connection:</strong> ' . $conn->connect_error;
                echo '<br><br><strong>Possible Solutions:</strong>';
                echo '<ul>';
                echo '<li>Make sure MySQL is running in XAMPP</li>';
                echo '<li>Check database credentials in config/database.php</li>';
                echo '<li>Verify database "desklab" exists</li>';
                echo '</ul>';
                echo '</div>';
            } else {
                echo '<div class="test-result success">';
                echo '<strong>✓ Database Connection:</strong> Successfully connected to MySQL';
                echo '<br><strong>Host:</strong> ' . DB_HOST;
                echo '<br><strong>Database:</strong> ' . DB_NAME;
                echo '</div>';

                // Test 5: Tables
                $tables = ['Students', 'Classes', 'Enrolled_Students', 'Logins', 'Pending_Requests'];
                $missingTables = [];

                foreach ($tables as $table) {
                    $result = $conn->query("SHOW TABLES LIKE '{$table}'");
                    if ($result->num_rows === 0) {
                        $missingTables[] = $table;
                    }
                }

                if (empty($missingTables)) {
                    echo '<div class="test-result success">';
                    echo '<strong>✓ Database Tables:</strong> All 5 tables exist';
                    echo '</div>';
                } else {
                    echo '<div class="test-result error">';
                    echo '<strong>✗ Missing Tables:</strong> ' . implode(', ', $missingTables);
                    echo '<br><br><strong>Solution:</strong> Run database/schema.sql in phpMyAdmin';
                    echo '</div>';
                }

                // Test 6: Sample Data
                $classCount = $conn->query("SELECT COUNT(*) as count FROM Classes")->fetch_assoc()['count'];
                $studentCount = $conn->query("SELECT COUNT(*) as count FROM Students")->fetch_assoc()['count'];

                echo '<div class="test-result info">';
                echo '<strong>Database Contents:</strong>';
                echo '<br>Classes: ' . $classCount;
                echo '<br>Students: ' . $studentCount;
                echo '</div>';

                $conn->close();
            }
        } catch (Exception $e) {
            echo '<div class="test-result error">';
            echo '<strong>✗ Database Error:</strong> ' . $e->getMessage();
            echo '</div>';
        }
    } else {
        echo '<div class="test-result error">';
        echo '<strong>✗ Config File:</strong> config/database.php not found';
        echo '</div>';
    }

    // Test 7: API Files
    $apiFiles = [
        'api/login.php',
        'api/schedule.php',
        'api/admin/add_class.php',
        'api/process_studyload.php'
    ];
    $missingApi = [];

    foreach ($apiFiles as $file) {
        if (!file_exists($file)) {
            $missingApi[] = $file;
        }
    }

    if (empty($missingApi)) {
        echo '<div class="test-result success">';
        echo '<strong>✓ API Files:</strong> All critical API files present';
        echo '</div>';
    } else {
        echo '<div class="test-result error">';
        echo '<strong>✗ Missing API Files:</strong> ' . implode(', ', $missingApi);
        echo '</div>';
    }

    // Test 8: Upload Directory
    $uploadDir = 'public/uploads/';
    if (file_exists($uploadDir)) {
        if (is_writable($uploadDir)) {
            echo '<div class="test-result success">';
            echo '<strong>✓ Upload Directory:</strong> Exists and writable';
            echo '</div>';
        } else {
            echo '<div class="test-result error">';
            echo '<strong>✗ Upload Directory:</strong> Exists but not writable';
            echo '<br><strong>Solution:</strong> Set permissions to 777 or make writable';
            echo '</div>';
        }
    } else {
        echo '<div class="test-result error">';
        echo '<strong>✗ Upload Directory:</strong> public/uploads/ not found';
        echo '</div>';
    }

    // Test 9: Tesseract (Optional)
    echo '<div class="test-result info">';
    echo '<strong>Tesseract OCR:</strong> ';
    $tesseractPath = exec('tesseract --version 2>&1', $output, $returnCode);
    if ($returnCode === 0) {
        echo 'Installed ✓';
    } else {
        echo 'Not installed (optional)';
    }
    echo '</div>';
    ?>

    <div class="test-result info">
        <strong>Next Steps:</strong>
        <ul>
            <li>If all tests pass, your system is ready!</li>
            <li>Go to: <a href="admin.html">Admin Dashboard</a></li>
            <li>Or: <a href="index.html">Student Interface</a></li>
            <li>If errors shown, fix them based on solutions provided</li>
        </ul>
    </div>

    <div class="test-result info">
        <strong>Common Issues:</strong>
        <ul>
            <li><strong>Database Connection Failed:</strong> Make sure MySQL is running in XAMPP Control Panel</li>
            <li><strong>Missing Tables:</strong> Import database/schema.sql in phpMyAdmin</li>
            <li><strong>Connection Error in Browser:</strong> Make sure Apache is running and you're accessing via http://localhost/</li>
            <li><strong>File Upload Errors:</strong> Check permissions on public/uploads/ directory</li>
        </ul>
    </div>
</body>
</html>
