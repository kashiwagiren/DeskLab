<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DeskLab - Setup Checker</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        h1 {
            color: #2d3748;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #718096;
            margin-bottom: 30px;
        }
        .check-item {
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .check-item.success {
            background: #d1fae5;
            border-left: 4px solid #48bb78;
        }
        .check-item.error {
            background: #fee2e2;
            border-left: 4px solid #f56565;
        }
        .check-item.warning {
            background: #fef5e7;
            border-left: 4px solid #ed8936;
        }
        .icon {
            font-size: 1.5em;
        }
        .message {
            flex: 1;
        }
        .message strong {
            display: block;
            margin-bottom: 5px;
            color: #2d3748;
        }
        .message small {
            color: #4a5568;
        }
        .section {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
        }
        .section h2 {
            color: #2d3748;
            margin-bottom: 15px;
        }
        .links {
            margin-top: 30px;
            padding: 20px;
            background: #f7fafc;
            border-radius: 8px;
        }
        .links h3 {
            color: #2d3748;
            margin-bottom: 10px;
        }
        .links a {
            display: block;
            color: #667eea;
            text-decoration: none;
            padding: 8px 0;
            font-weight: 600;
        }
        .links a:hover {
            color: #5568d3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>DeskLab Setup Checker</h1>
        <p class="subtitle">Verify your installation and configuration</p>

        <?php
        $checks = [];
        $hasErrors = false;

        // Check 1: PHP Version
        $phpVersion = phpversion();
        if (version_compare($phpVersion, '7.4.0', '>=')) {
            $checks[] = [
                'type' => 'success',
                'title' => 'PHP Version',
                'message' => "PHP {$phpVersion} is installed and compatible"
            ];
        } else {
            $checks[] = [
                'type' => 'error',
                'title' => 'PHP Version',
                'message' => "PHP {$phpVersion} detected. Version 7.4 or higher required"
            ];
            $hasErrors = true;
        }

        // Check 2: Database Configuration File
        if (file_exists('config/database.php')) {
            $checks[] = [
                'type' => 'success',
                'title' => 'Database Config',
                'message' => 'Configuration file exists'
            ];
        } else {
            $checks[] = [
                'type' => 'error',
                'title' => 'Database Config',
                'message' => 'config/database.php not found'
            ];
            $hasErrors = true;
        }

        // Check 3: Database Connection
        try {
            require_once 'config/database.php';
            $conn = getDBConnection();
            $checks[] = [
                'type' => 'success',
                'title' => 'Database Connection',
                'message' => 'Successfully connected to MySQL database'
            ];

            // Check 4: Tables Exist
            $tables = ['Students', 'Classes', 'Enrolled_Students', 'Logins', 'Pending_Requests'];
            $missingTables = [];

            foreach ($tables as $table) {
                $result = $conn->query("SHOW TABLES LIKE '{$table}'");
                if ($result->num_rows === 0) {
                    $missingTables[] = $table;
                }
            }

            if (empty($missingTables)) {
                $checks[] = [
                    'type' => 'success',
                    'title' => 'Database Tables',
                    'message' => 'All required tables exist'
                ];
            } else {
                $checks[] = [
                    'type' => 'error',
                    'title' => 'Database Tables',
                    'message' => 'Missing tables: ' . implode(', ', $missingTables) . '. Run database/schema.sql'
                ];
                $hasErrors = true;
            }

            // Check 5: Sample Data
            $studentCount = $conn->query("SELECT COUNT(*) as count FROM Students")->fetch_assoc()['count'];
            $classCount = $conn->query("SELECT COUNT(*) as count FROM Classes")->fetch_assoc()['count'];

            if ($studentCount > 0 || $classCount > 0) {
                $checks[] = [
                    'type' => 'success',
                    'title' => 'Database Data',
                    'message' => "Found {$studentCount} students and {$classCount} classes"
                ];
            } else {
                $checks[] = [
                    'type' => 'warning',
                    'title' => 'Database Data',
                    'message' => 'Database is empty. Add students and classes through the admin dashboard'
                ];
            }

            $conn->close();
        } catch (Exception $e) {
            $checks[] = [
                'type' => 'error',
                'title' => 'Database Connection',
                'message' => 'Failed to connect: ' . $e->getMessage()
            ];
            $hasErrors = true;
        }

        // Check 6: Required Extensions
        $requiredExtensions = ['mysqli', 'json', 'fileinfo'];
        $missingExtensions = [];

        foreach ($requiredExtensions as $ext) {
            if (!extension_loaded($ext)) {
                $missingExtensions[] = $ext;
            }
        }

        if (empty($missingExtensions)) {
            $checks[] = [
                'type' => 'success',
                'title' => 'PHP Extensions',
                'message' => 'All required extensions are loaded'
            ];
        } else {
            $checks[] = [
                'type' => 'error',
                'title' => 'PHP Extensions',
                'message' => 'Missing extensions: ' . implode(', ', $missingExtensions)
            ];
            $hasErrors = true;
        }

        // Check 7: Upload Directory
        $uploadDir = 'public/uploads/';
        if (file_exists($uploadDir)) {
            if (is_writable($uploadDir)) {
                $checks[] = [
                    'type' => 'success',
                    'title' => 'Upload Directory',
                    'message' => 'Upload directory exists and is writable'
                ];
            } else {
                $checks[] = [
                    'type' => 'warning',
                    'title' => 'Upload Directory',
                    'message' => 'Upload directory exists but may not be writable. Check permissions'
                ];
            }
        } else {
            $checks[] = [
                'type' => 'warning',
                'title' => 'Upload Directory',
                'message' => 'Upload directory not found. It will be created automatically'
            ];
        }

        // Check 8: API Files
        $apiFiles = [
            'api/login.php',
            'api/schedule.php',
            'api/admin/overview.php',
            'api/admin/pending_requests.php'
        ];
        $missingApi = [];

        foreach ($apiFiles as $file) {
            if (!file_exists($file)) {
                $missingApi[] = $file;
            }
        }

        if (empty($missingApi)) {
            $checks[] = [
                'type' => 'success',
                'title' => 'API Files',
                'message' => 'All API endpoints are present'
            ];
        } else {
            $checks[] = [
                'type' => 'error',
                'title' => 'API Files',
                'message' => 'Missing API files: ' . implode(', ', $missingApi)
            ];
            $hasErrors = true;
        }

        // Display all checks
        foreach ($checks as $check) {
            $icon = $check['type'] === 'success' ? '✓' : ($check['type'] === 'error' ? '✗' : '⚠');
            echo "<div class='check-item {$check['type']}'>";
            echo "<div class='icon'>{$icon}</div>";
            echo "<div class='message'>";
            echo "<strong>{$check['title']}</strong>";
            echo "<small>{$check['message']}</small>";
            echo "</div>";
            echo "</div>";
        }
        ?>

        <div class="section">
            <h2>Overall Status</h2>
            <?php if (!$hasErrors): ?>
                <div class='check-item success'>
                    <div class='icon'>🎉</div>
                    <div class='message'>
                        <strong>Setup Complete!</strong>
                        <small>Your DeskLab installation is ready to use</small>
                    </div>
                </div>
            <?php else: ?>
                <div class='check-item error'>
                    <div class='icon'>❌</div>
                    <div class='message'>
                        <strong>Setup Incomplete</strong>
                        <small>Please fix the errors above before using the system</small>
                    </div>
                </div>
            <?php endif; ?>
        </div>

        <div class="links">
            <h3>Quick Links</h3>
            <a href="index.html">→ Student Interface</a>
            <a href="admin.html">→ Admin Dashboard</a>
            <a href="README.md" target="_blank">→ Full Documentation</a>
            <a href="QUICK_START.md" target="_blank">→ Quick Start Guide</a>
        </div>

        <div class="section">
            <h2>Next Steps</h2>
            <?php if (!$hasErrors): ?>
                <ol style="padding-left: 20px; color: #4a5568; line-height: 1.8;">
                    <li>Go to Admin Dashboard to add classes</li>
                    <li>Register students and enroll them in classes</li>
                    <li>Test the student login interface</li>
                    <li>Review the README.md for advanced features</li>
                </ol>
            <?php else: ?>
                <ol style="padding-left: 20px; color: #4a5568; line-height: 1.8;">
                    <li>Fix all errors shown above</li>
                    <li>Run database/schema.sql to create tables</li>
                    <li>Refresh this page to verify fixes</li>
                    <li>Check QUICK_START.md for detailed instructions</li>
                </ol>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
