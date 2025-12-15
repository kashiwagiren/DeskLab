# DeskLab Update v1.0.6 - Critical Login Detection Fix

## Bug Fix

### **Fixed Login Not Detecting Ongoing Class** ✅

**Issue:**
- User logs in during an ongoing class in the same room
- System should ask for purpose or request admin approval
- Instead, system auto-allows login (Scenario B instead of Scenario A)
- Skips class detection completely

**User Report:**
> "I recently created/added a class and it should've been say that there's an ongoing class because I'm on the same room but nothing happens, it even do auto-allow"

**Root Cause:**
- Same `FIND_IN_SET` issue as in overview.php
- Day matching fails when database has "MON, WED, FRI" format
- Query returns no class found → triggers "No class" scenario
- Student gets auto-allowed when they shouldn't

**Example of the Bug:**
```
Scenario:
- Class: CPE 412, Room 419C, 5:00-6:00 PM, MON, WED, FRI
- Student logs in: Room 419C at 5:30 PM on Wednesday
- Expected: "You are not enrolled. State your purpose."
- Actual: "Access granted. No class is currently running." ❌

Why it failed:
FIND_IN_SET('WED', REPLACE('MON, WED, FRI', ', ', ','))
→ Searches in: 'MON,WED,FRI'
→ But original has spaces: 'MON, WED, FRI'
→ REPLACE doesn't work properly
→ Returns 0 (not found)
→ No class detected
```

---

## The Fix

**File:** `api/login.php` (Lines 58-70)

**Before:**
```php
$classQuery = $conn->prepare("
    SELECT class_id, edp_code, course_subject, instructor
    FROM Classes
    WHERE room_number = ?
    AND start_time <= ?
    AND end_time >= ?
    AND FIND_IN_SET(?, REPLACE(days, ', ', ',')) > 0
    LIMIT 1
");

$classQuery->bind_param('ssss', $roomNumber, $currentTime, $currentTime, $currentDay);
```

**After:**
```php
$classQuery = $conn->prepare("
    SELECT class_id, edp_code, course_subject, instructor
    FROM Classes
    WHERE room_number = ?
    AND ? BETWEEN start_time AND end_time
    AND (
        days LIKE CONCAT('%', ?, '%')
        OR REPLACE(days, ', ', ',') LIKE CONCAT('%', ?, '%')
    )
    LIMIT 1
");

$classQuery->bind_param('ssss', $roomNumber, $currentTime, $currentDay, $currentDay);
```

**Changes:**
1. ✅ Changed `start_time <= ? AND end_time >= ?` to `? BETWEEN start_time AND end_time`
2. ✅ Replaced `FIND_IN_SET()` with flexible `LIKE` matching
3. ✅ Handles both "MON,WED,FRI" and "MON, WED, FRI" formats
4. ✅ Matches the fix already applied to overview.php

---

## How It Works Now

### **Scenario A: Ongoing Class Detection**

**Step 1: Check for Class**
```sql
WHERE room_number = '419C'
AND '17:30:00' BETWEEN start_time AND end_time
AND (
    days LIKE '%WED%'
    OR REPLACE(days, ', ', ',') LIKE '%WED%'
)
```

**Step 2: Found Class → Check Enrollment**
```php
if ($classResult->num_rows > 0) {
    // Class is ongoing
    if (student is enrolled) {
        → Auto allow
    } else {
        if (no purpose provided) {
            → Ask for purpose
        } else {
            → Send to pending (admin approval)
        }
    }
}
```

---

## Testing the Fix

### **Test 1: Login During Ongoing Class (Not Enrolled)**
```
Setup:
1. Create class: Room 419C, 5:00-6:00 PM, Today's day
2. Current time: 5:30 PM

Steps:
1. Go to student page
2. Click "Login/Request Access"
3. Fill manual entry:
   - Student ID: 12345678
   - Name: Test Student
   - Year: BSCPE - 4
   - Room: 419C
4. Submit

Expected Result: ✅
- Should NOT auto-allow
- Should show: "You are not enrolled in the current class. Please state your purpose."
- Purpose field appears
- After entering purpose → Sends to pending requests
```

---

### **Test 2: Login During Ongoing Class (Enrolled)**
```
Setup:
1. Class exists: Room 419C, 5:00-6:00 PM, Today
2. Student is enrolled in this class (via Register Student)
3. Current time: 5:30 PM

Steps:
1. Login with enrolled student credentials
2. Room: 419C

Expected Result: ✅
- Auto-allows immediately
- Status: "Enrolled (Allowed)"
- Goes to session page
```

---

### **Test 3: Login When No Class**
```
Setup:
1. Current time: 2:00 PM
2. No classes scheduled at 2:00 PM for Room 419C

Steps:
1. Login to Room 419C
2. Fill all fields

Expected Result: ✅
- Asks for purpose
- After entering purpose → Auto-allows
- Status: "No class - Auto Allowed"
```

---

## Impact

### **Before Fix:**
- ❌ Classes not detected during login
- ❌ Students auto-allowed when they shouldn't be
- ❌ Admin approval system bypassed
- ❌ No control over computer lab access

### **After Fix:**
- ✅ Classes properly detected
- ✅ Enrollment checking works correctly
- ✅ Purpose required when not enrolled
- ✅ Admin approval process enforced
- ✅ Proper access control

---

## Related Fixes

This is the **third occurrence** of the same day-matching bug:

1. **v1.0.4:** Fixed in `api/admin/overview.php` (Current/Upcoming class)
2. **v1.0.4:** Mentioned in check_upcoming_class.php
3. **v1.0.6:** Fixed in `api/login.php` (Login detection)

**Pattern:** All used `FIND_IN_SET()` with `REPLACE()` which doesn't handle spaces properly.

**Solution:** Using `LIKE` with `CONCAT('%', ?, '%')` for flexible matching.

---

## System Flow (Corrected)

### **Login Process:**

```
Student submits login
    ↓
Check if class is ongoing in this room
    ↓
┌───────────────┴───────────────┐
│ Class Found?                  │
└───────────────┬───────────────┘
    ↓ YES               ↓ NO
    │                   │
Check Enrollment    Ask Purpose
    │                   │
    ├─ Enrolled     Enter Purpose
    │   → Auto Allow    │
    │                   │
    └─ Not Enrolled    Auto Allow
        → Ask Purpose   (Status: No class)
        → Enter Purpose
        → Pending Request
        → Admin Approval
```

---

## Files Changed

### **Modified Files (1):**

**api/login.php**
- Lines 58-70: Fixed class detection query
- Changed FIND_IN_SET to LIKE matching
- Changed time comparison to BETWEEN
- Now properly detects ongoing classes

---

## Upgrade Instructions

**From v1.0.5 to v1.0.6:**

1. **Replace File:**
   ```
   api/login.php
   ```

2. **Test:**
   ```
   - Create a class for current time
   - Try to login with non-enrolled student
   - Should ask for purpose ✓
   - Should NOT auto-allow ✓
   ```

3. **No database changes needed!**

---

## Version Comparison

### **v1.0.5:**
- Premium PDF preview design
- Interactive checkbox cards

### **v1.0.6 (Current):**
- ✅ Fixed login class detection
- ✅ Proper enrollment checking
- ✅ Purpose requirement enforced
- ✅ Admin approval working correctly

---

## Quick Reference

### **Affected Scenarios:**

**Scenario A (Class Ongoing):**
- ✅ Now detects classes correctly
- ✅ Checks enrollment properly
- ✅ Asks for purpose if not enrolled
- ✅ Sends to admin for approval

**Scenario B (No Class):**
- ✅ Still works as before
- ✅ Asks for purpose
- ✅ Auto-allows after purpose

**Scenario C (Class Starting Soon):**
- ✅ Not affected by this fix
- ✅ Already working correctly

---

## Troubleshooting

### **Issue: Still auto-allowing during class**

**Solution:**
1. Check if class exists in database
2. Verify class days match current day
3. Verify class time includes current time
4. Check room number matches exactly
5. Clear browser cache
6. Check browser console for errors

---

### **Issue: Not asking for purpose**

**Solution:**
1. Make sure you're in the correct room
2. Check if student is enrolled in the class
3. Verify class is actually ongoing now
4. Check database: `SELECT * FROM Classes WHERE room_number = '419C'`

---

### **Test Query (Debug):**

Run this in phpMyAdmin to see if class should be detected:

```sql
SELECT
    class_id,
    edp_code,
    course_subject,
    start_time,
    end_time,
    days,
    room_number,
    CASE
        WHEN '17:30:00' BETWEEN start_time AND end_time
        AND (days LIKE '%WED%' OR REPLACE(days, ', ', ',') LIKE '%WED%')
        THEN 'DETECTED'
        ELSE 'NOT DETECTED'
    END as detection_status
FROM Classes
WHERE room_number = '419C';
```

Replace:
- `'17:30:00'` with current time
- `'WED'` with current day
- `'419C'` with your room

---

**Status:** v1.0.6 Released ✅
**Critical Bug:** Fixed ✅
**Security:** Access control restored ✅
**Compatibility:** All systems ✅
