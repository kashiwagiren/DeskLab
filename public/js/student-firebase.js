// Student Login - Pure Firebase (No PHP!)
// This file uses ONLY Firebase Firestore queries

console.log('Loading student-firebase.js...');

// ===========================
// UI State Management
// ===========================

function showMainMenu() {
  document.getElementById('mainMenu').classList.remove('hidden');
  document.getElementById('scheduleSection').classList.add('hidden');
  document.getElementById('loginSection').classList.add('hidden');
}

function showSchedule() {
  document.getElementById('mainMenu').classList.add('hidden');
  document.getElementById('scheduleSection').classList.remove('hidden');
  loadRoomsList();
}

function showLogin() {
  document.getElementById('mainMenu').classList.add('hidden');
  document.getElementById('loginSection').classList.remove('hidden');
}

function showUploadForm() {
  document.getElementById('uploadForm').classList.remove('hidden');
  document.getElementById('manualForm').classList.add('hidden');
}

function showManualForm() {
  document.getElementById('uploadForm').classList.add('hidden');
  document.getElementById('manualForm').classList.remove('hidden');
}

// ===========================
// Schedule Viewer
// ===========================

async function loadRoomsList() {
  try {
    const snapshot = await classesCollection.get();
    const rooms = new Set();

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.roomNumber) {
        rooms.add(data.roomNumber);
      }
    });

    const roomSelect = document.getElementById('roomSelect');
    if (roomSelect) {
      roomSelect.innerHTML = '<option value="">-- Choose a room --</option>';
      Array.from(rooms).sort().forEach(room => {
        roomSelect.innerHTML += `<option value="${room}">${room}</option>`;
      });
    }

    // Also populate room select in login form
    const loginRoomSelect = document.getElementById('roomNumber');
    if (loginRoomSelect) {
      loginRoomSelect.innerHTML = '<option value="">-- Select Room --</option>';
      Array.from(rooms).sort().forEach(room => {
        loginRoomSelect.innerHTML += `<option value="${room}">${room}</option>`;
      });
    }
  } catch (error) {
    console.error('Error loading rooms:', error);
  }
}

async function loadSchedule() {
  const roomNumber = document.getElementById('roomSelect').value;
  const scheduleDisplay = document.getElementById('scheduleDisplay');

  if (!roomNumber) {
    scheduleDisplay.innerHTML = '<p class="no-data">Please select a room</p>';
    return;
  }

  try {
    const snapshot = await classesCollection
      .where('roomNumber', '==', roomNumber)
      .get();

    if (snapshot.empty) {
      scheduleDisplay.innerHTML = '<p class="no-data">No classes scheduled for this room</p>';
      return;
    }

    // Group classes by day
    const schedule = {
      'MON': [],
      'TUE': [],
      'WED': [],
      'THU': [],
      'FRI': [],
      'SAT': [],
      'SUN': []
    };

    snapshot.forEach(doc => {
      const cls = { id: doc.id, ...doc.data() };
      const days = cls.days.split(',').map(d => d.trim());

      days.forEach(day => {
        if (schedule[day]) {
          schedule[day].push(cls);
        }
      });
    });

    // Sort classes by start time
    Object.keys(schedule).forEach(day => {
      schedule[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    // Display schedule
    let html = '<div class="schedule-grid">';

    Object.keys(schedule).forEach(day => {
      html += `<div class="day-schedule">`;
      html += `<h3>${day}</h3>`;

      if (schedule[day].length === 0) {
        html += '<p class="no-classes">No classes</p>';
      } else {
        schedule[day].forEach(cls => {
          const isNow = isDayMatch(cls.days, getCurrentDay()) &&
                        isTimeBetween(cls.startTime, cls.endTime);

          html += `
            <div class="class-item ${isNow ? 'class-active' : ''}">
              <div class="class-time">${cls.startTime} - ${cls.endTime}</div>
              <div class="class-subject">${cls.courseSubject}</div>
              <div class="class-instructor">${cls.instructor}</div>
              <div class="class-edp">EDP: ${cls.edpCode}</div>
            </div>
          `;
        });
      }

      html += '</div>';
    });

    html += '</div>';
    scheduleDisplay.innerHTML = html;

  } catch (error) {
    console.error('Error loading schedule:', error);
    scheduleDisplay.innerHTML = '<p class="error">Failed to load schedule</p>';
  }
}

// ===========================
// Room Selection Handler
// ===========================

function handleRoomSelection() {
  const roomNumber = document.getElementById('roomNumber').value;
  const purposeSection = document.getElementById('purposeSection');

  if (!roomNumber) {
    purposeSection.classList.add('hidden');
    return;
  }

  // Check if there's a class in this room right now
  checkCurrentClass(roomNumber);
}

async function checkCurrentClass(roomNumber) {
  try {
    const currentDay = getCurrentDay();
    const currentTime = getCurrentTimeString();

    const snapshot = await classesCollection
      .where('roomNumber', '==', roomNumber)
      .get();

    let hasCurrentClass = false;

    snapshot.forEach(doc => {
      const cls = doc.data();
      if (isDayMatch(cls.days, currentDay) && isTimeBetween(cls.startTime, cls.endTime)) {
        hasCurrentClass = true;
      }
    });

    const purposeSection = document.getElementById('purposeSection');

    if (!hasCurrentClass) {
      // No class right now - require purpose
      purposeSection.classList.remove('hidden');
    } else {
      // Class in session - hide purpose (will check enrollment)
      purposeSection.classList.add('hidden');
    }
  } catch (error) {
    console.error('Error checking current class:', error);
  }
}

// ===========================
// File Upload Handler
// ===========================

function handleFileUpload(event) {
  const file = event.target.files[0];
  const uploadPreview = document.getElementById('uploadPreview');

  if (!file) return;

  // Show preview
  uploadPreview.classList.remove('hidden');
  uploadPreview.innerHTML = `
    <div class="file-preview">
      <p><strong>Selected file:</strong> ${file.name}</p>
      <p><strong>Size:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
      <p class="warning">⚠️ Note: OCR processing is not available on GitHub Pages.</p>
      <p>Please use Manual Entry instead.</p>
      <button class="btn btn-secondary" onclick="showManualForm()">
        Switch to Manual Entry
      </button>
    </div>
  `;
}

// ===========================
// Login Form Handler
// ===========================

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  const roomSelect = document.getElementById('roomNumber');
  if (roomSelect) {
    roomSelect.addEventListener('change', handleRoomSelection);
  }

  // Load rooms list on page load
  loadRoomsList();
});

async function handleLogin(event) {
  event.preventDefault();

  const studentName = document.getElementById('studentName').value.trim();
  const studentId = document.getElementById('studentId').value.trim();
  const yearSection = document.getElementById('yearSection').value.trim();
  const roomNumber = document.getElementById('roomNumber').value;
  const purpose = document.getElementById('purpose').value.trim();

  // Validation
  if (!studentName || !studentId || !yearSection || !roomNumber) {
    showNotification('Error', 'Please fill in all required fields');
    return;
  }

  if (studentId.length !== 8 || !/^\d+$/.test(studentId)) {
    showNotification('Error', 'Student ID must be exactly 8 digits');
    return;
  }

  showLoading(true);

  try {
    // Check if student exists in database
    const studentDoc = await studentsCollection.doc(studentId).get();
    const studentExists = studentDoc.exists;

    // Get current day and time
    const currentDay = getCurrentDay();
    const currentTime = getCurrentTimeString();

    // Find current class in selected room
    const classesSnapshot = await classesCollection
      .where('roomNumber', '==', roomNumber)
      .get();

    let currentClass = null;
    let upcomingClass = null;
    let minTimeDiff = Infinity;

    classesSnapshot.forEach(doc => {
      const cls = { id: doc.id, ...doc.data() };

      // Check if class is happening now
      if (isDayMatch(cls.days, currentDay) && isTimeBetween(cls.startTime, cls.endTime)) {
        currentClass = cls;
      }

      // Check for upcoming classes within 30 minutes
      if (isDayMatch(cls.days, currentDay) && currentTime < cls.startTime) {
        const timeDiff = timeStringToMinutes(cls.startTime) - timeStringToMinutes(currentTime);
        if (timeDiff <= 30 && timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff;
          upcomingClass = cls;
        }
      }
    });

    // Determine login logic
    if (currentClass) {
      // There's a class in session
      await handleClassInSession(studentId, studentName, yearSection, roomNumber, currentClass, purpose);
    } else if (upcomingClass) {
      // Class starting soon - warn user
      showClassWarning(upcomingClass, studentId, studentName, yearSection, roomNumber, purpose);
    } else {
      // No class - require purpose and admin approval
      await handleNoClass(studentId, studentName, yearSection, roomNumber, purpose);
    }

  } catch (error) {
    console.error('Error during login:', error);
    showNotification('Error', 'Login failed. Please try again.');
    showLoading(false);
  }
}

// ===========================
// Login Logic - Class in Session
// ===========================

async function handleClassInSession(studentId, studentName, yearSection, roomNumber, currentClass, purpose) {
  try {
    // Check if student is enrolled in this class
    const enrollmentSnapshot = await enrollmentsCollection
      .where('studentId', '==', studentId)
      .where('classId', '==', currentClass.id)
      .get();

    if (!enrollmentSnapshot.empty) {
      // Student is enrolled - automatic login
      const loginDoc = await loginsCollection.add({
        studentId: studentId,
        studentName: studentName,
        yearSection: yearSection,
        roomNumber: roomNumber,
        classId: currentClass.id,
        purpose: purpose || 'Enrolled in current class',
        status: 'Enrolled (Allowed)',
        timeIn: getCurrentTimestamp(),
        timeOut: null,
        isActive: true
      });

      showLoading(false);

      // Redirect to session page
      window.location.href = `session.html?loginId=${loginDoc.id}`;

    } else {
      // Student not enrolled - requires admin approval
      await createPendingRequest(studentId, studentName, yearSection, roomNumber, currentClass.id, purpose);
    }

  } catch (error) {
    console.error('Error handling class in session:', error);
    showNotification('Error', 'Failed to process login');
    showLoading(false);
  }
}

// ===========================
// Login Logic - No Class
// ===========================

async function handleNoClass(studentId, studentName, yearSection, roomNumber, purpose) {
  if (!purpose || purpose.trim() === '') {
    showLoading(false);
    showNotification('Error', 'Please state your purpose for using the computer');
    return;
  }

  try {
    // Create pending request for admin approval
    await createPendingRequest(studentId, studentName, yearSection, roomNumber, null, purpose);
  } catch (error) {
    console.error('Error handling no class:', error);
    showNotification('Error', 'Failed to create request');
    showLoading(false);
  }
}

// ===========================
// Pending Request Management
// ===========================

async function createPendingRequest(studentId, studentName, yearSection, roomNumber, classId, purpose) {
  try {
    const requestDoc = await pendingRequestsCollection.add({
      studentId: studentId,
      studentName: studentName,
      yearSection: yearSection,
      roomNumber: roomNumber,
      classId: classId,
      purpose: purpose || 'Not specified',
      adminDecision: 'Pending',
      requestTime: getCurrentTimestamp()
    });

    showLoading(false);

    // Show pending popup
    showPendingPopup(requestDoc.id);

  } catch (error) {
    console.error('Error creating pending request:', error);
    showNotification('Error', 'Failed to create request');
    showLoading(false);
  }
}

function showPendingPopup(requestId) {
  const popup = document.getElementById('pendingPopup');
  popup.classList.remove('hidden');

  // Listen for admin decision in real-time
  const unsubscribe = pendingRequestsCollection.doc(requestId).onSnapshot(doc => {
    if (!doc.exists) return;

    const data = doc.data();

    if (data.adminDecision === 'Accepted') {
      unsubscribe();

      // Create login entry and redirect
      createLoginFromApproval(requestId, data);

    } else if (data.adminDecision === 'Rejected') {
      unsubscribe();

      popup.classList.add('hidden');
      showNotification('Request Rejected', 'Your request was not approved. Please contact the administrator.');
    }
  });
}

async function createLoginFromApproval(requestId, requestData) {
  try {
    const loginDoc = await loginsCollection.add({
      studentId: requestData.studentId,
      studentName: requestData.studentName,
      yearSection: requestData.yearSection,
      roomNumber: requestData.roomNumber,
      classId: requestData.classId || null,
      purpose: requestData.purpose || 'Not specified',
      status: 'Admin Approved',
      timeIn: getCurrentTimestamp(),
      timeOut: null,
      isActive: true
    });

    // Redirect to session page
    window.location.href = `session.html?loginId=${loginDoc.id}`;

  } catch (error) {
    console.error('Error creating login from approval:', error);
    showNotification('Error', 'Login failed after approval');
  }
}

// ===========================
// Class Warning
// ===========================

function showClassWarning(upcomingClass, studentId, studentName, yearSection, roomNumber, purpose) {
  showLoading(false);

  const warningPopup = document.getElementById('classWarning');
  const warningMessage = document.getElementById('warningMessage');

  warningMessage.innerHTML = `
    A class is starting soon in this room:<br>
    <strong>${upcomingClass.courseSubject}</strong><br>
    ${upcomingClass.instructor}<br>
    Starts at ${upcomingClass.startTime}<br><br>
    You may be asked to leave when the class begins.
  `;

  warningPopup.classList.remove('hidden');

  // Store data for after acknowledgment
  window.loginData = {
    studentId,
    studentName,
    yearSection,
    roomNumber,
    purpose
  };
}

async function acknowledgeWarning() {
  const warningPopup = document.getElementById('classWarning');
  warningPopup.classList.add('hidden');

  if (!window.loginData) return;

  const { studentId, studentName, yearSection, roomNumber, purpose } = window.loginData;

  // Proceed with no-class login logic
  showLoading(true);
  await handleNoClass(studentId, studentName, yearSection, roomNumber, purpose);
}

// ===========================
// Helper Functions
// ===========================

function timeStringToMinutes(timeString) {
  const parts = timeString.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function showLoading(show) {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    if (show) {
      overlay.classList.remove('hidden');
    } else {
      overlay.classList.add('hidden');
    }
  }
}

function showNotification(title, message) {
  const popup = document.getElementById('notificationPopup');
  const popupTitle = document.getElementById('popupTitle');
  const popupMessage = document.getElementById('popupMessage');

  if (popup && popupTitle && popupMessage) {
    popupTitle.textContent = title;
    popupMessage.textContent = message;
    popup.classList.remove('hidden');
  } else {
    alert(`${title}: ${message}`);
  }
}

function closePopup() {
  const popup = document.getElementById('notificationPopup');
  if (popup) {
    popup.classList.add('hidden');
  }
}

console.log('✅ Student Firebase loaded successfully');
