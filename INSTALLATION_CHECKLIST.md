# DeskLab Installation Checklist

Use this checklist to ensure proper installation and setup of DeskLab.

## Pre-Installation

- [ ] XAMPP/WAMP/LAMP installed
- [ ] Apache service working
- [ ] MySQL service working
- [ ] PHP 7.4 or higher installed
- [ ] Web browser installed (Chrome/Firefox/Edge)

## Database Setup

- [ ] phpMyAdmin accessible (http://localhost/phpmyadmin)
- [ ] Created database named `desklab`
- [ ] Imported `database/schema.sql` successfully
- [ ] All 5 tables created:
  - [ ] Students
  - [ ] Classes
  - [ ] Enrolled_Students
  - [ ] Logins
  - [ ] Pending_Requests
- [ ] No errors in SQL import
- [ ] Database appears in phpMyAdmin

## File Deployment

- [ ] Copied entire `desklab` folder to web server:
  - XAMPP: `C:\xampp\htdocs\desklab`
  - WAMP: `C:\wamp64\www\desklab`
  - LAMP: `/var/www/html/desklab`
- [ ] All files and folders present
- [ ] Folder permissions correct (755 for folders, 644 for files)
- [ ] `public/uploads` directory writable

## Configuration

- [ ] Opened `config/database.php`
- [ ] Verified database credentials:
  - [ ] DB_HOST = localhost
  - [ ] DB_USER = root (or your MySQL user)
  - [ ] DB_PASS = (your MySQL password)
  - [ ] DB_NAME = desklab
- [ ] Saved configuration file

## Verification

- [ ] Ran setup checker: http://localhost/desklab/check_setup.php
- [ ] All checks passed (green checkmarks)
- [ ] No errors shown
- [ ] Database connection successful
- [ ] All tables detected
- [ ] PHP extensions loaded
- [ ] API files present

## Testing Access

- [ ] Welcome page loads: http://localhost/desklab/welcome.html
- [ ] Student interface loads: http://localhost/desklab/index.html
- [ ] Admin dashboard loads: http://localhost/desklab/admin.html
- [ ] No JavaScript console errors (F12)
- [ ] No network errors in browser

## Admin Dashboard Setup

- [ ] Accessed admin dashboard
- [ ] Dashboard displays correctly
- [ ] All navigation items visible
- [ ] Real-time clock working
- [ ] No console errors

### Add First Class

- [ ] Clicked "Manage Classes"
- [ ] Clicked "+ Add Class"
- [ ] Added test class:
  - [ ] EDP Code: 15651 (5 digits)
  - [ ] Course: CPE FR 01
  - [ ] Instructor: Borja
  - [ ] Room: 419C
  - [ ] Start Time: 13:30
  - [ ] End Time: 15:00
  - [ ] Days: SAT
- [ ] Class saved successfully
- [ ] Class appears in list

### Register First Student

- [ ] Clicked "Register Student"
- [ ] Filled student information:
  - [ ] ID: 12345678 (8 digits)
  - [ ] Name: Juan Dela Cruz
  - [ ] Year/Section: BSCPE - 4
- [ ] Selected class to enroll
- [ ] Student registered successfully
- [ ] No errors shown

## Student Interface Testing

- [ ] Accessed student interface
- [ ] "Login" button works
- [ ] "View Schedule" button works

### Test Schedule Viewer

- [ ] Clicked "View Schedule"
- [ ] Entered room: 419C
- [ ] Clicked "Load Schedule"
- [ ] Schedule displays correctly
- [ ] Class information accurate:
  - [ ] EDP Code shown
  - [ ] Course name shown
  - [ ] Instructor shown
  - [ ] Time shown
  - [ ] Days shown

### Test Student Login

- [ ] Clicked "Login"
- [ ] Clicked "Manual Entry"
- [ ] Entered student credentials:
  - [ ] Name: Juan Dela Cruz
  - [ ] ID: 12345678
  - [ ] Year/Section: BSCPE - 4
  - [ ] Room: 419C
- [ ] System processed login
- [ ] Appropriate response received

## Scenario Testing

### Scenario A: Enrolled Student (During Class)

- [ ] Added class currently running
- [ ] Student enrolled in that class
- [ ] Student logged in
- [ ] Auto-approved access
- [ ] Redirected to session page
- [ ] Session timer working

### Scenario B: Non-Enrolled Student (During Class)

- [ ] Student not enrolled in current class
- [ ] Login prompted for purpose
- [ ] Entered purpose
- [ ] Request sent to admin
- [ ] Request appears in admin dashboard
- [ ] Admin approved request
- [ ] Student received approval
- [ ] Access granted

### Scenario C: No Class Running

- [ ] No class currently active
- [ ] Student login prompted for purpose
- [ ] Entered purpose
- [ ] Auto-approved access
- [ ] Redirected to session page

### Scenario D: Upcoming Class Warning

- [ ] Added class starting in 5-10 minutes
- [ ] Student logged in
- [ ] Warning popup appeared
- [ ] Countdown displayed
- [ ] Warning message clear

## Session Page Testing

- [ ] Session page loads correctly
- [ ] Student information displayed
- [ ] Session timer running
- [ ] Time In shown correctly
- [ ] Status badge displayed
- [ ] Logout button works
- [ ] Warning system working

## Admin Functions Testing

### Pending Requests

- [ ] Pending requests show in dashboard
- [ ] Request details complete
- [ ] Accept button works
- [ ] Reject button works
- [ ] Real-time updates working

### Active Users

- [ ] Active users list shows logged-in students
- [ ] Student details correct
- [ ] Session information accurate
- [ ] Force logout works
- [ ] Updates in real-time

### Login Logs

- [ ] Logs page loads
- [ ] All logins recorded
- [ ] Filter by date works
- [ ] Filter by status works
- [ ] History accurate

### Student Management

- [ ] Can register new students
- [ ] Can enroll students in classes
- [ ] Validation working
- [ ] Error messages clear

### Class Management

- [ ] Can add new classes
- [ ] Can view all classes
- [ ] Can delete classes
- [ ] Validation working
- [ ] Schedule conflicts handled

## Performance Testing

- [ ] Dashboard auto-refreshes every 5 seconds
- [ ] No lag or slowness
- [ ] Multiple simultaneous logins work
- [ ] Database queries fast
- [ ] No memory leaks

## Browser Compatibility

- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Edge
- [ ] Works in Safari (if Mac)
- [ ] Responsive on mobile

## Security Checks

- [ ] Database credentials not exposed
- [ ] SQL injection prevention working
- [ ] File upload restrictions working
- [ ] Input validation working
- [ ] XSS protection in place

## Documentation Review

- [ ] Read README.md
- [ ] Read QUICK_START.md
- [ ] Read PROJECT_SUMMARY.md
- [ ] Understood system logic
- [ ] Reviewed CHANGELOG.md

## Optional Enhancements

- [ ] Reviewed OCR integration guide
- [ ] Considered admin authentication
- [ ] Planned customization
- [ ] Reviewed future features

## Final Verification

- [ ] All critical features working
- [ ] No console errors
- [ ] No database errors
- [ ] No broken links
- [ ] System stable
- [ ] Ready for production use

## Post-Installation

- [ ] Backed up database
- [ ] Documented custom settings
- [ ] Trained administrators
- [ ] Created user guide for students
- [ ] Set up regular backups
- [ ] Planned maintenance schedule

## Sign-Off

**Installation completed by:** _________________

**Date:** _________________

**Notes:**
___________________________________________
___________________________________________
___________________________________________

**Status:** [ ] Production Ready  [ ] Needs Review  [ ] Issues Found

---

## Troubleshooting Reference

If any checklist item fails, refer to:
1. README.md - Complete documentation
2. QUICK_START.md - Setup guide
3. check_setup.php - Automated verification
4. Browser console (F12) - JavaScript errors
5. Apache error logs - Server issues
6. MySQL error logs - Database issues

## Support

For assistance:
- Check documentation files
- Review error messages
- Verify all checklist items
- Consult system administrator

---

**DeskLab v1.0.0**
*Installation Checklist - Comprehensive Edition*
