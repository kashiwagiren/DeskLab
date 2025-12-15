// Firebase Helper Functions

// Get current time as Firebase timestamp
function getCurrentTimestamp() {
  return firebase.firestore.Timestamp.now();
}

// Format time for display (12-hour format)
function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

// Format date for display
function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return date.toLocaleDateString('en-US');
}

// Format full date and time
function formatDateTime(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

// Get current day (MON, TUE, etc.)
function getCurrentDay() {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days[new Date().getDay()];
}

// Get current time as HH:MM:SS
function getCurrentTimeString() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// Check if current time is between start and end
function isTimeBetween(startTime, endTime) {
  const now = getCurrentTimeString();
  return now >= startTime && now <= endTime;
}

// Check if day is in days string
function isDayMatch(daysString, currentDay) {
  if (!daysString || !currentDay) return false;
  return daysString.toUpperCase().includes(currentDay.toUpperCase());
}

// Calculate duration between two timestamps
function calculateDuration(startTimestamp, endTimestamp) {
  if (!startTimestamp || !endTimestamp) return 'Active';
  
  const start = startTimestamp.toDate();
  const end = endTimestamp.toDate();
  const diffMs = end - start;
  const diffSecs = Math.floor(diffMs / 1000);
  const hours = Math.floor(diffSecs / 3600);
  const minutes = Math.floor((diffSecs % 3600) / 60);
  
  return `${hours}h ${minutes}m`;
}

// Generate unique ID
function generateId() {
  return db.collection('_').doc().id;
}

// Show toast notification
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.textContent = message;
  toast.className = 'toast show ' + type;
  
  setTimeout(() => {
    toast.className = 'toast';
  }, 3000);
}

console.log('✅ Firebase helpers loaded');
