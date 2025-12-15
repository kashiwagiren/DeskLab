// Global Variables
let currentRoom = '';
let checkInterval = null;
let pendingRequestId = null;

// Navigation Functions
function showMainMenu() {
    document.getElementById('mainMenu').classList.remove('hidden');
    document.getElementById('scheduleSection').classList.add('hidden');
    document.getElementById('loginSection').classList.add('hidden');
}

function showSchedule() {
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('scheduleSection').classList.remove('hidden');
    document.getElementById('loginSection').classList.add('hidden');

    // Load available rooms
    loadAvailableRooms();

    // Auto-load schedule if room is already set
    if (document.getElementById('roomNumber') && document.getElementById('roomNumber').value) {
        document.getElementById('roomSelect').value = document.getElementById('roomNumber').value;
        loadSchedule();
    }
}

function showLogin() {
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('scheduleSection').classList.add('hidden');
    document.getElementById('loginSection').classList.remove('hidden');

    // Load available rooms for dropdown
    loadRoomsForLogin();
}

function showUploadForm() {
    document.getElementById('uploadForm').classList.remove('hidden');
    document.getElementById('manualForm').classList.add('hidden');
}

function showManualForm() {
    document.getElementById('uploadForm').classList.add('hidden');
    document.getElementById('manualForm').classList.remove('hidden');
}

// Load rooms for login dropdown
async function loadRoomsForLogin() {
    try {
        const response = await fetch('api/get_rooms.php');
        const data = await response.json();

        if (data.success && data.rooms.length > 0) {
            const selectElement = document.getElementById('roomNumber');

            // Clear existing options except the first one
            selectElement.innerHTML = '<option value="">-- Select Room --</option>';

            // Add room options
            data.rooms.forEach(room => {
                const option = document.createElement('option');
                option.value = room;
                option.textContent = room;
                selectElement.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading rooms for login:', error);
    }
}

// Schedule Functions
async function loadAvailableRooms() {
    try {
        const response = await fetch('api/get_rooms.php');
        const data = await response.json();

        if (data.success && data.rooms.length > 0) {
            const selectElement = document.getElementById('roomSelect');

            // Clear existing options except the first one
            selectElement.innerHTML = '<option value="">-- Choose a room --</option>';

            // Add room options
            data.rooms.forEach(room => {
                const option = document.createElement('option');
                option.value = room;
                option.textContent = room;
                selectElement.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading rooms:', error);
    }
}

async function loadSchedule() {
    const room = document.getElementById('roomSelect').value.trim();

    if (!room) {
        document.getElementById('scheduleDisplay').innerHTML = '<div class="no-schedule">Please select a room to view schedule.</div>';
        return;
    }

    currentRoom = room;
    showLoading(true);

    try {
        const response = await fetch(`api/schedule.php?room=${encodeURIComponent(room)}`);
        const data = await response.json();

        if (data.success) {
            displaySchedule(data.classes, room);
        } else {
            displaySchedule([], room);
        }
    } catch (error) {
        showNotification('Error', 'Failed to load schedule. Please try again.');
        console.error('Error:', error);
    } finally {
        showLoading(false);
    }
}

function displaySchedule(classes, room) {
    const scheduleDisplay = document.getElementById('scheduleDisplay');

    if (classes.length === 0) {
        scheduleDisplay.innerHTML = '<div class="no-schedule">No classes scheduled for this room.</div>';
        return;
    }

    let tableHTML = `
        <h3>Room: ${room}</h3>
        <table>
            <thead>
                <tr>
                    <th>EDP</th>
                    <th>Course</th>
                    <th>Instructor</th>
                    <th>Time</th>
                    <th>Days</th>
                </tr>
            </thead>
            <tbody>
    `;

    classes.forEach(cls => {
        tableHTML += `
            <tr>
                <td>${cls.edp_code}</td>
                <td>${cls.course_subject}</td>
                <td>${cls.instructor}</td>
                <td>${cls.start_time} - ${cls.end_time}</td>
                <td>${cls.days}</td>
            </tr>
        `;
    });

    tableHTML += '</tbody></table>';
    scheduleDisplay.innerHTML = tableHTML;
}

// File Upload Functions
function handleFileUpload(event) {
    const file = event.target.files[0];

    if (!file) return;

    const preview = document.getElementById('uploadPreview');
    preview.innerHTML = '';

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `
                <h4>Preview:</h4>
                <img src="${e.target.result}" alt="Study Load Preview">
                <button class="btn btn-success" onclick="processStudyLoad()">Process Study Load</button>
            `;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
        preview.innerHTML = `
            <h4>PDF Selected:</h4>
            <p>${file.name}</p>
            <button class="btn btn-success" onclick="processStudyLoad()">Process Study Load</button>
        `;
        preview.classList.remove('hidden');
    }
}

async function processStudyLoad() {
    const fileInput = document.getElementById('studyLoadFile');
    const file = fileInput.files[0];

    if (!file) {
        showNotification('Error', 'Please select a file first.');
        return;
    }

    showLoading(true);

    const formData = new FormData();
    formData.append('studyload', file);

    try {
        const response = await fetch('api/process_studyload.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            // Fill manual form with extracted data
            if (data.student_id) document.getElementById('studentId').value = data.student_id;
            if (data.student_name) document.getElementById('studentName').value = data.student_name;
            if (data.year_section) document.getElementById('yearSection').value = data.year_section;

            showNotification('Success', 'Study load processed! Please verify the information and complete your login.');
            showManualForm();
        } else {
            showNotification('Error', data.error || 'Failed to process study load. Please use manual entry.');
            showManualForm();
        }
    } catch (error) {
        showNotification('Error', 'Failed to process file. Please use manual entry.');
        showManualForm();
        console.error('Error:', error);
    } finally {
        showLoading(false);
    }
}

// Login Form Functions
document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const studentName = document.getElementById('studentName').value.trim();
    const studentId = document.getElementById('studentId').value.trim();
    const yearSection = document.getElementById('yearSection').value.trim();
    const roomNumber = document.getElementById('roomNumber').value.trim();
    const purpose = document.getElementById('purpose').value.trim();

    if (studentId.length !== 8 || !/^\d{8}$/.test(studentId)) {
        showNotification('Error', 'Student ID must be exactly 8 digits.');
        return;
    }

    showLoading(true);

    try {
        const response = await fetch('api/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                student_name: studentName,
                student_id: studentId,
                year_section: yearSection,
                room_number: roomNumber,
                purpose: purpose
            })
        });

        const data = await response.json();

        if (data.success) {
            handleLoginResponse(data);
        } else {
            showNotification('Error', data.error || 'Login failed. Please try again.');
        }
    } catch (error) {
        showNotification('Error', 'Connection error. Please try again.');
        console.error('Error:', error);
    } finally {
        showLoading(false);
    }
});

function handleLoginResponse(data) {
    if (data.status === 'ask_purpose') {
        // Show purpose field
        document.getElementById('purposeSection').classList.remove('hidden');
        document.getElementById('purpose').required = true;
        showNotification('Additional Information Required', data.message);
    } else if (data.status === 'pending') {
        // Waiting for admin approval
        pendingRequestId = data.request_id;
        showPendingPopup();
        startCheckingApproval(data.request_id);
    } else if (data.status === 'allowed') {
        // Access granted
        showNotification('Access Granted', data.message);

        // Start monitoring for upcoming classes
        startClassMonitoring(data.room_number);

        // Redirect to session page or show success
        setTimeout(() => {
            window.location.href = 'session.html?login_id=' + data.login_id;
        }, 2000);
    } else if (data.status === 'denied') {
        showNotification('Access Denied', data.message);
    }
}

// Pending Approval Functions
function showPendingPopup() {
    document.getElementById('pendingPopup').classList.remove('hidden');
}

function closePendingPopup() {
    document.getElementById('pendingPopup').classList.add('hidden');
}

async function startCheckingApproval(requestId) {
    checkInterval = setInterval(async () => {
        try {
            const response = await fetch(`api/check_approval.php?request_id=${requestId}`);
            const data = await response.json();

            if (data.success) {
                if (data.decision === 'Accepted') {
                    clearInterval(checkInterval);
                    closePendingPopup();
                    showNotification('Access Granted', 'Admin has approved your request!');

                    setTimeout(() => {
                        window.location.href = 'session.html?login_id=' + data.login_id;
                    }, 2000);
                } else if (data.decision === 'Rejected') {
                    clearInterval(checkInterval);
                    closePendingPopup();
                    showNotification('Access Denied', 'Admin has rejected your request.');
                }
            }
        } catch (error) {
            console.error('Error checking approval:', error);
        }
    }, 2000); // Check every 2 seconds
}

// Class Monitoring Functions
async function startClassMonitoring(roomNumber) {
    setInterval(async () => {
        try {
            const response = await fetch(`api/check_upcoming_class.php?room=${encodeURIComponent(roomNumber)}`);
            const data = await response.json();

            if (data.warning) {
                showClassWarning(data.message, data.minutes_remaining);
            }
        } catch (error) {
            console.error('Error checking upcoming class:', error);
        }
    }, 60000); // Check every minute
}

function showClassWarning(message, minutesRemaining) {
    document.getElementById('warningMessage').textContent = message;
    document.getElementById('classWarning').classList.remove('hidden');
}

function acknowledgeWarning() {
    document.getElementById('classWarning').classList.add('hidden');
}

// Utility Functions
function showLoading(show) {
    if (show) {
        document.getElementById('loadingOverlay').classList.remove('hidden');
    } else {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }
}

function showNotification(title, message) {
    document.getElementById('popupTitle').textContent = title;
    document.getElementById('popupMessage').textContent = message;
    document.getElementById('notificationPopup').classList.remove('hidden');
}

function closePopup() {
    document.getElementById('notificationPopup').classList.add('hidden');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    showMainMenu();
});
