# DeskLab Troubleshooting Guide

## Quick Fix Steps

### **Step 1: Run Connection Test**
Open in browser: http://localhost/desklab/test_connection.php

This will show you exactly what's wrong.

---

## Common Errors & Solutions

### ❌ **Error: "Connection error. Please try again"**

**Causes:**
1. Apache not running
2. MySQL not running
3. Wrong URL
4. Database not created

**Solutions:**

#### ✅ **Solution 1: Check XAMPP**
```
1. Open XAMPP Control Panel
2. Make sure Apache is STARTED (green)
3. Make sure MySQL is STARTED (green)
4. If not, click "Start" buttons
```

#### ✅ **Solution 2: Check URL**
Make sure you're using:
- ✅ `http://localhost/desklab/index.html`
- ❌ NOT `file:///C:/Users/.../index.html`
- ❌ NOT `C:\xampp\htdocs\...`

#### ✅ **Solution 3: Check Database**
```
1. Open http://localhost/phpmyadmin
2. Look for database "desklab"
3. If missing:
   - Click "New"
   - Name: desklab
   - Click "Create"
4. Click on "desklab" database
5. Click "Import" tab
6. Choose file: database/schema.sql
7. Click "Go"
```

---

### ❌ **Error Adding Class**

**Possible Causes:**
1. Database tables not created
2. MySQL not running
3. Duplicate EDP code
4. Invalid data format

**Solutions:**

#### ✅ **Check Tables Exist**
```
1. Open http://localhost/phpmyadmin
2. Click "desklab" database
3. Should see 5 tables:
   - Students
   - Classes
   - Enrolled_Students
   - Logins
   - Pending_Requests
4. If missing, import database/schema.sql
```

#### ✅ **Check Data Format**
```
EDP Code: Must be exactly 5 digits (e.g., 15628)
Time: Use 24-hour format
  - 4:00 PM = 16:00
  - 1:30 PM = 13:30
Days: Check at least one day
```

#### ✅ **Clear Existing Data** (if testing)
```sql
-- In phpMyAdmin, run:
DELETE FROM Classes WHERE edp_code = '15628';
-- Then try adding again
```

---

### ❌ **Error: "Failed to process file"**

**Causes:**
1. File too large
2. Invalid file type
3. Upload directory not writable
4. PHP upload settings

**Solutions:**

#### ✅ **Check File Size**
```
Max file size: 10MB
If larger, edit .htaccess or php.ini:
  upload_max_filesize = 10M
  post_max_size = 10M
```

#### ✅ **Check Upload Directory**
```bash
# Windows (in XAMPP folder):
Right-click public/uploads → Properties →
Uncheck "Read-only" → Apply

# Linux/Mac:
chmod 777 public/uploads/
```

#### ✅ **Supported Formats**
```
✅ PDF (.pdf)
✅ Images (.png, .jpg, .jpeg)
❌ Word documents
❌ Scanned PDFs without text (need Tesseract)
```

---

### ❌ **Study Load Upload Doesn't Auto-Fill**

**This is expected** if:
1. PDF is scanned image (not text-based)
2. Tesseract not installed
3. Study load format doesn't match

**Solutions:**

#### ✅ **Test if PDF has text**
```
1. Open your PDF in Adobe Reader
2. Try to select/highlight text
3. If you CAN select text → Should work
4. If you CANNOT → Need Tesseract OCR
```

#### ✅ **Install Tesseract (Optional)**

**Windows:**
```
1. Download: https://github.com/UB-Mannheim/tesseract/wiki
2. Install (remember installation path)
3. Add to PATH:
   - Search "Environment Variables"
   - Edit "Path"
   - Add: C:\Program Files\Tesseract-OCR
4. Restart XAMPP
```

**Linux:**
```bash
sudo apt-get install tesseract-ocr
```

**Mac:**
```bash
brew install tesseract
```

**Verify:**
```bash
tesseract --version
```

#### ✅ **Use Manual Entry Instead**
```
If auto-fill doesn't work:
1. Click "Switch to Manual Entry"
2. Type information manually
3. This always works!
```

---

### ❌ **Login Errors**

**Error: "Student ID must be 8 digits"**
```
✅ Correct: 12345678 (8 digits)
❌ Wrong: 1234567 (7 digits)
❌ Wrong: 123456789 (9 digits)
```

**Error: "All fields are required"**
```
Make sure you filled:
- Student Name
- Student ID (8 digits)
- Year & Section
- Room Number
```

**Error: "Purpose required"**
```
This appears when:
- Class is running and you're not enrolled
- No class but system needs purpose

Solution: Fill the "Purpose" field that appears
```

---

### ❌ **Auto-Logout Not Working**

**Check These:**

#### ✅ **Browser Must Be Open**
```
Auto-logout only works if:
- Browser window is open
- Session page is active
- Not minimized to tray
```

#### ✅ **Check Class Time Format**
```
In admin dashboard when adding class:
- Start Time: 16:00 (not 4:00 PM)
- End Time: 16:20 (not 4:20 PM)
```

#### ✅ **Check Days Match**
```
Today is: <?php echo date('D'); ?> (e.g., MON, TUE)
Class days must include today's day
```

#### ✅ **Manual Test**
```
1. Add class starting in 2 minutes
2. Login as student
3. Wait 2 minutes
4. Should auto-logout
```

---

### ❌ **Room Dropdown Empty**

**Cause:** No classes added to database

**Solution:**
```
1. Go to Admin Dashboard
2. Click "Manage Classes"
3. Add at least one class
4. Room dropdown will show rooms from classes
```

---

### ❌ **Schedule Not Loading**

**Solutions:**

#### ✅ **Check Room Exists**
```
Room in dropdown = rooms with classes
If room not in dropdown = no classes for that room
```

#### ✅ **Check Day Format in Database**
```
Correct format: MON, TUE, WED, FRI
Not: Monday, mon, MONDAY
```

#### ✅ **Clear Browser Cache**
```
Press Ctrl + F5 to hard refresh
Or: Ctrl + Shift + Delete → Clear cache
```

---

## Debugging Tips

### **Check Browser Console**
```
1. Press F12
2. Click "Console" tab
3. Look for red errors
4. Share error message for help
```

### **Check Network Tab**
```
1. Press F12
2. Click "Network" tab
3. Try the action that fails
4. Look for red/failed requests
5. Click failed request → "Response" tab
```

### **Enable PHP Errors**
Add to top of any .php file:
```php
<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

---

## Still Having Issues?

### **Run Full Diagnostic**
```
1. Go to: http://localhost/desklab/test_connection.php
2. Screenshot all results
3. Fix any red ✗ errors shown
4. Re-test
```

### **Fresh Start (Last Resort)**
```
1. Backup any custom data
2. Drop "desklab" database in phpMyAdmin
3. Create new "desklab" database
4. Import database/schema.sql again
5. Restart Apache and MySQL
6. Test again
```

### **Check Logs**
```
XAMPP Error Logs:
- C:\xampp\apache\logs\error.log
- C:\xampp\mysql\data\mysql_error.log

Look for recent errors related to desklab
```

---

## Quick Checklist

Before reporting issues, verify:

- [ ] XAMPP Apache is running (green)
- [ ] XAMPP MySQL is running (green)
- [ ] Database "desklab" exists
- [ ] All 5 tables created (Students, Classes, etc.)
- [ ] Using http://localhost/desklab/ (not file:///)
- [ ] Browser console shows no errors (F12)
- [ ] test_connection.php shows all green ✓

---

## Most Common Issue

**90% of problems are:**
```
XAMPP not running properly

Solution:
1. Open XAMPP Control Panel
2. Stop Apache & MySQL
3. Wait 5 seconds
4. Start Apache & MySQL
5. Wait for green "Running" status
6. Try again
```

---

**Need More Help?**
1. Run test_connection.php
2. Screenshot any errors
3. Check browser console (F12)
4. Provide specific error message
