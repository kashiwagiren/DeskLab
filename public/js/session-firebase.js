// Session Monitoring - Pure Firebase (No PHP!)
// This file uses ONLY Firebase Firestore queries

console.log('Loading session-firebase.js...');

let loginId = null;
let sessionListener = null;
let sessionData = null;

// ===========================
// Get Login ID from URL
// ===========================

function getLoginIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('loginId');
}

// ===========================
// Load Session Data
// ===========================

async function loadSession() {
  loginId = getLoginIdFromUrl();

  if (!loginId) {
    showError('No login session found. Please login again.');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 3000);
    return;
  }

  try {
    // Get initial session data
    const loginDoc = await loginsCollection.doc(loginId).get();

    if (!loginDoc.exists) {
      showError('Invalid session. Please login again.');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 3000);
      return;
    }

    sessionData = loginDoc.data();

    // Check if session is still active
    if (!sessionData.isActive) {
      showSessionEnded();
      return;
    }

    // Display session info
    displaySessionInfo(sessionData);

    // Setup real-time listener
    setupRealtimeListener();

    // Start session timer
    startSessionTimer();

  } catch (error) {
    console.error('Error loading session:', error);
    showError('Failed to load session data');
  }
}

// ===========================
// Display Session Info
// ===========================

function displaySessionInfo(data) {
  // Update student info
  const studentNameEl = document.getElementById('studentName');
  const studentIdEl = document.getElementById('studentId');
  const yearSectionEl = document.getElementById('yearSection');
  const roomNumberEl = document.getElementById('roomNumber');
  const statusEl = document.getElementById('status');
  const timeInEl = document.getElementById('timeIn');

  if (studentNameEl) studentNameEl.textContent = data.studentName || 'N/A';
  if (studentIdEl) studentIdEl.textContent = data.studentId || 'N/A';
  if (yearSectionEl) yearSectionEl.textContent = data.yearSection || 'N/A';
  if (roomNumberEl) roomNumberEl.textContent = data.roomNumber || 'N/A';
  if (statusEl) statusEl.textContent = data.status || 'N/A';
  if (timeInEl) timeInEl.textContent = data.timeIn ? formatDateTime(data.timeIn) : 'N/A';

  // Update purpose if exists
  const purposeEl = document.getElementById('purpose');
  if (purposeEl && data.purpose) {
    purposeEl.textContent = data.purpose;
  }

  // Update page title
  document.title = `DeskLab - ${data.studentName} - Session`;
}

// ===========================
// Real-time Listener
// ===========================

function setupRealtimeListener() {
  // Listen for changes to the login document
  sessionListener = loginsCollection.doc(loginId).onSnapshot(doc => {
    if (!doc.exists) {
      showError('Session terminated');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 3000);
      return;
    }

    const data = doc.data();

    // Check if admin forced logout
    if (!data.isActive && data.status === 'Admin Force Logout') {
      showForceLogout();
      return;
    }

    // Check if session ended
    if (!data.isActive && data.timeOut) {
      showSessionEnded();
      return;
    }

    // Update session data
    sessionData = data;
    displaySessionInfo(data);

  }, error => {
    console.error('Error in real-time listener:', error);
  });
}

// ===========================
// Session Timer
// ===========================

function startSessionTimer() {
  updateSessionDuration();

  // Update every second
  setInterval(updateSessionDuration, 1000);
}

function updateSessionDuration() {
  if (!sessionData || !sessionData.timeIn) return;

  const durationEl = document.getElementById('sessionDuration');
  if (!durationEl) return;

  const duration = calculateDuration(sessionData.timeIn, null);
  durationEl.textContent = duration;
}

// ===========================
// Manual Logout
// ===========================

async function logout() {
  if (!confirm('Are you sure you want to logout?')) {
    return;
  }

  try {
    await loginsCollection.doc(loginId).update({
      timeOut: getCurrentTimestamp(),
      isActive: false,
      status: 'Manual Logout'
    });

    // Stop listener
    if (sessionListener) {
      sessionListener();
    }

    showLogoutSuccess();

  } catch (error) {
    console.error('Error during logout:', error);
    alert('Logout failed. Please try again.');
  }
}

// ===========================
// UI Messages
// ===========================

function showError(message) {
  const container = document.querySelector('.container');
  if (container) {
    container.innerHTML = `
      <div class="error-message">
        <h2>⚠️ Error</h2>
        <p>${message}</p>
        <button class="btn btn-primary" onclick="window.location.href='index.html'">
          Back to Login
        </button>
      </div>
    `;
  }
}

function showForceLogout() {
  // Stop listener
  if (sessionListener) {
    sessionListener();
  }

  const container = document.querySelector('.container');
  if (container) {
    container.innerHTML = `
      <div class="logout-message">
        <h2>🚫 Force Logout</h2>
        <p>Your session was terminated by an administrator.</p>
        <p><strong>Time Out:</strong> ${sessionData.timeOut ? formatDateTime(sessionData.timeOut) : 'N/A'}</p>
        <p><strong>Duration:</strong> ${calculateDuration(sessionData.timeIn, sessionData.timeOut)}</p>
        <button class="btn btn-primary" onclick="window.location.href='index.html'">
          Back to Login
        </button>
      </div>
    `;
  }
}

function showSessionEnded() {
  // Stop listener
  if (sessionListener) {
    sessionListener();
  }

  const container = document.querySelector('.container');
  if (container) {
    container.innerHTML = `
      <div class="logout-message">
        <h2>✅ Session Ended</h2>
        <p>You have been logged out successfully.</p>
        <p><strong>Time In:</strong> ${sessionData.timeIn ? formatDateTime(sessionData.timeIn) : 'N/A'}</p>
        <p><strong>Time Out:</strong> ${sessionData.timeOut ? formatDateTime(sessionData.timeOut) : 'N/A'}</p>
        <p><strong>Duration:</strong> ${calculateDuration(sessionData.timeIn, sessionData.timeOut)}</p>
        <button class="btn btn-primary" onclick="window.location.href='index.html'">
          Back to Login
        </button>
      </div>
    `;
  }
}

function showLogoutSuccess() {
  const container = document.querySelector('.container');
  if (container) {
    container.innerHTML = `
      <div class="logout-message">
        <h2>✅ Logout Successful</h2>
        <p>Thank you for using DeskLab!</p>
        <p><strong>Time In:</strong> ${sessionData.timeIn ? formatDateTime(sessionData.timeIn) : 'N/A'}</p>
        <p><strong>Time Out:</strong> ${formatDateTime(getCurrentTimestamp())}</p>
        <p><strong>Duration:</strong> ${calculateDuration(sessionData.timeIn, getCurrentTimestamp())}</p>
        <button class="btn btn-primary" onclick="window.location.href='index.html'">
          Back to Login
        </button>
      </div>
    `;
  }
}

// ===========================
// Class Schedule Display (Optional)
// ===========================

async function loadCurrentClass() {
  if (!sessionData || !sessionData.classId) {
    return;
  }

  try {
    const classDoc = await classesCollection.doc(sessionData.classId).get();

    if (!classDoc.exists) return;

    const classData = classDoc.data();

    const classInfoEl = document.getElementById('classInfo');
    if (classInfoEl) {
      classInfoEl.innerHTML = `
        <h3>Current Class</h3>
        <p><strong>Course:</strong> ${classData.courseSubject}</p>
        <p><strong>Instructor:</strong> ${classData.instructor}</p>
        <p><strong>EDP Code:</strong> ${classData.edpCode}</p>
        <p><strong>Time:</strong> ${classData.startTime} - ${classData.endTime}</p>
      `;
    }
  } catch (error) {
    console.error('Error loading class info:', error);
  }
}

// ===========================
// Keyboard Shortcut for Logout
// ===========================

document.addEventListener('keydown', (event) => {
  // Ctrl+L or Cmd+L for logout
  if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
    event.preventDefault();
    logout();
  }
});

// ===========================
// Warn Before Closing Tab
// ===========================

window.addEventListener('beforeunload', (event) => {
  if (sessionData && sessionData.isActive) {
    event.preventDefault();
    event.returnValue = 'You are still logged in. Are you sure you want to leave?';
    return event.returnValue;
  }
});

// ===========================
// Cleanup on Unload
// ===========================

window.addEventListener('unload', () => {
  if (sessionListener) {
    sessionListener();
  }
});

// ===========================
// Initialize Session
// ===========================

document.addEventListener('DOMContentLoaded', () => {
  console.log('Session page initializing...');

  loadSession();

  // Setup logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  console.log('Session page ready!');
});

console.log('✅ Session Firebase loaded successfully');
