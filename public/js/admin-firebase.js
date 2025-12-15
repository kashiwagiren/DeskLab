// Admin Dashboard - Pure Firebase (No PHP!)
// This file uses ONLY Firebase Firestore queries

console.log('Loading admin-firebase.js...');

// ===========================
// Real-time Listeners
// ===========================

let pendingRequestsListener = null;
let activeUsersListener = null;

function setupRealtimeListeners() {
  console.log('Setting up real-time listeners...');

  // Listen for pending requests
  pendingRequestsListener = pendingRequestsCollection
    .where('adminDecision', '==', 'Pending')
    .orderBy('requestTime', 'desc')
    .onSnapshot(snapshot => {
      const requests = [];
      snapshot.forEach(doc => {
        requests.push({ id: doc.id, ...doc.data() });
      });
      displayPendingRequests(requests);
    }, error => {
      console.error('Error listening to pending requests:', error);
    });

  // Listen for active users
  activeUsersListener = loginsCollection
    .where('isActive', '==', true)
    .orderBy('timeIn', 'desc')
    .onSnapshot(snapshot => {
      const users = [];
      snapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });
      displayActiveUsers(users);
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
  // Update counts
  document.getElementById('pendingCount').textContent = pendingCount;
  document.getElementById('activeCount').textContent = activeCount;

  // Update current class
  const currentClassDiv = document.getElementById('currentClass');
  if (currentClass) {
    currentClassDiv.innerHTML = `
      <strong>${currentClass.courseSubject}</strong><br>
      ${currentClass.instructor}<br>
      Room ${currentClass.roomNumber}<br>
      ${currentClass.startTime} - ${currentClass.endTime}
    `;
  } else {
    currentClassDiv.innerHTML = '<em>No class in session</em>';
  }

  // Update upcoming class
  const upcomingClassDiv = document.getElementById('upcomingClass');
  if (upcomingClass) {
    upcomingClassDiv.innerHTML = `
      <strong>${upcomingClass.courseSubject}</strong><br>
      ${upcomingClass.instructor}<br>
      Room ${upcomingClass.roomNumber}<br>
      Starts at ${upcomingClass.startTime}
    `;
  } else {
    upcomingClassDiv.innerHTML = '<em>No upcoming classes today</em>';
  }
}

// ===========================
// Display Functions
// ===========================

function displayPendingRequests(requests) {
  const container = document.getElementById('pendingRequestsContainer');

  if (!container) {
    console.warn('Pending requests container not found');
    return;
  }

  if (requests.length === 0) {
    container.innerHTML = '<p class="no-data">No pending requests</p>';
    return;
  }

  let html = '<div class="requests-list">';

  requests.forEach(req => {
    const requestTime = req.requestTime ? formatDateTime(req.requestTime) : 'Unknown';

    html += `
      <div class="request-card">
        <div class="request-header">
          <strong>${req.studentName || 'Unknown'}</strong>
          <span class="badge badge-warning">Pending</span>
        </div>
        <div class="request-details">
          <p><strong>ID:</strong> ${req.studentId || 'N/A'}</p>
          <p><strong>Year/Section:</strong> ${req.yearSection || 'N/A'}</p>
          <p><strong>Room:</strong> ${req.roomNumber || 'N/A'}</p>
          <p><strong>Purpose:</strong> ${req.purpose || 'Not specified'}</p>
          <p><strong>Requested:</strong> ${requestTime}</p>
        </div>
        <div class="request-actions">
          <button class="btn btn-success btn-sm" onclick="approveRequest('${req.id}')">
            Approve
          </button>
          <button class="btn btn-danger btn-sm" onclick="rejectRequest('${req.id}')">
            Reject
          </button>
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

function displayActiveUsers(users) {
  const container = document.getElementById('activeUsersContainer');

  if (!container) {
    console.warn('Active users container not found');
    return;
  }

  if (users.length === 0) {
    container.innerHTML = '<p class="no-data">No active users</p>';
    return;
  }

  let html = '<div class="users-list">';

  users.forEach(user => {
    const timeIn = user.timeIn ? formatDateTime(user.timeIn) : 'Unknown';
    const duration = user.timeIn ? calculateDuration(user.timeIn, null) : 'N/A';

    html += `
      <div class="user-card">
        <div class="user-header">
          <strong>${user.studentName || 'Unknown'}</strong>
          <span class="badge badge-success">Active</span>
        </div>
        <div class="user-details">
          <p><strong>ID:</strong> ${user.studentId || 'N/A'}</p>
          <p><strong>Year/Section:</strong> ${user.yearSection || 'N/A'}</p>
          <p><strong>Room:</strong> ${user.roomNumber || 'N/A'}</p>
          <p><strong>Status:</strong> ${user.status || 'N/A'}</p>
          <p><strong>Time In:</strong> ${timeIn}</p>
          <p><strong>Duration:</strong> ${duration}</p>
        </div>
        <div class="user-actions">
          <button class="btn btn-warning btn-sm" onclick="forceLogout('${user.id}')">
            Force Logout
          </button>
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
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

    const requestData = requestDoc.data();

    // Create login entry
    await loginsCollection.add({
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

    // Update request status
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
// Force Logout
// ===========================

async function forceLogout(loginId) {
  if (!confirm('Are you sure you want to force logout this user?')) {
    return;
  }

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

    const roomSelect = document.getElementById('classRoomNumber');
    if (roomSelect) {
      roomSelect.innerHTML = '<option value="">-- Select Room --</option>';
      Array.from(rooms).sort().forEach(room => {
        roomSelect.innerHTML += `<option value="${room}">${room}</option>`;
      });
    }
  } catch (error) {
    console.error('Error loading rooms list:', error);
  }
}

async function addClass(event) {
  event.preventDefault();

  const edpCode = document.getElementById('edpCode').value.trim();
  const courseSubject = document.getElementById('courseSubject').value.trim();
  const instructor = document.getElementById('instructor').value.trim();
  const roomNumber = document.getElementById('classRoomNumber').value;
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
    await classesCollection.add({
      edpCode: edpCode,
      courseSubject: courseSubject,
      instructor: instructor,
      roomNumber: roomNumber,
      startTime: startTime,
      endTime: endTime,
      days: days,
      createdAt: getCurrentTimestamp()
    });

    showNotification('Success', 'Class added successfully');

    // Reset form
    event.target.reset();

    // Reload classes list
    loadClassesList();
  } catch (error) {
    console.error('Error adding class:', error);
    showNotification('Error', 'Failed to add class');
  }
}

async function loadClassesList() {
  try {
    const snapshot = await classesCollection.orderBy('createdAt', 'desc').get();
    const container = document.getElementById('classesListContainer');

    if (!container) return;

    if (snapshot.empty) {
      container.innerHTML = '<p class="no-data">No classes found</p>';
      return;
    }

    let html = '<div class="classes-list">';

    snapshot.forEach(doc => {
      const cls = { id: doc.id, ...doc.data() };

      html += `
        <div class="class-card">
          <div class="class-header">
            <strong>${cls.courseSubject}</strong>
            <span class="badge badge-info">${cls.edpCode}</span>
          </div>
          <div class="class-details">
            <p><strong>Instructor:</strong> ${cls.instructor}</p>
            <p><strong>Room:</strong> ${cls.roomNumber}</p>
            <p><strong>Schedule:</strong> ${cls.days}</p>
            <p><strong>Time:</strong> ${cls.startTime} - ${cls.endTime}</p>
          </div>
          <div class="class-actions">
            <button class="btn btn-danger btn-sm" onclick="deleteClass('${cls.id}')">
              Delete
            </button>
          </div>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  } catch (error) {
    console.error('Error loading classes:', error);
  }
}

async function deleteClass(classId) {
  if (!confirm('Are you sure you want to delete this class?')) {
    return;
  }

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
    const container = document.getElementById('enrollmentClassesContainer');

    if (!container) return;

    if (snapshot.empty) {
      container.innerHTML = '<p class="no-data">No classes available</p>';
      return;
    }

    let html = '';

    snapshot.forEach(doc => {
      const cls = { id: doc.id, ...doc.data() };

      html += `
        <div class="enrollment-class">
          <label>
            <input type="checkbox" name="enrollmentClasses" value="${cls.id}">
            <strong>${cls.courseSubject}</strong> - ${cls.instructor} (Room ${cls.roomNumber})
          </label>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (error) {
    console.error('Error loading classes for enrollment:', error);
  }
}

async function registerStudent(event) {
  event.preventDefault();

  const studentId = document.getElementById('studentId').value.trim();
  const studentName = document.getElementById('studentName').value.trim();
  const yearSection = document.getElementById('studentYearSection').value.trim();

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

    showNotification('Success', 'Student registered successfully');

    // Reset form
    event.target.reset();

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

    const container = document.getElementById('logsContainer');

    if (!container) return;

    if (snapshot.empty) {
      container.innerHTML = '<p class="no-data">No login logs found</p>';
      return;
    }

    let html = '<table class="logs-table">';
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

// ===========================
// Helper Functions
// ===========================

function timeStringToMinutes(timeString) {
  const parts = timeString.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function showNotification(title, message) {
  alert(`${title}: ${message}`);
}

// ===========================
// Navigation
// ===========================

function showSection(sectionId) {
  // Hide all sections
  const sections = document.querySelectorAll('.admin-section');
  sections.forEach(section => section.classList.add('hidden'));

  // Show selected section
  const selectedSection = document.getElementById(sectionId);
  if (selectedSection) {
    selectedSection.classList.remove('hidden');
  }

  // Update nav active state
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => btn.classList.remove('active'));

  const activeBtn = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }

  // Load data for specific sections
  if (sectionId === 'logsSection') {
    loadLoginLogs();
  } else if (sectionId === 'classesSection') {
    loadClassesList();
    loadRoomsList();
  } else if (sectionId === 'studentsSection') {
    loadStudentsForEnrollment();
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

  // Setup form handlers
  const addClassForm = document.getElementById('addClassForm');
  if (addClassForm) {
    addClassForm.addEventListener('submit', addClass);
  }

  const registerStudentForm = document.getElementById('registerStudentForm');
  if (registerStudentForm) {
    registerStudentForm.addEventListener('submit', registerStudent);
  }

  console.log('Admin dashboard ready!');
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (pendingRequestsListener) {
    pendingRequestsListener();
  }
  if (activeUsersListener) {
    activeUsersListener();
  }
});

console.log('✅ Admin Firebase loaded successfully');
