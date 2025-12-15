# 🖥️ DeskLab - Computer Laboratory Management System

A complete web-based system for managing computer laboratory access, student logins, class schedules, and admin monitoring.

![Version](https://img.shields.io/badge/version-1.0.7-blue)
![PHP](https://img.shields.io/badge/PHP-7.4+-purple)
![MySQL](https://img.shields.io/badge/MySQL-5.7+-orange)

## ✨ Features

### 👨‍🎓 Student Features
- Easy Login with manual entry or study load upload
- Schedule Viewer for room availability
- Smart Access Control based on enrollment
- Session Monitoring with auto-logout
- Class Warnings for upcoming classes

### 👨‍💼 Admin Features
- Real-time Dashboard with auto-refresh
- Pending Requests management
- Active Users monitoring
- Complete Login History
- Class & Student Management
- Debug Console

## 🚀 Quick Start

1. Install XAMPP
2. Clone to `C:\xampp\htdocs\desklab`
3. Create database `desklab` in phpMyAdmin
4. Import `database/schema.sql`
5. Copy `config/database.example.php` to `config/database.php`
6. Access: `http://localhost/desklab/`

## 📖 Documentation

- [Installation Guide](INSTALLATION_CHECKLIST.md)
- [Quick Start](QUICK_START.md)
- [Backup & Deployment](BACKUP_INSTRUCTIONS.md)
- [Troubleshooting](TROUBLESHOOTING.md)

## 🔧 Configuration

Edit `config/database.php`:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'desklab');
date_default_timezone_set('Asia/Manila');
```

## 📞 Support

For issues, check debug tools:
- `test_connection.php` - Database connection
- `test_class_detection.php` - Time/class detection
- `console.html` - Debug console

Made with ❤️ for educational purposes
