// Admin Dashboard - Pure Firebase (No PHP!)
// This file uses ONLY Firebase Firestore queries

console.log('Loading admin-firebase.js...');

// ===========================
// Real-time Listeners
// ===========================

let pendingRequestsListener = null;
let activeUsersListener = null;
let activeUsersData = [];
let durationUpdateInterval = null;

function setupRealtimeListeners() {
  console.log('Setting up real-time listeners...');

  // Listen for pending requests
  pendingRequestsListener = pendingRequestsCollection
    .where('adminDecision', '==', 'Pending')
    .onSnapshot(snapshot => {
      console.log('Pending requests snapshot received, size:', snapshot.size);
      const requests = [];
      snapshot.forEach(doc => {
        requests.push({ id: doc.id, ...doc.data() });
      });
      console.log('Pending requests:', requests);
      displayPendingRequests(requests);
    }, error => {
      console.error('Error listening to pending requests:', error);
    });

  // Listen for active users
  activeUsersListener = loginsCollection
    .where('isActive', '==', true)
    .onSnapshot(snapshot => {
      console.log('Active users snapshot received, size:', snapshot.size);
      activeUsersData = [];
      snapshot.forEach(doc => {
        activeUsersData.push({ id: doc.id, ...doc.data() });
      });
      console.log('Active users:', activeUsersData);
      displayActiveUsers(activeUsersData);
      
      // Start duration update interval if not already running
      if (!durationUpdateInterval) {
        durationUpdateInterval = setInterval(updateActiveUserDurations, 1000);
      }
    }, error => {
      console.error('Error listening to active users:', error);
    });

  console.log('Real-time listeners active!');
}

// ===========================
// Overview Stats
// ===========================

async function loadOverviewStats() {
  try {
    // Get pending requests count
    const pendingSnapshot = await pendingRequestsCollection
      .where('adminDecision', '==', 'Pending')
      .get();
    const pendingCount = pendingSnapshot.size;

    // Get active users count
    const activeSnapshot = await loginsCollection
      .where('isActive', '==', true)
      .get();
    const activeCount = activeSnapshot.size;

    // Get current and upcoming classes
    const currentDay = getCurrentDay();
    const currentTime = getCurrentTimeString();

    const classesSnapshot = await classesCollection.get();
    let currentClass = null;
    let upcomingClass = null;
    let minTimeDiff = Infinity;

    classesSnapshot.forEach(doc => {
      const cls = { id: doc.id, ...doc.data() };

      // Check if class is happening now
      if (isDayMatch(cls.days, currentDay) && isTimeBetween(cls.startTime, cls.endTime)) {
        currentClass = cls;
      }

      // Check for upcoming classes today
      if (isDayMatch(cls.days, currentDay) && currentTime < cls.startTime) {
        const timeDiff = timeStringToMinutes(cls.startTime) - timeStringToMinutes(currentTime);
        if (timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff;
          upcomingClass = cls;
        }
      }
    });

    // Update UI
    updateOverviewStats(pendingCount, activeCount, currentClass, upcomingClass);
  } catch (error) {
    console.error('Error loading overview stats:', error);
    showNotification('Error', 'Failed to load overview statistics');
  }
}

function updateOverviewStats(pendingCount, activeCount, currentClass, upcomingClass) {
  // Update badge counts
  const pendingBadge = document.getElementById('pendingCount');
  if (pendingBadge) pendingBadge.textContent = pendingCount;

  const activeBadge = document.getElementById('activeCount');
  if (activeBadge) activeBadge.textContent = activeCount;

  // Update stat cards
  const statPending = document.getElementById('statPending');
  if (statPending) statPending.textContent = pendingCount;

  const statActive = document.getElementById('statActive');
  if (statActive) statActive.textContent = activeCount;

  // Update current class stat
  const statCurrentClass = document.getElementById('statCurrentClass');
  if (statCurrentClass) {
    if (currentClass) {
      statCurrentClass.textContent = currentClass.courseSubject;
    } else {
      statCurrentClass.textContent = 'No Class';
    }
  }

  // Update upcoming class stat
  const statUpcoming = document.getElementById('statUpcoming');
  if (statUpcoming) {
    if (upcomingClass) {
      statUpcoming.textContent = upcomingClass.courseSubject;
    } else {
      statUpcoming.textContent = 'None';
    }
  }

  // Show upcoming alert if there's a class soon
  const upcomingAlert = document.getElementById('upcomingAlert');
  const upcomingMessage = document.getElementById('upcomingMessage');
  if (upcomingClass && upcomingAlert && upcomingMessage) {
    upcomingAlert.style.display = 'block';
    upcomingMessage.innerHTML = `
      <strong>${upcomingClass.courseSubject}</strong> with ${upcomingClass.instructor}<br>
      Room ${upcomingClass.roomNumber} - Starts at ${upcomingClass.startTime}
    `;
  } else if (upcomingAlert) {
    upcomingAlert.style.display = 'none';
  }
}

// ===========================
// Display Functions
// ===========================

function displayPendingRequests(requests) {
  const container = document.getElementById('pendingRequestsList');

  if (!container) {
    console.warn('Pending requests container not found');
    return;
  }

  if (requests.length === 0) {
    container.innerHTML = `
      <div class="no-data">
        <div style="font-size: 4em; margin-bottom: 15px; opacity: 0.3; animation: float 3s ease-in-out infinite;">⏳</div>
        <p style="margin: 0; font-weight: 600; color: #4a5568; font-size: 1.2em;">No pending requests</p>
        <p style="margin: 10px 0 0 0; font-size: 0.95em; color: #a0aec0;">All student requests have been processed</p>
      </div>
    `;
    return;
  }

  let html = '<table class="data-table"><thead><tr>';
  html += '<th>Student Name</th><th>ID</th><th>Year/Section</th><th>Room</th><th>Purpose</th><th>Requested</th><th>Actions</th>';
  html += '</tr></thead><tbody>';

  requests.forEach(req => {
    const requestTime = req.requestTime ? formatDateTime(req.requestTime) : 'Unknown';

    html += `
      <tr>
        <td>${req.studentName || 'Unknown'}</td>
        <td>${req.studentId || 'N/A'}</td>
        <td>${req.yearSection || 'N/A'}</td>
        <td>${req.roomNumber || 'N/A'}</td>
        <td>${req.purpose || 'Not specified'}</td>
        <td>${requestTime}</td>
        <td>
          <button class="btn btn-success btn-sm" onclick="approveRequest('${req.id}')">Approve</button>
          <button class="btn btn-danger btn-sm" onclick="rejectRequest('${req.id}')">Reject</button>
        </td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

function displayActiveUsers(users) {
  const container = document.getElementById('activeUsersList');

  if (!container) {
    console.warn('Active users container not found');
    return;
  }

  if (users.length === 0) {
    container.innerHTML = `
      <div class="no-data">
        <div style="font-size: 4em; margin-bottom: 15px; opacity: 0.3; animation: float 3s ease-in-out infinite;">👥</div>
        <p style="margin: 0; font-weight: 600; color: #4a5568; font-size: 1.2em;">No active users</p>
        <p style="margin: 10px 0 0 0; font-size: 0.95em; color: #a0aec0;">No students are currently logged in</p>
      </div>
    `;
    return;
  }

  let html = '<table class="data-table"><thead><tr>';
  html += '<th>Student Name</th><th>ID</th><th>Year/Section</th><th>Room</th><th>Status</th><th>Time In</th><th>Duration</th><th>Action</th>';
  html += '</tr></thead><tbody>';

  users.forEach(user => {
    const timeIn = user.timeIn ? formatDateTime(user.timeIn) : 'Unknown';
    const duration = user.timeIn ? calculateDuration(user.timeIn, null) : 'N/A';

    html += `
      <tr>
        <td>${user.studentName || 'Unknown'}</td>
        <td>${user.studentId || 'N/A'}</td>
        <td>${user.yearSection || 'N/A'}</td>
        <td>${user.roomNumber || 'N/A'}</td>
        <td>${user.status || 'N/A'}</td>
        <td>${timeIn}</td>
        <td class="duration-cell" data-login-id="${user.id}">${duration}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="forceLogout('${user.id}')">Force Logout</button>
        </td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

function updateActiveUserDurations() {
  activeUsersData.forEach(user => {
    if (user.timeIn) {
      const cell = document.querySelector(`.duration-cell[data-login-id="${user.id}"]`);
      if (cell) {
        cell.textContent = calculateDuration(user.timeIn, null);
      }
    }
  });
}

// ===========================
// Approve/Reject Requests
// ===========================

async function approveRequest(requestId) {
  try {
    // Get the request data
    const requestDoc = await pendingRequestsCollection.doc(requestId).get();

    if (!requestDoc.exists) {
      showNotification('Error', 'Request not found');
      return;
    }

    // Update request status only - student page will create login entry
    await pendingRequestsCollection.doc(requestId).update({
      adminDecision: 'Accepted',
      decidedAt: getCurrentTimestamp()
    });

    showNotification('Success', 'Request approved successfully');
  } catch (error) {
    console.error('Error approving request:', error);
    showNotification('Error', 'Failed to approve request');
  }
}

async function rejectRequest(requestId) {
  try {
    // Update request status
    await pendingRequestsCollection.doc(requestId).update({
      adminDecision: 'Rejected',
      decidedAt: getCurrentTimestamp()
    });

    showNotification('Success', 'Request rejected');
  } catch (error) {
    console.error('Error rejecting request:', error);
    showNotification('Error', 'Failed to reject request');
  }
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
// Force Logout
// ===========================

async function forceLogout(loginId) {
  const confirmed = await showConfirmModal(
    'Force Logout',
    'Are you sure you want to force logout this user?',
    '🚪'
  );

  if (!confirmed) return;

  try {
    await loginsCollection.doc(loginId).update({
      timeOut: getCurrentTimestamp(),
      isActive: false,
      status: 'Admin Force Logout'
    });

    showNotification('Success', 'User logged out successfully');
  } catch (error) {
    console.error('Error forcing logout:', error);
    showNotification('Error', 'Failed to force logout');
  }
}

// ===========================
// Class Management
// ===========================

async function addClass(event) {
  event.preventDefault();

  const edpCode = document.getElementById('edpCode').value.trim();
  const courseSubject = document.getElementById('courseSubject').value.trim();
  const instructor = document.getElementById('instructor').value.trim();
  const roomNumber = document.getElementById('roomNumber').value.trim();
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;

  // Get selected days
  const daysCheckboxes = document.querySelectorAll('input[name="days"]:checked');
  const days = Array.from(daysCheckboxes).map(cb => cb.value).join(', ');

  if (!edpCode || !courseSubject || !instructor || !roomNumber || !startTime || !endTime || !days) {
    showNotification('Error', 'Please fill in all fields');
    return;
  }

  try {
    // Convert time to HH:MM:SS format
    const startTimeFull = startTime + ':00';
    const endTimeFull = endTime + ':00';

    await classesCollection.add({
      edpCode: edpCode,
      courseSubject: courseSubject,
      instructor: instructor,
      roomNumber: roomNumber,
      startTime: startTimeFull,
      endTime: endTimeFull,
      days: days,
      createdAt: getCurrentTimestamp()
    });

    showNotification('Success', 'Class added successfully');

    // Reset form
    event.target.reset();

    // Hide form
    hideAddClassForm();

    // Reload classes list
    loadClassesList();
  } catch (error) {
    console.error('Error adding class:', error);
    showNotification('Error', 'Failed to add class');
  }
}

async function loadClassesList() {
  try {
    console.log('Loading classes list...');
    const snapshot = await classesCollection.get();
    console.log('Classes snapshot size:', snapshot.size);

    const container = document.getElementById('classesList');

    if (!container) {
      console.warn('Classes list container not found');
      return;
    }

    if (snapshot.empty) {
      console.log('No classes found in Firestore');
      container.innerHTML = '<p class="no-data">No classes found. Click "Add Class" to create one.</p>';
      return;
    }

    let html = '<table class="data-table"><thead><tr>';
    html += '<th>EDP Code</th><th>Course/Subject</th><th>Instructor</th><th>Room</th><th>Days</th><th>Time</th><th>Action</th>';
    html += '</tr></thead><tbody>';

    snapshot.forEach(doc => {
      const cls = { id: doc.id, ...doc.data() };

      html += `
        <tr>
          <td>${cls.edpCode}</td>
          <td>${cls.courseSubject}</td>
          <td>${cls.instructor}</td>
          <td>${cls.roomNumber}</td>
          <td>${cls.days}</td>
          <td>${cls.startTime} - ${cls.endTime}</td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="deleteClass('${cls.id}')">Delete</button>
          </td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  } catch (error) {
    console.error('Error loading classes:', error);
  }
}

async function deleteClass(classId) {
  const confirmed = await showConfirmModal(
    'Delete Class',
    'Are you sure you want to delete this class? This action cannot be undone.',
    '🗑️'
  );

  if (!confirmed) return;

  try {
    await classesCollection.doc(classId).delete();
    showNotification('Success', 'Class deleted successfully');
    loadClassesList();
  } catch (error) {
    console.error('Error deleting class:', error);
    showNotification('Error', 'Failed to delete class');
  }
}

// ===========================
// Student Management
// ===========================

async function loadStudentsForEnrollment() {
  try {
    const snapshot = await classesCollection.get();
    const container = document.getElementById('classEnrollmentList');

    if (!container) return;

    if (snapshot.empty) {
      container.innerHTML = '<p class="no-data">No classes available. Please add classes first.</p>';
      return;
    }

    let html = '<div class="checkbox-group">';

    snapshot.forEach(doc => {
      const cls = { id: doc.id, ...doc.data() };

      html += `
        <label>
          <input type="checkbox" name="enrollmentClasses" value="${cls.id}">
          ${cls.courseSubject} - ${cls.instructor} (Room ${cls.roomNumber}, ${cls.days} ${cls.startTime})
        </label>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  } catch (error) {
    console.error('Error loading classes for enrollment:', error);
  }
}

async function registerStudent(event) {
  event.preventDefault();

  const studentId = document.getElementById('regStudentId').value.trim();
  const studentName = document.getElementById('regStudentName').value.trim();
  const yearSection = document.getElementById('regYearSection').value.trim();

  // Get selected classes
  const selectedClasses = Array.from(
    document.querySelectorAll('input[name="enrollmentClasses"]:checked')
  ).map(cb => cb.value);

  if (!studentId || !studentName || !yearSection) {
    showNotification('Error', 'Please fill in all student details');
    return;
  }

  if (selectedClasses.length === 0) {
    showNotification('Error', 'Please select at least one class');
    return;
  }

  try {
    // Check if student already exists
    const existingStudent = await studentsCollection.doc(studentId).get();

    if (existingStudent.exists) {
      showNotification('Error', 'Student ID already exists');
      return;
    }

    // Add student
    await studentsCollection.doc(studentId).set({
      studentId: studentId,
      studentName: studentName,
      yearSection: yearSection,
      createdAt: getCurrentTimestamp()
    });

    // Add enrollments
    for (const classId of selectedClasses) {
      await enrollmentsCollection.add({
        studentId: studentId,
        classId: classId,
        enrolledAt: getCurrentTimestamp()
      });
    }

    showNotification('Success', `Student ${studentName} registered with ${selectedClasses.length} class(es)`);

    // Reset form
    event.target.reset();

    // Reload enrollment list to uncheck all
    loadStudentsForEnrollment();

  } catch (error) {
    console.error('Error registering student:', error);
    showNotification('Error', 'Failed to register student');
  }
}

// ===========================
// Login Logs
// ===========================

async function loadLoginLogs() {
  try {
    const snapshot = await loginsCollection
      .orderBy('timeIn', 'desc')
      .limit(100)
      .get();

    const container = document.getElementById('logsList');

    if (!container) return;

    if (snapshot.empty) {
      container.innerHTML = '<p class="no-data">No login logs found</p>';
      return;
    }

    let html = '<table class="data-table">';
    html += `
      <thead>
        <tr>
          <th>Student ID</th>
          <th>Name</th>
          <th>Year/Section</th>
          <th>Room</th>
          <th>Status</th>
          <th>Time In</th>
          <th>Time Out</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
    `;

    snapshot.forEach(doc => {
      const log = doc.data();
      const timeIn = log.timeIn ? formatDateTime(log.timeIn) : 'N/A';
      const timeOut = log.timeOut ? formatTime(log.timeOut) : '-';
      const duration = calculateDuration(log.timeIn, log.timeOut);

      html += `
        <tr>
          <td>${log.studentId || 'N/A'}</td>
          <td>${log.studentName || 'N/A'}</td>
          <td>${log.yearSection || 'N/A'}</td>
          <td>${log.roomNumber || 'N/A'}</td>
          <td>${log.status || 'N/A'}</td>
          <td>${timeIn}</td>
          <td>${timeOut}</td>
          <td>${duration}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  } catch (error) {
    console.error('Error loading login logs:', error);
  }
}

// Add loadLogs function for filter button compatibility
function loadLogs() {
  loadLoginLogs();
}

// ===========================
// Helper Functions
// ===========================

function timeStringToMinutes(timeString) {
  const parts = timeString.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function showNotification(title, message) {
  const toast = document.getElementById('toast');
  if (toast) {
    const isSuccess = title.toLowerCase() === 'success';
    toast.className = `toast ${isSuccess ? 'toast-success' : 'toast-error'} show`;
    toast.innerHTML = `
      <div class="toast-icon">${isSuccess ? '✓' : '✕'}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

// ===========================
// Navigation
// ===========================

function showPanel(panelName) {
  // Hide all panels
  const panels = document.querySelectorAll('.panel');
  panels.forEach(panel => panel.classList.remove('active'));

  // Show selected panel
  const selectedPanel = document.getElementById(panelName + 'Panel');
  if (selectedPanel) {
    selectedPanel.classList.add('active');
  }

  // Update nav active state
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => item.classList.remove('active'));

  const activeItem = document.querySelector(`[onclick="showPanel('${panelName}')"]`);
  if (activeItem) {
    activeItem.classList.add('active');
  }

  // Update page title
  const titles = {
    'overview': 'Dashboard Overview',
    'pending': 'Pending Requests',
    'active': 'Active Users',
    'logs': 'Login Logs',
    'register': 'Register Student',
    'classes': 'Manage Classes'
  };

  const titleEl = document.getElementById('panelTitle');
  if (titleEl) {
    titleEl.textContent = titles[panelName] || 'Admin Dashboard';
  }

  // Load data for specific panels
  if (panelName === 'logs') {
    loadLoginLogs();
  } else if (panelName === 'classes') {
    loadClassesList();
  } else if (panelName === 'register') {
    loadStudentsForEnrollment();
  }
}

function showAddClassForm() {
  const form = document.getElementById('addClassForm');
  if (form) {
    form.style.display = 'block';
  }
}

function hideAddClassForm() {
  const form = document.getElementById('addClassForm');
  if (form) {
    form.style.display = 'none';
  }
  const classForm = document.getElementById('newClassForm');
  if (classForm) {
    classForm.reset();
  }
}

// ===========================
// Initialization
// ===========================

document.addEventListener('DOMContentLoaded', () => {
  console.log('Admin dashboard initializing...');

  // Setup real-time listeners
  setupRealtimeListeners();

  // Load overview stats
  loadOverviewStats();

  // Refresh overview stats every 30 seconds
  setInterval(loadOverviewStats, 30000);

  // Setup clock
  updateClock();
  setInterval(updateClock, 1000);

  // Setup form handlers
  const newClassForm = document.getElementById('newClassForm');
  if (newClassForm) {
    newClassForm.addEventListener('submit', addClass);
  }

  const registerStudentForm = document.getElementById('registerStudentForm');
  if (registerStudentForm) {
    registerStudentForm.addEventListener('submit', registerStudent);
  }

  console.log('Admin dashboard ready!');
});

// Clock update function
function updateClock() {
  const clockEl = document.getElementById('clock');
  if (clockEl) {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    clockEl.textContent = timeString;
  }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (pendingRequestsListener) {
    pendingRequestsListener();
  }
  if (activeUsersListener) {
    activeUsersListener();
  }
  if (durationUpdateInterval) {
    clearInterval(durationUpdateInterval);
  }
});

console.log('✅ Admin Firebase loaded successfully');
