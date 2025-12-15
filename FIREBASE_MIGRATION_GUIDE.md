# 🔥 Firebase Migration Guide

## Why Firebase?

**Problems with GitHub Pages + MySQL:**

- ❌ GitHub Pages only hosts static files (HTML, CSS, JS)
- ❌ Can't run PHP on GitHub Pages
- ❌ Can't connect to MySQL database

**Firebase Solution:**

- ✅ Real-time database (Firestore)
- ✅ Works with static hosting
- ✅ Free tier (generous limits)
- ✅ No server needed
- ✅ Real-time updates
- ✅ Easy authentication

---

## Architecture Change

### Before (PHP + MySQL):

```
Browser → PHP Backend → MySQL Database
(Can't work on GitHub Pages)
```

### After (JavaScript + Firebase):

```
Browser → Firebase SDK → Firestore Database
(Works perfectly on GitHub Pages!)
```

---

## Step 1: Create Firebase Project

1. **Go to Firebase Console:**

   - https://console.firebase.google.com/

2. **Sign in with Google Account**

3. **Click "Add Project"**

   - Project name: `desklab`
   - Click Continue

4. **Disable Google Analytics** (optional)

   - Click Continue

5. **Click "Create Project"**
   - Wait for setup to complete
   - Click "Continue"

✅ **Firebase project created!**

---

## Step 2: Enable Firestore Database

1. **In Firebase Console, click "Firestore Database"** (left sidebar)

2. **Click "Create Database"**

3. **Choose Mode:**

   - Select: **"Start in test mode"** (for now)
   - Click Next

4. **Choose Location:**

   - Select: **asia-southeast1** (Singapore - closest to Philippines)
   - Click Enable

5. **Wait for database to be created**

✅ **Firestore database ready!**

---

## Step 3: Get Firebase Configuration

1. **Click the gear icon ⚙️ (top left) → Project settings**

2. **Scroll down to "Your apps"**

3. **Click the web icon `</>`** (Add app)

4. **Register app:**

   - App nickname: `DeskLab Web`
   - ✅ Check "Also set up Firebase Hosting"
   - Click "Register app"

5. **Copy the Firebase configuration:**

   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "desklab-xxxxx.firebaseapp.com",
     projectId: "desklab-xxxxx",
     storageBucket: "desklab-xxxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef",
   };

   // Import the functions you need from the SDKs you need
   import { initializeApp } from "firebase/app";
   import { getAnalytics } from "firebase/analytics";
   // TODO: Add SDKs for Firebase products that you want to use
   // https://firebase.google.com/docs/web/setup#available-libraries

   // Your web app's Firebase configuration
   // For Firebase JS SDK v7.20.0 and later, measurementId is optional
   const firebaseConfig = {
     apiKey: "AIzaSyAiTPS3i7r3M-s9z6GKz3t1wXcSfY5boqk",
     authDomain: "desklab-b8631.firebaseapp.com",
     projectId: "desklab-b8631",
     storageBucket: "desklab-b8631.firebasestorage.app",
     messagingSenderId: "932297576440",
     appId: "1:932297576440:web:48f9b18346f5c7ed5bd00d",
     measurementId: "G-M87VNXVKBZ",
   };

   // Initialize Firebase
   const app = initializeApp(firebaseConfig);
   const analytics = getAnalytics(app);
   ```

6. **Save this configuration!** You'll need it soon.

---

## Step 4: Create Firebase Config File

Create: `public/js/firebase-config.js`

```javascript
// Firebase Configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Collections
const studentsCollection = db.collection("students");
const classesCollection = db.collection("classes");
const enrollmentsCollection = db.collection("enrollments");
const loginsCollection = db.collection("logins");
const pendingRequestsCollection = db.collection("pending_requests");

console.log("Firebase initialized successfully");
```

---

## Step 5: Update HTML Files

### Update `index.html` (Student Page)

Add before `</head>`:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

<!-- Firebase Config -->
<script src="public/js/firebase-config.js"></script>
```

### Update `admin.html`

Add before `</head>`:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

<!-- Firebase Config -->
<script src="public/js/firebase-config.js"></script>
```

### Update `session.html`

Same as above.

---

## Step 6: Migrate Database Structure

### Firestore Collections (replaces MySQL tables):

**1. students**

```javascript
{
  studentId: "12345678",  // document ID
  studentName: "Juan Dela Cruz",
  yearSection: "BSCPE - 4",
  createdAt: timestamp
}
```

**2. classes**

```javascript
{
  classId: "auto-generated-id",  // document ID
  edpCode: "15602",
  courseSubject: "CPE 412",
  instructor: "Instructor Name",
  roomNumber: "431",
  startTime: "17:50:00",
  endTime: "18:00:00",
  days: "MON, WED, SAT",
  createdAt: timestamp
}
```

**3. enrollments**

```javascript
{
  enrollmentId: "auto-generated-id",
  studentId: "12345678",
  classId: "class-doc-id",
  enrolledAt: timestamp
}
```

**4. logins**

```javascript
{
  loginId: "auto-generated-id",
  studentId: "12345678",
  studentName: "Juan Dela Cruz",
  yearSection: "BSCPE - 4",
  roomNumber: "431",
  classId: "class-doc-id",
  purpose: "Study",
  status: "Enrolled (Allowed)",
  timeIn: timestamp,
  timeOut: null,
  isActive: true
}
```

**5. pending_requests**

```javascript
{
  requestId: "auto-generated-id",
  studentId: "12345678",
  studentName: "Juan Dela Cruz",
  yearSection: "BSCPE - 4",
  roomNumber: "431",
  classId: "class-doc-id",
  purpose: "Study",
  adminDecision: "Pending",
  requestTime: timestamp
}
```

---

## Step 7: Create Firebase Helper Functions

Create: `public/js/firebase-helpers.js`

```javascript
// Firebase Helper Functions

// Get current time as Firebase timestamp
function getCurrentTimestamp() {
  return firebase.firestore.Timestamp.now();
}

// Format time for display
function formatTime(timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate();
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// Format date for display
function formatDate(timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate();
  return date.toLocaleDateString("en-US");
}

// Get current day (MON, TUE, etc.)
function getCurrentDay() {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  return days[new Date().getDay()];
}

// Get current time as HH:MM:SS
function getCurrentTimeString() {
  const now = new Date();
  return now.toTimeString().split(" ")[0]; // "17:50:30"
}

// Check if current time is between start and end
function isTimeBetween(startTime, endTime) {
  const now = getCurrentTimeString();
  return now >= startTime && now <= endTime;
}

// Check if day is in days string
function isDayMatch(daysString, currentDay) {
  return daysString.includes(currentDay);
}

console.log("Firebase helpers loaded");
```

---

## Step 8: Rewrite Student Login

Create: `public/js/student-firebase.js`

Replace `student.js` with Firebase version.

Key changes:

```javascript
// OLD (PHP/MySQL)
const response = await fetch("api/login.php", {
  method: "POST",
  body: JSON.stringify(data),
});

// NEW (Firebase)
const loginDoc = await loginsCollection.add({
  studentId: studentId,
  studentName: studentName,
  yearSection: yearSection,
  roomNumber: roomNumber,
  timeIn: getCurrentTimestamp(),
  isActive: true,
  status: "Pending",
});
```

---

## Step 9: Rewrite Admin Dashboard

Create: `public/js/admin-firebase.js`

Replace `admin.js` with Firebase version.

Key changes:

```javascript
// Get pending requests
const snapshot = await pendingRequestsCollection
  .where("adminDecision", "==", "Pending")
  .get();

const requests = [];
snapshot.forEach((doc) => {
  requests.push({ id: doc.id, ...doc.data() });
});

// Real-time updates
pendingRequestsCollection
  .where("adminDecision", "==", "Pending")
  .onSnapshot((snapshot) => {
    // Update UI automatically when data changes
    updatePendingRequestsUI(snapshot);
  });
```

---

## Step 10: Set Firestore Security Rules

In Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Students can read their own data
    match /students/{studentId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Anyone can read classes
    match /classes/{classId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Students can create logins
    match /logins/{loginId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if request.auth != null;
    }

    // Students can create requests
    match /pending_requests/{requestId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if request.auth != null;
    }

    // Enrollments
    match /enrollments/{enrollmentId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**Note:** For production, add proper authentication!

---

## Step 11: Add Firebase Admin Authentication

For admin panel, add Firebase Authentication:

1. **Firebase Console → Authentication**
2. **Click "Get Started"**
3. **Enable "Email/Password"**
4. **Add admin user manually**

Then update admin.html:

```html
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
```

```javascript
// Check if admin is logged in
firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    // Redirect to login
    window.location.href = "admin-login.html";
  }
});
```

---

## Step 12: Migrate Existing Data

Create: `migrate-to-firebase.html`

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Migrate to Firebase</title>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
    <script src="public/js/firebase-config.js"></script>
  </head>
  <body>
    <h1>Migrate MySQL to Firebase</h1>
    <button onclick="migrateClasses()">Migrate Classes</button>
    <div id="status"></div>

    <script>
      async function migrateClasses() {
        const status = document.getElementById("status");
        status.innerHTML = "Migrating...";

        // Get data from MySQL (manually copy from phpMyAdmin)
        const classes = [
          {
            edpCode: "15602",
            courseSubject: "CPE 412",
            instructor: "Instructor Name",
            roomNumber: "431",
            startTime: "17:50:00",
            endTime: "18:00:00",
            days: "MON, WED, SAT",
          },
          // Add more classes...
        ];

        try {
          for (const cls of classes) {
            await classesCollection.add({
              ...cls,
              createdAt: firebase.firestore.Timestamp.now(),
            });
          }
          status.innerHTML = "Migration complete!";
        } catch (error) {
          status.innerHTML = "Error: " + error.message;
        }
      }
    </script>
  </body>
</html>
```

---

## Step 13: Test Locally

1. **Update all HTML files with Firebase SDK**
2. **Replace student.js with student-firebase.js**
3. **Replace admin.js with admin-firebase.js**
4. **Test on localhost**
5. **Check Firebase Console for data**

---

## Step 14: Deploy to GitHub Pages

1. **Commit changes:**

   ```bash
   git add .
   git commit -m "Migrate to Firebase"
   git push
   ```

2. **GitHub Pages will automatically update**

3. **Visit your site:**
   ```
   https://YOUR-USERNAME.github.io/desklab/
   ```

---

## File Structure After Migration

```
desklab/
├── public/
│   └── js/
│       ├── firebase-config.js        (NEW)
│       ├── firebase-helpers.js       (NEW)
│       ├── student-firebase.js       (NEW - replaces student.js)
│       ├── admin-firebase.js         (NEW - replaces admin.js)
│       └── session-firebase.js       (NEW - replaces session.js)
├── index.html                        (UPDATED - add Firebase SDK)
├── admin.html                        (UPDATED - add Firebase SDK)
├── session.html                      (UPDATED - add Firebase SDK)
└── migrate-to-firebase.html          (NEW - data migration tool)
```

---

## Benefits of Firebase

✅ Works on GitHub Pages (no PHP needed)
✅ Real-time updates (changes appear instantly)
✅ Offline support (works without internet)
✅ Scalable (handles many users)
✅ Free tier (50K reads/day, 20K writes/day)
✅ No server maintenance

---

## Next Steps

1. ✅ Create Firebase project
2. ✅ Enable Firestore
3. ✅ Get configuration
4. ⏳ Create firebase-config.js
5. ⏳ Update HTML files
6. ⏳ Rewrite JavaScript for Firebase
7. ⏳ Test locally
8. ⏳ Deploy to GitHub Pages

---

**Want me to create the complete Firebase version of your code?**

I can create:

- firebase-config.js
- firebase-helpers.js
- student-firebase.js
- admin-firebase.js
- session-firebase.js
- Updated HTML files

Just say "yes" and I'll generate all the files! 🚀
