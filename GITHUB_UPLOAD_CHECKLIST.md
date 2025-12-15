# GitHub Upload Checklist ✅

## Before You Start

### ⚠️ IMPORTANT: Backup First!

**Run this now:**
1. Double-click: `QUICK_BACKUP.bat`
2. Export database:
   - http://localhost/phpmyadmin
   - Click "desklab" → Export → Go
   - Save to backup folder

---

## Step-by-Step Upload to GitHub

### 1. Create GitHub Account (if needed)
- [ ] Go to https://github.com/signup
- [ ] Create free account
- [ ] Verify email

### 2. Install Git (if needed)
- [ ] Download: https://git-scm.com/download/win
- [ ] Install with default settings
- [ ] Restart computer if prompted

### 3. Configure Git
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 4. Create GitHub Repository
- [ ] Go to: https://github.com/new
- [ ] Repository name: `desklab`
- [ ] Description: "Computer Laboratory Management System"
- [ ] Choose: Public or Private
- [ ] **Don't** check "Add README" (we already have one)
- [ ] Click "Create repository"

### 5. Initialize Local Git

Open **Git Bash** or **Command Prompt** in your project folder:

```bash
cd C:\Users\Kieth\Documents\Code\desklab
```

Then run these commands **one by one**:

```bash
# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - DeskLab v1.0.7"

# Add remote (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/desklab.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 6. Verify Upload
- [ ] Go to your GitHub repository URL
- [ ] Check files are there
- [ ] Verify README.md displays correctly
- [ ] Check .gitignore is working (database.php should NOT be there)

---

## What Gets Uploaded

### ✅ These files WILL be uploaded:
- All `.html` files
- All `.php` API files
- All `.css` and `.js` files
- `database/schema.sql`
- `config/database.example.php`
- All documentation (`.md` files)
- `.gitignore`

### ❌ These files will NOT be uploaded (good!):
- `config/database.php` (has your password)
- Database backups (.sql files)
- `.vscode`, `.idea` folders
- `vendor`, `node_modules` folders

---

## After Upload - What's Next?

### Option 1: Keep it Local Only
✅ Done! You now have:
- Local backup
- GitHub repository
- Version control

### Option 2: Deploy Online

See [BACKUP_INSTRUCTIONS.md](BACKUP_INSTRUCTIONS.md) for full guide.

**Quick steps:**
1. Choose hosting (Hostinger, Namecheap, etc.)
2. Upload via FTP or cPanel
3. Create online database
4. Update `config/database.php` with online credentials
5. Test!

---

## Troubleshooting

### "Permission denied" error
```bash
# Solution: Configure Git credentials
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### "remote origin already exists"
```bash
# Solution: Remove and re-add
git remote remove origin
git remote add origin https://github.com/YOUR-USERNAME/desklab.git
```

### "failed to push"
```bash
# Solution: Pull first then push
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Files showing as changed
```bash
# Solution: Line ending differences (normal on Windows)
git config core.autocrlf true
```

---

## Quick Commands Reference

### Check status
```bash
git status
```

### Add new changes
```bash
git add .
git commit -m "Your message here"
git push
```

### Pull latest changes
```bash
git pull
```

### View commit history
```bash
git log --oneline
```

---

## Security Checklist

Before making repository public:

- [ ] Database password NOT in any file
- [ ] No sensitive information in code
- [ ] `.gitignore` includes `config/database.php`
- [ ] Only `database.example.php` uploaded
- [ ] Test files are optional (decide if you want to share)

---

## GitHub Repository Setup

### Recommended Settings:

**Repository name:** `desklab` or `computer-lab-management`

**Description:**
```
Computer Laboratory Management System with student login,
class scheduling, and admin dashboard. Built with PHP,
MySQL, HTML, CSS, and JavaScript.
```

**Topics (tags):**
```
php, mysql, computer-lab, management-system, student-login,
admin-dashboard, class-scheduling, education, web-app
```

**README preview:**
- [ ] Add screenshots (take screenshots of your app)
- [ ] Add demo link (if deploying online)
- [ ] Update author information

---

## After First Upload

### Update Your Code Later:

```bash
# 1. Make changes to your files
# 2. Save changes
# 3. Commit and push:

git add .
git commit -m "Describe what you changed"
git push
```

### Clone to Another Computer:

```bash
git clone https://github.com/YOUR-USERNAME/desklab.git
cd desklab
cp config/database.example.php config/database.php
# Edit database.php with local credentials
```

---

## Success Indicators

You'll know it worked when:

✅ GitHub repository shows all your files
✅ README.md displays with formatting
✅ File count matches (minus ignored files)
✅ Can clone to another folder successfully
✅ No sensitive data visible

---

## Next Steps After Upload

1. **Add a LICENSE file** (optional)
   - Go to GitHub repo → Add file → Create new file
   - Name it `LICENSE`
   - Choose MIT License template
   - Commit

2. **Add screenshots** (recommended)
   - Create `screenshots` folder
   - Add images of your app
   - Update README.md with images

3. **Enable GitHub Pages** (optional)
   - Settings → Pages
   - Select main branch
   - Your static files will be live!

4. **Add collaborators** (if working with team)
   - Settings → Collaborators
   - Add by username or email

---

## Useful GitHub Features

### Issues
- Track bugs and feature requests
- Organize with labels

### Wiki
- Detailed documentation
- How-to guides

### Releases
- Version tagging
- Download packaged versions

### GitHub Actions
- Automated testing
- Continuous deployment

---

## Keep Your Backup Updated

Every major change:

```bash
# 1. Run backup script
QUICK_BACKUP.bat

# 2. Export database from phpMyAdmin

# 3. Push to GitHub
git add .
git commit -m "Update: describe changes"
git push
```

---

## Questions to Ask Yourself

Before uploading:

1. ✅ Is sensitive data removed/ignored?
2. ✅ Does README explain the project well?
3. ✅ Can someone else set it up from instructions?
4. ✅ Are test files necessary to share?
5. ✅ Is the code ready for others to see?

---

## Final Checklist

- [ ] Local backup created
- [ ] Database exported
- [ ] Git installed and configured
- [ ] GitHub account created
- [ ] Repository created on GitHub
- [ ] Local git initialized
- [ ] Files committed
- [ ] Pushed to GitHub
- [ ] Verified upload on GitHub
- [ ] `.gitignore` working correctly
- [ ] README displays correctly

---

**🎉 Congratulations! Your project is now on GitHub!**

**Share your repository:**
```
https://github.com/YOUR-USERNAME/desklab
```

**Clone command for others:**
```bash
git clone https://github.com/YOUR-USERNAME/desklab.git
```

---

**Need help? Check these resources:**
- GitHub Docs: https://docs.github.com
- Git Tutorial: https://git-scm.com/book/en/v2
- Issue Tracker: Create issue on your GitHub repo

---

**Status:** Ready for upload ✅
**Version:** v1.0.7
**Date:** 2025-12-15
