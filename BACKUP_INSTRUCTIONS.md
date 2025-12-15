# DeskLab - Local Backup & GitHub Upload Guide

## Quick Backup (Right Now)

### **Method 1: Manual Backup (Recommended)**

1. **Copy the entire `desklab` folder:**
   ```
   Source: C:\Users\Kieth\Documents\Code\desklab
   Destination: C:\Users\Kieth\Documents\Code\desklab_backup_2025-12-15
   ```

2. **Right-click `desklab` folder → Copy**
3. **Paste in same location → Rename to `desklab_backup_2025-12-15`**

4. **Export Database:**
   - Open phpMyAdmin: `http://localhost/phpmyadmin`
   - Click "desklab" database (left sidebar)
   - Click "Export" tab at top
   - Click "Go" button (default settings are fine)
   - Save file as: `desklab_backup_2025-12-15.sql`
   - Move to: `C:\Users\Kieth\Documents\Code\desklab_backup_2025-12-15\database\`

**✅ Done! You now have a complete backup.**

---

### **Method 2: Using Git (Prepare for GitHub)**

1. **Open Command Prompt or Git Bash**
2. **Navigate to your project:**
   ```bash
   cd C:\Users\Kieth\Documents\Code\desklab
   ```

3. **Initialize Git (if not already):**
   ```bash
   git init
   ```

4. **Create `.gitignore` file** (important - excludes sensitive files)

5. **Add all files:**
   ```bash
   git add .
   ```

6. **Commit:**
   ```bash
   git commit -m "Initial commit - DeskLab v1.0.7"
   ```

**✅ Local Git repository created!**

---

## Before GitHub Upload - Important!

### **⚠️ Security Checklist**

**DO NOT upload these to GitHub:**
- ❌ Database passwords (already handled in .gitignore)
- ❌ `.env` files with credentials
- ❌ Actual database backups (.sql files)
- ❌ config/database.php with real passwords

**What to do:**
1. Create `config/database.example.php` (template without password)
2. Add `config/database.php` to `.gitignore`
3. Add `database/*.sql` to `.gitignore`

---

## Prepare for GitHub

### **Files Structure (What to Upload):**

```
desklab/
├── api/                    ✅ Upload
├── config/                 ⚠️ Upload example only
│   ├── database.php        ❌ Don't upload (has password)
│   └── database.example.php ✅ Upload (template)
├── database/               ⚠️ Partial
│   ├── schema.sql          ✅ Upload
│   └── *.sql backups       ❌ Don't upload
├── public/                 ✅ Upload
├── *.html                  ✅ Upload
├── *.md                    ✅ Upload
├── *.php (test files)      ⚠️ Optional
├── .gitignore              ✅ Upload
└── README.md               ✅ Upload
```

---

## GitHub Upload Steps

### **Step 1: Create GitHub Repository**

1. Go to: https://github.com
2. Click "+" (top right) → "New repository"
3. Name: `desklab` or `computer-lab-management`
4. Description: "Computer Laboratory Management System with Student Login & Admin Dashboard"
5. **Choose:**
   - ⚪ Public (anyone can see code)
   - 🔘 Private (only you can see)
6. ✅ Check "Add a README file"
7. Click "Create repository"

---

### **Step 2: Upload to GitHub**

**Using Command Line (Git):**

```bash
# 1. Navigate to project
cd C:\Users\Kieth\Documents\Code\desklab

# 2. Add remote repository (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/desklab.git

# 3. Push to GitHub
git branch -M main
git push -u origin main
```

**Using GitHub Desktop (Easier):**

1. Download GitHub Desktop: https://desktop.github.com/
2. Install and sign in
3. File → Add Local Repository
4. Choose: `C:\Users\Kieth\Documents\Code\desklab`
5. Click "Publish repository"
6. Choose public/private
7. Click "Publish"

---

## Prepare for Online Hosting

### **Requirements for Online Hosting:**

**You'll need:**
- Web hosting with PHP 7.4+ support
- MySQL database
- cPanel or similar control panel

**Popular Options:**
1. **Free Hosting:**
   - InfinityFree (free, has ads)
   - 000webhost (free, limited)
   - Heroku (free tier, requires config)

2. **Paid Hosting (Recommended):**
   - Hostinger ($2-3/month)
   - Namecheap ($2-3/month)
   - SiteGround ($3-5/month)

---

### **Changes Needed for Online:**

**1. Update `config/database.php`:**
```php
// Local (Current)
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'desklab');

// Online (Example)
define('DB_HOST', 'localhost'); // or provided by host
define('DB_USER', 'username_desklab'); // provided by host
define('DB_PASS', 'strong_password_here'); // set by you
define('DB_NAME', 'username_desklab'); // provided by host
```

**2. Update Timezone (if needed):**
```php
// Change based on server location
date_default_timezone_set('Asia/Manila');
```

**3. Create `.htaccess` file:**
```apache
# Disable directory browsing
Options -Indexes

# Enable error reporting (disable in production)
php_flag display_errors off
php_flag log_errors on

# Set default page
DirectoryIndex index.html

# Protect config files
<Files "database.php">
    Order Allow,Deny
    Deny from all
</Files>
```

---

## Upload to Online Server

### **Method 1: cPanel File Manager**

1. Log in to cPanel
2. Open "File Manager"
3. Navigate to `public_html`
4. Upload all files from `desklab` folder
5. Create database in "MySQL Databases"
6. Import `database/schema.sql`
7. Update `config/database.php` with online credentials

---

### **Method 2: FTP Upload**

1. Download FileZilla: https://filezilla-project.org/
2. Connect using FTP credentials from host
3. Upload all files to `public_html/desklab/`
4. Set file permissions (755 for folders, 644 for files)
5. Create database via cPanel
6. Import schema
7. Update config

---

## Testing Online

### **After Upload:**

1. **Test connection:**
   ```
   https://yourdomain.com/desklab/test_connection.php
   ```

2. **Test class detection:**
   ```
   https://yourdomain.com/desklab/test_class_detection.php
   ```

3. **Access admin:**
   ```
   https://yourdomain.com/desklab/admin.html
   ```

4. **Access student:**
   ```
   https://yourdomain.com/desklab/index.html
   ```

---

## Security for Online

### **Important Security Steps:**

1. **Delete test files after confirming it works:**
   ```
   - test_connection.php
   - test_class_detection.php
   - create_test_class_now.php
   - debug.html (or password protect it)
   ```

2. **Change default admin credentials**

3. **Use strong database password**

4. **Enable HTTPS (SSL certificate)**
   - Most hosts provide free Let's Encrypt SSL

5. **Regular backups**
   - Weekly database exports
   - Monthly full backups

---

## Quick Reference

### **Current Local Setup:**
```
URL: http://localhost/desklab/
Database: localhost/desklab
User: root
Pass: (empty)
```

### **After Online (Example):**
```
URL: https://yourdomain.com/desklab/
Database: Remote MySQL server
User: provided by host
Pass: set by you
```

---

## Rollback Plan

### **If Something Goes Wrong Online:**

1. **Restore from local backup:**
   ```
   C:\Users\Kieth\Documents\Code\desklab_backup_2025-12-15
   ```

2. **Restore database:**
   ```
   Import: desklab_backup_2025-12-15.sql
   ```

3. **Check GitHub repository:**
   ```
   Clone fresh copy from GitHub
   ```

---

## File Sizes to Expect

```
Total Project Size: ~2-5 MB
├── Code Files: ~500 KB
├── Documentation: ~100 KB
└── Database: ~50 KB (empty schema)
```

**Upload Time:**
- Fast internet: 1-2 minutes
- Slow internet: 5-10 minutes

---

## Common Issues & Solutions

### **Issue: "Database connection failed" online**
**Solution:**
- Check database credentials in config/database.php
- Verify database exists in cPanel
- Check if user has permissions

### **Issue: "500 Internal Server Error"**
**Solution:**
- Check file permissions (644/755)
- Check .htaccess syntax
- Enable error reporting temporarily
- Check PHP version compatibility

### **Issue: "White page/Nothing loads"**
**Solution:**
- Check if files uploaded to correct directory
- Verify index.html exists
- Check browser console for errors (F12)

---

## Next Steps

1. ✅ **Create local backup** (follow Method 1 above)
2. ✅ **Create GitHub repository**
3. ✅ **Upload to GitHub**
4. ⏳ **Choose web host**
5. ⏳ **Upload to online server**
6. ⏳ **Test online**
7. ⏳ **Remove test files**
8. ⏳ **Enable HTTPS**

---

**Questions? Check the documentation files or ask for help!**

**Status:** Ready for backup & upload ✅
**Local Version:** v1.0.7
**Last Updated:** 2025-12-15
