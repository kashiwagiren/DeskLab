# 🚨 Fix "Connection Error" Issues

## Quick Fix (Do This Now!)

### **Step 1: Open Debug Page**
```
http://localhost/desklab/debug.html
```

This will test everything and show you exactly what's wrong.

---

### **Step 2: Click "Test API"**
- If you see ✓ **green** → API is working!
- If you see ✗ **red** → See solutions below

---

## Common Issues & Fixes

### ❌ **Issue: "Failed to fetch" or "Connection Failed"**

**This means Apache is not running or wrong URL**

**Fix:**
```
1. Open XAMPP Control Panel
2. Click "Start" for Apache
3. Wait for green "Running" status
4. Make sure you're using: http://localhost/desklab/
   (NOT file:/// or C:\)
```

---

### ❌ **Issue: "Database connection failed"**

**Fix:**
```
1. Open XAMPP Control Panel
2. Click "Start" for MySQL
3. Wait for green "Running" status
4. Go to: http://localhost/desklab/test_connection.php
5. Follow the instructions shown
```

---

### ❌ **Issue: "Table doesn't exist"**

**Fix:**
```
1. Go to: http://localhost/phpmyadmin
2. Click "desklab" database (left sidebar)
3. Click "Import" tab
4. Choose file: database/schema.sql (from desklab folder)
5. Click "Go"
6. Wait for "Import successful"
```

---

## Test Each Feature

### **Test 1: Add Class**
```
1. Open: http://localhost/desklab/debug.html
2. Scroll to "3. Test Add Class"
3. Change EDP Code to unique number (e.g., 99999)
4. Click "Test Add Class"
5. Should see green ✓ "Class Added Successfully"
```

**If you see error:**
- Check error message
- Make sure EDP is 5 digits
- Make sure MySQL is running

---

### **Test 2: Login**
```
1. On debug.html
2. Scroll to "4. Test Student Login"
3. Click "Test Login"
4. Should see green ✓ "Login Successful"
```

**If you see error:**
- Check Student ID is 8 digits
- Make sure all fields filled
- Check error message details

---

### **Test 3: Get Rooms**
```
1. On debug.html
2. Scroll to "5. Test Get Rooms"
3. Click "Test Get Rooms"
4. Should see list of rooms
```

**If empty:**
- Add classes first (they create rooms)

---

## Still Not Working?

### **Check This Checklist:**

- [ ] XAMPP Apache is **Running** (green)
- [ ] XAMPP MySQL is **Running** (green)
- [ ] Using URL: `http://localhost/desklab/` (not file:///)
- [ ] Database "desklab" exists in phpMyAdmin
- [ ] All 5 tables exist (Students, Classes, etc.)
- [ ] Files are in: `C:\xampp\htdocs\desklab\`
- [ ] Browser console shows no errors (F12)

---

## Quick Database Reset

**If everything is broken, start fresh:**

```
1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Click "desklab" database
3. Click "Operations" tab
4. Scroll down, click "Drop database" (⚠️ deletes all data!)
5. Click "Databases" tab at top
6. Create new database: "desklab"
7. Click on "desklab"
8. Import: database/schema.sql
9. Done! Try again
```

---

## Detailed Error Messages

### **Error: "EDP code already exists"**
```
Solution: Use different EDP code or delete existing one:
1. phpMyAdmin → desklab → Classes
2. Find the row with that EDP
3. Click "Delete"
4. Try again
```

### **Error: "Student ID must be 8 digits"**
```
Correct: 12345678 (8 digits)
Wrong: 1234567 (7 digits)
Wrong: 123456789 (9 digits)
```

### **Error: "All fields are required"**
```
Make sure you filled every field:
- EDP Code (5 digits)
- Course Subject
- Instructor
- Room Number
- Start Time (HH:MM)
- End Time (HH:MM)
- Days (at least one checked)
```

---

## After Fixing

Once debug.html shows all green ✓:

1. **Go to Admin:** http://localhost/desklab/admin.html
2. **Add Real Class:** Click "Manage Classes" → Add actual class
3. **Go to Student:** http://localhost/desklab/index.html
4. **Test Login:** Try logging in with real data

---

## Prevention

**Always start XAMPP before using DeskLab:**
```
1. Open XAMPP Control Panel
2. Start Apache
3. Start MySQL
4. Wait for both to be green
5. Then open: http://localhost/desklab/
```

---

## Need More Help?

**Share these with me:**
1. Screenshot of debug.html results
2. Screenshot of XAMPP Control Panel
3. Any red error messages you see
4. Browser console errors (F12 → Console tab)

I'll help you fix it immediately!
