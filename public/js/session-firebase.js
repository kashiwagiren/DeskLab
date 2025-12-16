// Session Monitoring - Pure Firebase (No PHP!)
// This file uses ONLY Firebase Firestore queries

console.log('Loading session-firebase.js...');

let loginId = null;
let sessionListener = null;
let sessionData = null;
let classCheckInterval = null;

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

    // Start class check (every 30 seconds)
    startClassCheck();

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

  const duration = calculateDuration(sessionData.timeIn, null);

  // Update both timer elements
  const durationEl = document.getElementById('sessionDuration');
  if (durationEl) durationEl.textContent = duration;

  const sessionTimeEl = document.getElementById('sessionTime');
  if (sessionTimeEl) sessionTimeEl.textContent = duration;
}

// ===========================
// Auto-Logout on Class Start
// ===========================

function startClassCheck() {
  // Check immediately
  checkForClassStart();
  
  // Then check every 30 seconds
  classCheckInterval = setInterval(checkForClassStart, 30000);
}

async function checkForClassStart() {
  if (!sessionData || !sessionData.roomNumber || !sessionData.isActive) return;
  
  // If student is enrolled in a class (status shows enrolled), don't auto-logout
  if (sessionData.status === 'Enrolled (Allowed)') return;
  
  try {
    const currentDay = getCurrentDay();
    const currentTime = getCurrentTimeString();
    
    // Check if any class is currently in session in this room
    const snapshot = await classesCollection
      .where('roomNumber', '==', sessionData.roomNumber)
      .get();
    
    let classInSession = null;
    
    snapshot.forEach(doc => {
      const cls = doc.data();
      if (isDayMatch(cls.days, currentDay) && isTimeBetween(cls.startTime, cls.endTime)) {
        classInSession = { id: doc.id, ...cls };
      }
    });
    
    if (classInSession) {
      // Check if student is enrolled in this class
      const enrollmentSnapshot = await enrollmentsCollection
        .where('studentId', '==', sessionData.studentId)
        .where('classId', '==', classInSession.id)
        .get();
      
      if (enrollmentSnapshot.empty) {
        // Student not enrolled - force logout
        await performAutoLogout(classInSession);
      }
    }
  } catch (error) {
    console.error('Error checking for class start:', error);
  }
}

async function performAutoLogout(classInfo) {
  // Stop the class check interval
  if (classCheckInterval) {
    clearInterval(classCheckInterval);
  }
  
  // Stop the session listener
  if (sessionListener) {
    sessionListener();
  }
  
  // Mark session as inactive
  if (sessionData) {
    sessionData.isActive = false;
  }
  
  try {
    await loginsCollection.doc(loginId).update({
      timeOut: getCurrentTimestamp(),
      isActive: false,
      status: 'Auto Logout - Class Started'
    });
  } catch (error) {
    console.error('Error updating logout status:', error);
  }
  
  // Show class started message
  showClassStartedLogout(classInfo);
}

function showClassStartedLogout(classInfo) {
  const container = document.querySelector('.session-container');
  if (container) {
    container.innerHTML = `
      <div class="logout-message class-started">
        <div class="logout-icon">📚</div>
        <h2>Class Has Started</h2>
        <p>You have been automatically logged out because a scheduled class has started in this room.</p>
        <div class="class-info-box">
          <p><strong>Class:</strong> ${classInfo.courseSubject}</p>
          <p><strong>Instructor:</strong> ${classInfo.instructor}</p>
          <p><strong>Time:</strong> ${classInfo.startTime} - ${classInfo.endTime}</p>
        </div>
        <p class="redirect-message">Redirecting to login page in <span id="countdown">5</span> seconds...</p>
        <button class="btn btn-primary" onclick="window.location.href='index.html'">
          Back to Login Now
        </button>
      </div>
    `;
  }
  
  // Auto-redirect countdown
  let countdown = 5;
  const countdownEl = document.getElementById('countdown');
  const timer = setInterval(() => {
    countdown--;
    if (countdownEl) {
      countdownEl.textContent = countdown;
    }
    if (countdown <= 0) {
      clearInterval(timer);
      window.location.href = 'index.html';
    }
  }, 1000);
}

// ===========================
// Custom Confirmation Modal
// ===========================

function showConfirmModal(title, message, icon = '⚠️') {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmTitle');
    const messageEl = document.getElementById('confirmMessage');
    const iconEl = document.getElementById('confirmIcon');
    const okBtn = document.getElementById('confirmOk');
    const cancelBtn = document.getElementById('confirmCancel');

    titleEl.textContent = title;
    messageEl.textContent = message;
    iconEl.textContent = icon;

    modal.classList.remove('hidden');

    const handleOk = () => {
      modal.classList.add('hidden');
      okBtn.removeEventListener('click', handleOk);
      cancelBtn.removeEventListener('click', handleCancel);
      resolve(true);
    };

    const handleCancel = () => {
      modal.classList.add('hidden');
      okBtn.removeEventListener('click', handleOk);
      cancelBtn.removeEventListener('click', handleCancel);
      resolve(false);
    };

    okBtn.addEventListener('click', handleOk);
    cancelBtn.addEventListener('click', handleCancel);
  });
}

// ===========================
// Manual Logout
// ===========================

async function logout() {
  const confirmed = await showConfirmModal(
    'Logout',
    'Are you sure you want to logout?',
    '👋'
  );

  if (!confirmed) return;

  // Mark session as inactive immediately to prevent beforeunload warning
  if (sessionData) {
    sessionData.isActive = false;
  }

  // Stop listener first
  if (sessionListener) {
    sessionListener();
  }

  // Show logging out overlay
  showLoggingOut();

  try {
    await loginsCollection.doc(loginId).update({
      timeOut: getCurrentTimestamp(),
      isActive: false,
      status: 'Manual Logout'
    });

    showLogoutSuccess();

  } catch (error) {
    console.error('Error during logout:', error);
    hideLoggingOut();
    showErrorMessage('Logout failed. Please try again.');
  }
}

function showLoggingOut() {
  const container = document.querySelector('.session-container');
  if (container) {
    const overlay = document.createElement('div');
    overlay.id = 'loggingOutOverlay';
    overlay.className = 'logging-out-overlay';
    overlay.innerHTML = `
      <div class="logging-out-content">
        <div class="logging-out-spinner"></div>
        <p>Logging out...</p>
      </div>
    `;
    container.appendChild(overlay);
  }
}

function hideLoggingOut() {
  const overlay = document.getElementById('loggingOutOverlay');
  if (overlay) {
    overlay.remove();
  }
}

function showErrorMessage(message) {
  const modal = document.getElementById('confirmModal');
  const titleEl = document.getElementById('confirmTitle');
  const messageEl = document.getElementById('confirmMessage');
  const iconEl = document.getElementById('confirmIcon');
  const okBtn = document.getElementById('confirmOk');
  const cancelBtn = document.getElementById('confirmCancel');

  titleEl.textContent = 'Error';
  messageEl.textContent = message;
  iconEl.textContent = '❌';
  
  okBtn.textContent = 'OK';
  cancelBtn.style.display = 'none';
  
  modal.classList.remove('hidden');

  okBtn.onclick = () => {
    modal.classList.add('hidden');
    cancelBtn.style.display = '';
    okBtn.textContent = 'Confirm';
  };
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
        <p class="redirect-message">Redirecting to login page in <span id="countdown">5</span> seconds...</p>
        <button class="btn btn-primary" onclick="window.location.href='index.html'">
          Back to Login Now
        </button>
      </div>
    `;
  }

  // Auto-redirect after 5 seconds with countdown
  let countdown = 5;
  const countdownEl = document.getElementById('countdown');
  const timer = setInterval(() => {
    countdown--;
    if (countdownEl) {
      countdownEl.textContent = countdown;
    }
    if (countdown <= 0) {
      clearInterval(timer);
      window.location.href = 'index.html';
    }
  }, 1000);
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
        <p class="redirect-message">Redirecting to login page in <span id="countdown">3</span> seconds...</p>
        <button class="btn btn-primary" onclick="window.location.href='index.html'">
          Back to Login Now
        </button>
      </div>
    `;
  }

  // Auto-redirect after 3 seconds with countdown
  let countdown = 3;
  const countdownEl = document.getElementById('countdown');
  const timer = setInterval(() => {
    countdown--;
    if (countdownEl) {
      countdownEl.textContent = countdown;
    }
    if (countdown <= 0) {
      clearInterval(timer);
      window.location.href = 'index.html';
    }
  }, 1000);
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
