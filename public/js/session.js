// Global Variables
let loginId = null;
let startTime = null;
let timerInterval = null;
let checkInterval = null;
let roomNumber = null;

// Initialize Session
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    loginId = urlParams.get('login_id');

    if (!loginId) {
        alert('Invalid session. Redirecting to login...');
        window.location.href = 'index.html';
        return;
    }

    loadSessionInfo();
    startSessionTimer();
    startClassMonitoring();
});

// Load Session Information
async function loadSessionInfo() {
    try {
        const response = await fetch(`api/session.php?login_id=${loginId}`);
        const data = await response.json();

        if (data.success) {
            document.getElementById('studentName').textContent = data.session.student_name;
            document.getElementById('studentId').textContent = data.session.student_id;
            document.getElementById('yearSection').textContent = data.session.year_section;
            document.getElementById('roomNumber').textContent = data.session.room_number;
            document.getElementById('timeIn').textContent = data.session.time_in;

            const statusBadge = document.getElementById('status');
            statusBadge.textContent = data.session.status;
            statusBadge.className = 'value status-badge ' + getStatusClass(data.session.status);

            roomNumber = data.session.room_number;
            startTime = new Date(data.session.time_in_full);
        } else {
            alert('Failed to load session information.');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error loading session:', error);
        alert('Error loading session. Redirecting to login...');
        window.location.href = 'index.html';
    }
}

// Session Timer
function startSessionTimer() {
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    if (!startTime) return;

    const now = new Date();
    const elapsed = Math.floor((now - startTime) / 1000);

    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;

    const timeString = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    document.getElementById('sessionTime').textContent = timeString;
}

function pad(num) {
    return num.toString().padStart(2, '0');
}

// Class Monitoring
function startClassMonitoring() {
    checkInterval = setInterval(() => {
        checkUpcomingClass();
        checkSessionActive(); // Also check if session is still active
    }, 5000); // Check every 5 seconds for faster response
    checkUpcomingClass(); // Initial check
    checkSessionActive(); // Initial session check
}

// Check if session is still active (not force-logged out by admin)
async function checkSessionActive() {
    if (!loginId) return;

    try {
        const response = await fetch(`api/session.php?login_id=${loginId}`);
        const data = await response.json();

        if (data.success) {
            // Check if session is no longer active
            if (!data.session.is_active || data.session.time_out) {
                clearInterval(timerInterval);
                clearInterval(checkInterval);
                alert('⚠️ Your session has been terminated by an administrator.\n\nYou have been logged out.');
                window.location.href = 'index.html';
            }
        } else {
            // Session not found - force redirect
            clearInterval(timerInterval);
            clearInterval(checkInterval);
            alert('Session expired. Please log in again.');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error checking session:', error);
    }
}

async function checkUpcomingClass() {
    if (!roomNumber) return;

    try {
        const response = await fetch(`api/check_upcoming_class.php?room=${encodeURIComponent(roomNumber)}`);
        const data = await response.json();

        if (data.success) {
            if (data.force_logout) {
                // Class has started - force logout
                clearInterval(timerInterval);
                clearInterval(checkInterval);
                alert('⏰ ' + data.message + '\n\nA scheduled class is starting now. You have been automatically logged out.');
                window.location.href = 'index.html';
            } else if (data.warning) {
                // Upcoming class warning
                showClassWarning(data.message, data.minutes_remaining);
            }
        }
    } catch (error) {
        console.error('Error checking upcoming class:', error);
    }
}

function showClassWarning(message, minutesRemaining) {
    document.getElementById('popupWarningText').textContent = message;
    document.getElementById('countdownMinutes').textContent = minutesRemaining;
    document.getElementById('classWarningPopup').classList.remove('hidden');

    // Also show in warning box
    document.getElementById('warningText').textContent = message;
    document.getElementById('warningBox').style.display = 'block';
}

function closeWarningPopup() {
    document.getElementById('classWarningPopup').classList.add('hidden');
}

// Logout Functions
function confirmLogout() {
    document.getElementById('logoutConfirmPopup').classList.remove('hidden');
}

function closeLogoutConfirm() {
    document.getElementById('logoutConfirmPopup').classList.add('hidden');
}

async function performLogout() {
    try {
        const response = await fetch('api/logout.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ login_id: loginId })
        });

        const data = await response.json();

        if (data.success) {
            clearInterval(timerInterval);
            clearInterval(checkInterval);

            alert('You have been logged out successfully.');
            window.location.href = 'index.html';
        } else {
            alert('Failed to logout. Please try again.');
        }
    } catch (error) {
        console.error('Error logging out:', error);
        alert('Error logging out. Please try again.');
    }
}

// Get Status Class
function getStatusClass(status) {
    const classes = {
        'Enrolled (Allowed)': 'status-enrolled',
        'Admin Approved': 'status-approved',
        'No class - Auto Allowed': 'status-auto'
    };
    return classes[status] || '';
}

// Prevent accidental page close
window.addEventListener('beforeunload', function(e) {
    e.preventDefault();
    e.returnValue = 'Are you sure you want to leave? Your session will remain active.';
});
