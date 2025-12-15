<!DOCTYPE html>
<html>
<head>
    <title>DeskLab Status</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f7fa;
        }
        .status-box {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .status-ok {
            color: #48bb78;
            font-size: 48px;
            margin: 20px 0;
        }
        .status-error {
            color: #f56565;
            font-size: 48px;
            margin: 20px 0;
        }
        h1 {
            color: #2d3748;
            margin: 0 0 20px 0;
        }
        .detail {
            background: #f7fafc;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
            text-align: left;
        }
        .detail strong {
            color: #2d3748;
        }
        .btn {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 5px;
        }
        .btn:hover {
            background: #5568d3;
        }
    </style>
</head>
<body>
    <div class="status-box">
        <?php
        $allOk = true;
        $messages = [];

        // Check Apache
        if (isset($_SERVER['SERVER_SOFTWARE'])) {
            $messages[] = "✓ Apache: Running";
        } else {
            $messages[] = "✗ Apache: Not detected";
            $allOk = false;
        }

        // Check MySQL
        try {
            require_once 'config/database.php';
            $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
            if ($conn->connect_error) {
                $messages[] = "✗ MySQL: Connection failed";
                $allOk = false;
            } else {
                $messages[] = "✓ MySQL: Connected";

                // Check tables
                $tables = ['Students', 'Classes', 'Enrolled_Students', 'Logins', 'Pending_Requests'];
                $missingTables = [];
                foreach ($tables as $table) {
                    $result = $conn->query("SHOW TABLES LIKE '{$table}'");
                    if ($result->num_rows === 0) {
                        $missingTables[] = $table;
                    }
                }

                if (empty($missingTables)) {
                    $messages[] = "✓ Database: All tables exist";
                } else {
                    $messages[] = "✗ Database: Missing tables - " . implode(', ', $missingTables);
                    $allOk = false;
                }

                $conn->close();
            }
        } catch (Exception $e) {
            $messages[] = "✗ MySQL: " . $e->getMessage();
            $allOk = false;
        }

        // Check API files
        $apiFiles = ['api/login.php', 'api/admin/add_class.php', 'api/process_studyload.php'];
        $missingFiles = [];
        foreach ($apiFiles as $file) {
            if (!file_exists($file)) {
                $missingFiles[] = $file;
            }
        }

        if (empty($missingFiles)) {
            $messages[] = "✓ API Files: Present";
        } else {
            $messages[] = "✗ API Files: Missing - " . implode(', ', $missingFiles);
            $allOk = false;
        }

        // Display status
        if ($allOk) {
            echo '<div class="status-ok">✓</div>';
            echo '<h1>DeskLab is Ready!</h1>';
            echo '<p style="color: #48bb78; font-size: 18px;">All systems operational</p>';
        } else {
            echo '<div class="status-error">✗</div>';
            echo '<h1>DeskLab has Issues</h1>';
            echo '<p style="color: #f56565; font-size: 18px;">Please fix the errors below</p>';
        }

        // Show details
        foreach ($messages as $msg) {
            $class = strpos($msg, '✓') !== false ? 'success' : 'error';
            echo '<div class="detail">' . $msg . '</div>';
        }

        // Show next steps
        echo '<div style="margin-top: 30px;">';
        if ($allOk) {
            echo '<a href="admin.html" class="btn">Open Admin</a>';
            echo '<a href="index.html" class="btn">Open Student</a>';
        } else {
            echo '<a href="test_connection.php" class="btn">Detailed Test</a>';
            echo '<a href="debug.html" class="btn">Debug Panel</a>';
        }
        echo '</div>';
        ?>
    </div>

    <div style="text-align: center; margin-top: 20px; color: #718096;">
        <p>Access via: <code>http://localhost/desklab/status.php</code></p>
    </div>
</body>
</html>
