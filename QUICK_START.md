# DeskLab - Quick Start Guide

## 5-Minute Setup

### Step 1: Install XAMPP (if not installed)
1. Download XAMPP from https://www.apachefriends.org/
2. Install and start Apache + MySQL

### Step 2: Setup Database
1. Open browser: http://localhost/phpmyadmin
2. Click "New" to create database
3. Name it: `desklab`
4. Click on `desklab` database
5. Click "Import" tab
6. Choose file: `database/schema.sql`
7. Click "Go"

### Step 3: Move Files
Copy the entire `desklab` folder to:
- **Windows XAMPP**: `C:\xampp\htdocs\desklab`
- **Windows WAMP**: `C:\wamp64\www\desklab`

### Step 4: Access Application
Open your browser:
- **Students**: http://localhost/desklab/index.html
- **Admin**: http://localhost/desklab/admin.html

## First Time Usage

### Add Your First Class
1. Go to Admin Dashboard: http://localhost/desklab/admin.html
2. Click "Manage Classes" in sidebar
3. Click "+ Add Class"
4. Fill in:
   - EDP Code: `15651` (5 digits)
   - Course: `CPE FR 01`
   - Instructor: `Borja`
   - Room: `419C`
   - Start Time: `13:30` (1:30 PM)
   - End Time: `15:00` (3:00 PM)
   - Days: Check `SAT`
5. Click "Add Class"

### Register Your First Student
1. Click "Register Student" in sidebar
2. Fill in:
   - Student ID: `12345678` (8 digits)
   - Name: `Juan Dela Cruz`
   - Year & Section: `BSCPE - 4`
3. Check the class you just created
4. Click "Register Student"

### Test Student Login
1. Go to: http://localhost/desklab/index.html
2. Click "Login"
3. Click "Manual Entry"
4. Enter student details:
   - Name: `Juan Dela Cruz`
   - ID: `12345678`
   - Year & Section: `BSCPE - 4`
   - Room: `419C`
5. If there's a class, you'll be logged in automatically (enrolled)
6. If no class, provide a purpose and you'll be auto-approved

## Common Issues

### "Database connection failed"
- Make sure MySQL is running in XAMPP
- Check if database `desklab` exists
- Verify credentials in `config/database.php`

### "Page not found"
- Make sure files are in `htdocs/desklab` folder
- Check if Apache is running in XAMPP
- Try: http://localhost/desklab/index.html (not file:///)

### Nothing happens when clicking buttons
- Open browser console (F12)
- Check for JavaScript errors
- Make sure you're using http://localhost, not file:///

## Testing the System

### Test Scenario 1: Enrolled Student During Class
1. Add a class that's currently running (current time between start/end)
2. Register a student and enroll them in that class
3. Student logs in → Should be auto-approved

### Test Scenario 2: Non-enrolled Student During Class
1. Student logs in during a class they're not enrolled in
2. Student provides purpose
3. Admin sees pending request
4. Admin approves/rejects

### Test Scenario 3: No Class Running
1. Student logs in when no class is active
2. Student provides purpose
3. Auto-approved immediately

### Test Scenario 4: Upcoming Class Warning
1. Add a class starting 5-10 minutes from now
2. Student logs in
3. After a minute, student should see warning popup

## Default Settings

- **Auto-refresh**: Dashboard refreshes every 5 seconds
- **Class Warning**: 10 minutes before class starts
- **Check Interval**: System checks for upcoming classes every 30 seconds

## Database Configuration

Default settings in `config/database.php`:
```php
DB_HOST: localhost
DB_USER: root
DB_PASS: (empty)
DB_NAME: desklab
```

## Next Steps

1. Customize the design in `public/css/` files
2. Add more classes for different rooms
3. Register students and enroll them
4. Set up OCR for study load processing (see README.md)
5. Add admin authentication (recommended for production)

## Need Help?

Check the full README.md for:
- Complete feature documentation
- System logic flow details
- Advanced configuration
- OCR integration guide
- Troubleshooting tips

---

**You're all set!** Start using DeskLab for your computer lab management needs.
