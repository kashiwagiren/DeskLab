# DeskLab Update v1.0.2

## New Features & Improvements

### 1. **Room Dropdown in Schedule Viewer** 🎯

**Before:** Manual text input for room number
**After:** Dropdown selection with all available rooms

#### Changes:
- Added `api/get_rooms.php` - Returns list of all rooms from database
- Updated `index.html` - Changed input to `<select>` dropdown
- Updated `public/css/student.css` - Styled select dropdown
- Updated `public/js/student.js` - Loads rooms automatically

#### How it works:
1. Click "View Schedule"
2. Dropdown automatically loads all rooms from database
3. Select a room from dropdown
4. Schedule loads automatically (no button needed)

#### Benefits:
- ✅ No typing errors
- ✅ See all available rooms
- ✅ Faster selection
- ✅ Better UX

---

### 2. **Improved Study Load Processing** 📄

**Before:** Study load upload didn't extract any data
**After:** Automatically extracts Student ID, Name, and Year/Section from PDF

#### Enhanced Features:

**PDF Text Extraction:**
- Method 1: Uses `pdftotext` if available (best quality)
- Method 2: Basic PHP PDF parsing (fallback)
- Extracts text from PDF study loads

**Improved Pattern Recognition:**
Based on University of Cebu study load format:
```
22653075  NICO WILFERD T. FLORES  BSCPE 4
```

**Patterns Detected:**
- ✅ **Student ID**: 8-digit numbers (e.g., "22653075")
- ✅ **Student Name**: Uppercase names (e.g., "NICO WILFERD T. FLORES")
- ✅ **Year & Section**: BSCPE 4, BSIT-3, etc.

#### Code Examples:

**Student ID Pattern:**
```php
preg_match('/\b(\d{8})\b/', $text, $matches)
```

**Name Pattern (Multiple formats):**
```php
// Format 1: FIRSTNAME MIDDLENAME I. LASTNAME
preg_match('/([A-Z]+(?:\s+[A-Z]+)+\s+[A-Z]\.?\s+[A-Z]+)/', $text)

// Format 2: Title Case Name
preg_match('/([A-Z][a-z]+(?:\s+[A-Z][a-z]+){2,})/', $text)
```

**Year & Section Pattern:**
```php
// Format: BSCPE 4 or BSCPE-4
preg_match('/(BS[A-Z]{2,4})\s*[-\s]*(\d)/', $text)
```

---

### 3. **Modified Files**

#### New Files (1):
1. **api/get_rooms.php** - Returns available rooms

#### Updated Files (4):
1. **index.html** - Dropdown instead of text input
2. **public/css/student.css** - Select styling
3. **public/js/student.js** - Load rooms function
4. **api/process_studyload.php** - Better text extraction & parsing

---

### 4. **Testing the Updates**

#### Test Room Dropdown:
1. Open student interface
2. Click "View Schedule"
3. **Expected:** Dropdown shows all rooms (e.g., 419C, 420B, 431)
4. Select a room
5. **Expected:** Schedule loads automatically

#### Test Study Load Processing:

**For PDF Upload:**
1. Click "Login" → "Upload Study Load"
2. Upload the University of Cebu study load PDF
3. Click "Process Study Load"
4. **Expected:** Form auto-fills with:
   - Student ID: 22653075
   - Name: NICO WILFERD T. FLORES
   - Year & Section: BSCPE - 4
5. Verify information and complete login

**For Image Upload:**
1. Upload clear image/screenshot of study load
2. Process image
3. **Expected:** Extracts available data (may be limited without Tesseract)

---

### 5. **Installation Notes**

#### No Database Changes Required
All updates are in code only - existing database works as-is.

#### Optional: Install Tesseract for Better OCR

**For better image processing:**

**Windows:**
```bash
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
# Install and add to PATH
```

**Linux:**
```bash
sudo apt-get install tesseract-ocr
```

**Mac:**
```bash
brew install tesseract
```

**Verify Installation:**
```bash
tesseract --version
```

#### Optional: Install pdftotext for Better PDF Extraction

**Windows:**
- Download poppler-utils from https://blog.alivate.com.au/poppler-windows/
- Extract and add to PATH

**Linux:**
```bash
sudo apt-get install poppler-utils
```

**Mac:**
```bash
brew install poppler
```

**Verify:**
```bash
pdftotext -v
```

---

### 6. **Known Limitations**

#### Study Load Processing:
1. **Without Tesseract/pdftotext:**
   - Basic text extraction (limited accuracy)
   - May not work on all PDF formats
   - Best with simple, text-based PDFs

2. **With Tesseract/pdftotext:**
   - ✅ High accuracy
   - ✅ Works with images
   - ✅ Better PDF parsing

3. **Format Requirements:**
   - Study load must contain clear text
   - Scanned images work better with Tesseract
   - Proper UC format preferred

#### Recommendations:
- Always verify extracted data before submitting
- Manual entry always available as backup
- Consider implementing cloud OCR for production (Google Vision, AWS Textract)

---

### 7. **Future Enhancements**

**Planned for v1.1.0:**
- [ ] Google Vision API integration (cloud OCR)
- [ ] Auto-populate room based on uploaded schedule
- [ ] Extract enrolled classes from study load
- [ ] Auto-register student with extracted data
- [ ] Batch student registration from study loads
- [ ] Support for multiple study load formats

**Planned for v1.2.0:**
- [ ] QR code on study load for instant login
- [ ] Camera capture for study load upload
- [ ] Mobile-optimized upload interface
- [ ] Real-time validation feedback

---

### 8. **Version History**

**v1.0.0** (Dec 15, 2024)
- Initial release

**v1.0.1** (Dec 15, 2024)
- Fixed class notifications
- Added duration to logs
- Implemented auto-logout

**v1.0.2** (Dec 15, 2024)
- ✅ Room dropdown in schedule viewer
- ✅ Improved study load processing
- ✅ Better PDF text extraction
- ✅ Enhanced pattern matching for UC format

---

### 9. **Upgrade Instructions**

**From v1.0.1 to v1.0.2:**

1. **Backup your files** (optional but recommended)

2. **Replace updated files:**
   ```
   api/process_studyload.php
   api/get_rooms.php (new)
   index.html
   public/css/student.css
   public/js/student.js
   ```

3. **Clear browser cache:**
   - Press Ctrl+F5 to hard refresh
   - Or clear cache in browser settings

4. **Test the updates:**
   - View Schedule → Dropdown should appear
   - Upload Study Load → Should extract data

5. **No database changes needed!**

---

### 10. **Support & Troubleshooting**

#### Room Dropdown Empty?
- **Check:** Database has classes added
- **Run:** `SELECT DISTINCT room_number FROM Classes;`
- **Fix:** Add classes through admin dashboard

#### Study Load Not Processing?
- **Check:** File uploaded successfully
- **Check:** Browser console for errors (F12)
- **Try:** Manual entry as alternative
- **Install:** Tesseract/pdftotext for better results

#### Extraction Not Working?
- **Verify:** PDF contains actual text (not just image)
- **Test:** Open PDF and try to select/copy text
- **Solution:** Use image format with Tesseract instead

---

**Status:** v1.0.2 Released ✅
**Tested On:** XAMPP 8.0, PHP 8.1, MySQL 8.0
**Compatibility:** All browsers (Chrome, Firefox, Edge)
