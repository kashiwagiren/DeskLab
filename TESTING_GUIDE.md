# 🧪 DeskLab Firebase Testing Guide

## Your System Status: ✅ WORKING!

Based on your screenshots, Firebase is working correctly! Here's what to test next:

---

## ✅ What's Already Working

1. **Firebase Connection** - Connected to `desklab-b8631`
2. **Admin Dashboard** - Loading successfully
3. **Classes in Firestore** - Data is being saved and retrieved
4. **Real-time Listeners** - Active (badges showing counts)

---

## 🔧 Fix the "undefined" Class

The class showing "undefined" in your screenshot has missing data. Here's how to fix it:

### Option 1: Delete and Re-add (Recommended)

1. Click the "Delete" button on that class
2. Click "+ Add Class"
3. Fill in ALL fields:
   - EDP Code: `15602`
   - Course Subject: `CPE 412` (this was missing!)
   - Instructor: `Instructor Name`
   - Room Number: `431`
   - Start Time: `17:50`
   - End Time: `18:00`
   - Days: Check MON, WED, SAT
4. Click "Add Class"

### Option 2: Fix Directly in Firebase Console

1. Go to: https://console.firebase.google.com/project/desklab-b8631/firestore
2. Find the `classes` collection
3. Click on the document
4. Add field: `courseSubject` with value `CPE 412`
5. Save

---

## 🧪 Complete Testing Checklist

### Test 1: Admin Dashboard - Overview ✅

- [x] Dashboard loads
- [ ] Pending count shows (currently 0)
- [ ] Active users count shows (currently 0)
- [ ] Current class shows "No Class" (since it's not class time)
- [ ] Clock is running

### Test 2: Add a Test Class ✅

- [ ] Click "Manage Classes"
- [ ] Click "+ Add Class"
- [ ] Fill in all fields:
  ```
  EDP Code: 12345
  Course Subject: TEST 101
  Instructor: Test Instructor
  Room Number: 431
  Start Time: [Current time + 5 minutes]
  End Time: [Current time + 1 hour]
  Days: [Check today's day]
  ```
- [ ] Click "Add Class"
- [ ] Should see success message
- [ ] Class appears in the table
- [ ] All fields show correctly (not "undefined")

### Test 3: Student Registration

- [ ] Click "Register Student"
- [ ] Fill in student details:
  ```
  Student ID: 12345678
  Student Name: Test Student
  Year & Section: BSCPE - 4
  ```
- [ ] Check the TEST 101 class (or any class)
- [ ] Click "Register Student"
- [ ] Should see success message

### Test 4: Student Login - Enrolled Student

1. **Open student page in a NEW BROWSER or INCOGNITO:**
   ```
   https://kashiwagiren.github.io/desklab/index.html
   ```

2. **Click "Login"**

3. **Fill in manual entry:**
   ```
   Student Name: Test Student
   Student ID: 12345678
   Year & Section: BSCPE - 4
   Room Number: 431
   Purpose: (leave blank if class is in session)
   ```

4. **Expected Results:**
   - If class is in session AND student is enrolled:
     - ✅ Auto-approved
     - ✅ Redirects to session page immediately
   - If no class or not enrolled:
     - ⏳ Shows "Waiting for admin response"

### Test 5: Admin Approval (If Pending)

**Keep BOTH windows open side-by-side:**

1. **Admin Window:**
   - Click "Pending Requests"
   - Should see the student's request appear instantly
   - Click "Approve"

2. **Student Window:**
   - Should redirect to session page immediately
   - No refresh needed!

### Test 6: Active Session Monitoring

**Student Session Page:**
- [ ] Student name shows correctly
- [ ] Student ID shows correctly
- [ ] Room number shows correctly
- [ ] Time In shows correctly
- [ ] Duration timer is counting up (HH:MM:SS)
- [ ] Status shows correct value

**Admin Dashboard:**
- [ ] Click "Active Users"
- [ ] Student appears in the table
- [ ] Duration is updating
- [ ] All info is correct

### Test 7: Force Logout (Real-time Test!)

**Keep BOTH windows visible:**

1. **Admin Window:**
   - Go to "Active Users"
   - Click "Force Logout" on the test student

2. **Student Window:**
   - Should show "Force Logout" message immediately
   - Should show session summary

### Test 8: Manual Logout

1. **Student Session Page:**
   - Click "Logout" button
   - Confirm logout
   - Should see "Logout Successful" message
   - Should show session duration

2. **Admin Dashboard:**
   - Go to "Login Logs"
   - Should see the completed session
   - Time Out should be filled
   - Duration should show as "Xh Ym"

### Test 9: Schedule Viewer

**Student Page:**
- [ ] Click "View Schedule"
- [ ] Select "Room 431" from dropdown
- [ ] Should see all classes for room 431
- [ ] Classes grouped by day
- [ ] Current class highlighted (if any)

### Test 10: Real-time Updates Test

**Keep admin dashboard open for 30 seconds:**
- [ ] Stats refresh automatically every 30 seconds
- [ ] Clock updates every second
- [ ] Pending requests update without refresh (if any)
- [ ] Active users update without refresh (if any)

---

## 🐛 Troubleshooting

### Issue: "Failed to delete class"

**Cause:** Firestore security rules or document doesn't exist

**Fix:**
1. Go to Firebase Console
2. Firestore Database → Rules
3. Make sure rules allow delete:
   ```javascript
   allow delete: if true;
   ```
4. Click "Publish"

### Issue: "Permission denied"

**Cause:** Firestore is no longer in test mode

**Fix:**
1. Firebase Console → Firestore → Rules
2. Set rules to test mode temporarily:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
3. Click "Publish"

### Issue: Data not showing up

**Fix:**
1. Open browser console (F12)
2. Look for Firebase errors
3. Check Firebase Console to see if data exists
4. Verify firebase-config.js has correct credentials

### Issue: Real-time updates not working

**Fix:**
1. Check browser console for errors
2. Make sure you're using same Firebase project
3. Verify Firestore rules allow read access

---

## 📊 Firebase Console - View Your Data

**Check data in Firebase:**
```
https://console.firebase.google.com/project/desklab-b8631/firestore
```

**Collections you should see:**
- `classes` - Your test class(es)
- `students` - Registered students
- `enrollments` - Student class enrollments
- `logins` - Login sessions (if tested)
- `pending_requests` - Pending approvals (if tested)

---

## ✅ Success Criteria

Your system is working correctly if:

- ✅ Admin can add classes
- ✅ Admin can register students
- ✅ Students can login
- ✅ Enrolled students get auto-approved
- ✅ Non-enrolled students require admin approval
- ✅ Admin sees pending requests in real-time
- ✅ Students get approved/rejected in real-time (no refresh!)
- ✅ Admin can force logout students
- ✅ Session monitoring works
- ✅ Login logs display correctly
- ✅ Schedule viewer works

---

## 🎯 Next Steps After Testing

Once all tests pass:

### 1. Clean Up Test Data
```
Go to Firebase Console → Firestore
Delete test students/classes
```

### 2. Add Real Data
- Add real classes for your lab
- Register real students
- Add real enrollments

### 3. Update Security Rules (IMPORTANT!)
```javascript
// Firestore Rules - More Secure
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Students - anyone can read, admin can write
    match /students/{studentId} {
      allow read: if true;
      allow write: if request.auth != null; // TODO: Add admin check
    }

    // Classes - anyone can read, admin can write
    match /classes/{classId} {
      allow read: if true;
      allow write: if request.auth != null; // TODO: Add admin check
    }

    // Logins - students can create, everyone can read, admin can update
    match /logins/{loginId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if request.auth != null; // TODO: Add admin check
    }

    // Pending requests - students can create, everyone can read, admin can update
    match /pending_requests/{requestId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if request.auth != null; // TODO: Add admin check
    }

    // Enrollments - anyone can read, admin can write
    match /enrollments/{enrollmentId} {
      allow read: if true;
      allow write: if request.auth != null; // TODO: Add admin check
    }
  }
}
```

### 4. Optional: Add Admin Authentication
- Enable Firebase Authentication
- Create admin login page
- Protect admin routes
- Update security rules to check for admin user

### 5. Deploy Final Version
```bash
git add .
git commit -m "Pure Firebase DeskLab - Production Ready"
git push
```

---

## 📝 Known Limitations (Due to GitHub Pages)

These features won't work on GitHub Pages (PHP-only):
- ❌ Study load upload with OCR
- ❌ PDF processing
- ❌ Image text extraction

**Workaround:** Students use manual entry instead

---

## 🎉 Congratulations!

If all tests pass, your DeskLab is:
- ✅ 100% Firebase-powered
- ✅ Zero PHP dependencies
- ✅ Working on GitHub Pages
- ✅ Real-time updates everywhere
- ✅ Production-ready!

**Your live URL:**
```
https://kashiwagiren.github.io/desklab/
```

**Questions? Check:**
- PURE_FIREBASE_COMPLETE.md
- FIREBASE_SETUP_COMPLETE.md
- FIREBASE_MIGRATION_GUIDE.md
