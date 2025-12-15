// Global Variables
let refreshInterval = null;
let allClasses = [];

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    updateClock();
    setInterval(updateClock, 1000);

    refreshData();
    startAutoRefresh();

    // Load class list for enrollment
    loadClassesForEnrollment();

    // Setup form handlers
    setupFormHandlers();
});

// Clock Update
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('clock').textContent = timeString;
}

// Navigation
function showPanel(panelName) {
    // Hide all panels
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));

    // Remove active from nav items
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    // Show selected panel
    const panels = {
        'overview': 'overviewPanel',
        'pending': 'pendingPanel',
        'active': 'activePanel',
        'logs': 'logsPanel',
        'register': 'registerPanel',
        'classes': 'classesPanel'
    };

    const titles = {
        'overview': 'Dashboard Overview',
        'pending': 'Pending Requests',
        'active': 'Active Users',
        'logs': 'Login Logs',
        'register': 'Register Student',
        'classes': 'Manage Classes'
    };

    document.getElementById(panels[panelName]).classList.add('active');
    document.getElementById('panelTitle').textContent = titles[panelName];

    // Activate nav item (only if event exists)
    if (typeof event !== 'undefined' && event.target) {
        event.target.closest('.nav-item').classList.add('active');
    }

    // Load panel-specific data
    if (panelName === 'pending') loadPendingRequests();
    if (panelName === 'active') loadActiveUsers();
    if (panelName === 'logs') loadLogs();
    if (panelName === 'classes') loadClasses();
}

// Refresh All Data
async function refreshData() {
    await Promise.all([
        loadOverviewStats(),
        loadPendingRequests(),
        loadActiveUsers()
    ]);
}

function startAutoRefresh() {
    refreshInterval = setInterval(refreshData, 5000); // Refresh every 5 seconds
}

// Load Overview Stats
async function loadOverviewStats() {
    try {
        const response = await fetch('api/admin/overview.php');
        const data = await response.json();

        if (data.success) {
            document.getElementById('statPending').textContent = data.pending_count;
            document.getElementById('statActive').textContent = data.active_count;
            document.getElementById('pendingCount').textContent = data.pending_count;
            document.getElementById('activeCount').textContent = data.active_count;

            // Current Class
            if (data.current_class) {
                document.getElementById('statCurrentClass').textContent = data.current_class.course_subject;
            } else {
                document.getElementById('statCurrentClass').textContent = 'No Class';
            }

            // Upcoming Class Warning
            if (data.upcoming_class) {
                document.getElementById('statUpcoming').textContent = data.upcoming_class.course_subject;
                document.getElementById('upcomingMessage').textContent =
                    `${data.upcoming_class.course_subject} will start at ${data.upcoming_class.start_time}`;
                document.getElementById('upcomingAlert').style.display = 'block';
            } else {
                document.getElementById('statUpcoming').textContent = 'None';
                document.getElementById('upcomingAlert').style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error loading overview stats:', error);
    }
}

// Load Pending Requests
async function loadPendingRequests() {
    try {
        const response = await fetch('api/admin/pending_requests.php');
        const data = await response.json();

        const container = document.getElementById('pendingRequestsList');

        if (data.success && data.requests.length > 0) {
            let html = `
                <table>
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Student Name</th>
                            <th>ID</th>
                            <th>Year & Section</th>
                            <th>Room</th>
                            <th>Class</th>
                            <th>Purpose</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            data.requests.forEach(req => {
                html += `
                    <tr>
                        <td>${req.request_time}</td>
                        <td>${req.student_name}</td>
                        <td>${req.student_id}</td>
                        <td>${req.year_section}</td>
                        <td>${req.room_number}</td>
                        <td>${req.course_subject}</td>
                        <td>${req.purpose}</td>
                        <td>
                            <button class="btn btn-success" onclick="approveRequest(${req.request_id})">Accept</button>
                            <button class="btn btn-danger" onclick="rejectRequest(${req.request_id})">Reject</button>
                        </td>
                    </tr>
                `;
            });

            html += '</tbody></table>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<div class="empty-state">No pending requests</div>';
        }
    } catch (error) {
        console.error('Error loading pending requests:', error);
    }
}

// Approve Request
async function approveRequest(requestId) {
    try {
        const response = await fetch('api/admin/approve_request.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ request_id: requestId, decision: 'Accepted' })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Request approved successfully', 'success');
            loadPendingRequests();
            loadOverviewStats();
        } else {
            showToast('Failed to approve request', 'error');
        }
    } catch (error) {
        showToast('Error approving request', 'error');
        console.error('Error:', error);
    }
}

// Reject Request
async function rejectRequest(requestId) {
    try {
        const response = await fetch('api/admin/approve_request.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ request_id: requestId, decision: 'Rejected' })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Request rejected', 'warning');
            loadPendingRequests();
            loadOverviewStats();
        } else {
            showToast('Failed to reject request', 'error');
        }
    } catch (error) {
        showToast('Error rejecting request', 'error');
        console.error('Error:', error);
    }
}

// Load Active Users
async function loadActiveUsers() {
    try {
        const response = await fetch('api/admin/active_users.php');
        const data = await response.json();

        const container = document.getElementById('activeUsersList');

        if (data.success && data.users.length > 0) {
            let html = `
                <table>
                    <thead>
                        <tr>
                            <th>Time In</th>
                            <th>Student Name</th>
                            <th>ID</th>
                            <th>Year & Section</th>
                            <th>Room</th>
                            <th>Status</th>
                            <th>Purpose</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            data.users.forEach(user => {
                const statusClass = getStatusClass(user.status);
                html += `
                    <tr>
                        <td>${user.time_in}</td>
                        <td>${user.student_name}</td>
                        <td>${user.student_id}</td>
                        <td>${user.year_section}</td>
                        <td>${user.room_number}</td>
                        <td><span class="status-badge ${statusClass}">${user.status}</span></td>
                        <td>${user.purpose || '-'}</td>
                        <td>
                            <button class="btn btn-danger" onclick="forceLogout(${user.login_id})">Force Logout</button>
                        </td>
                    </tr>
                `;
            });

            html += '</tbody></table>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<div class="empty-state">No active users</div>';
        }
    } catch (error) {
        console.error('Error loading active users:', error);
    }
}

// Force Logout
async function forceLogout(loginId) {
    if (!confirm('Are you sure you want to force logout this user?')) return;

    try {
        const response = await fetch('api/admin/force_logout.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login_id: loginId })
        });

        const data = await response.json();

        if (data.success) {
            showToast('User logged out successfully', 'success');
            loadActiveUsers();
            loadOverviewStats();
        } else {
            showToast('Failed to logout user', 'error');
        }
    } catch (error) {
        showToast('Error logging out user', 'error');
        console.error('Error:', error);
    }
}

// Load Logs
async function loadLogs() {
    const dateFilter = document.getElementById('logDateFilter').value;
    const statusFilter = document.getElementById('logStatusFilter').value;

    try {
        const params = new URLSearchParams();
        if (dateFilter) params.append('date', dateFilter);
        if (statusFilter) params.append('status', statusFilter);

        const response = await fetch(`api/admin/logs.php?${params.toString()}`);
        const data = await response.json();

        const container = document.getElementById('logsList');

        if (data.success && data.logs.length > 0) {
            let html = `
                <table>
                    <thead>
                        <tr>
                            <th>Time In</th>
                            <th>Time Out</th>
                            <th>Duration</th>
                            <th>Student Name</th>
                            <th>ID</th>
                            <th>Room</th>
                            <th>Status</th>
                            <th>Purpose</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            data.logs.forEach(log => {
                const statusClass = getStatusClass(log.status);
                html += `
                    <tr>
                        <td>${log.time_in}</td>
                        <td>${log.time_out || 'Active'}</td>
                        <td><strong>${log.duration}</strong></td>
                        <td>${log.student_name}</td>
                        <td>${log.student_id}</td>
                        <td>${log.room_number}</td>
                        <td><span class="status-badge ${statusClass}">${log.status}</span></td>
                        <td>${log.purpose || '-'}</td>
                    </tr>
                `;
            });

            html += '</tbody></table>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<div class="empty-state">No logs found</div>';
        }
    } catch (error) {
        console.error('Error loading logs:', error);
    }
}

// Get Status Class
function getStatusClass(status) {
    const classes = {
        'Pending': 'status-pending',
        'Enrolled (Allowed)': 'status-enrolled',
        'Admin Approved': 'status-approved',
        'No class - Auto Allowed': 'status-auto',
        'Denied': 'status-denied'
    };
    return classes[status] || '';
}

// Setup Form Handlers
function setupFormHandlers() {
    // Register Student Form
    document.getElementById('registerStudentForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const studentId = document.getElementById('regStudentId').value.trim();
        const studentName = document.getElementById('regStudentName').value.trim();
        const yearSection = document.getElementById('regYearSection').value.trim();

        // Get selected classes
        const selectedClasses = Array.from(document.querySelectorAll('input[name="enrollClass"]:checked'))
            .map(cb => cb.value);

        try {
            const response = await fetch('api/admin/register_student.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    student_id: studentId,
                    student_name: studentName,
                    year_section: yearSection,
                    classes: selectedClasses
                })
            });

            const data = await response.json();

            if (data.success) {
                showToast('Student registered successfully', 'success');
                this.reset();
                document.querySelectorAll('input[name="enrollClass"]').forEach(cb => cb.checked = false);
            } else {
                showToast(data.error || 'Failed to register student', 'error');
            }
        } catch (error) {
            showToast('Error registering student', 'error');
            console.error('Error:', error);
        }
    });

    // New Class Form
    document.getElementById('newClassForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const edpCode = document.getElementById('edpCode').value.trim();
        const courseSubject = document.getElementById('courseSubject').value.trim();
        const instructor = document.getElementById('instructor').value.trim();
        const roomNumber = document.getElementById('roomNumber').value.trim();
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;

        const selectedDays = Array.from(document.querySelectorAll('input[name="days"]:checked'))
            .map(cb => cb.value)
            .join(', ');

        if (!selectedDays) {
            showToast('Please select at least one day', 'warning');
            return;
        }

        try {
            const response = await fetch('api/admin/add_class.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    edp_code: edpCode,
                    course_subject: courseSubject,
                    instructor: instructor,
                    room_number: roomNumber,
                    start_time: startTime,
                    end_time: endTime,
                    days: selectedDays
                })
            });

            const data = await response.json();

            if (data.success) {
                showToast('Class added successfully', 'success');
                this.reset();
                hideAddClassForm();
                loadClasses();
            } else {
                showToast(data.error || 'Failed to add class', 'error');
            }
        } catch (error) {
            showToast('Error adding class', 'error');
            console.error('Error:', error);
        }
    });
}

// Load Classes for Enrollment
async function loadClassesForEnrollment() {
    try {
        const response = await fetch('api/admin/classes.php');
        const data = await response.json();

        if (data.success) {
            allClasses = data.classes;
            displayClassEnrollmentList(data.classes);
        }
    } catch (error) {
        console.error('Error loading classes:', error);
    }
}

function displayClassEnrollmentList(classes) {
    const container = document.getElementById('classEnrollmentList');

    if (classes.length === 0) {
        container.innerHTML = '<p>No classes available. Please add classes first.</p>';
        return;
    }

    let html = '<div class="checkbox-group">';
    classes.forEach(cls => {
        html += `
            <label>
                <input type="checkbox" name="enrollClass" value="${cls.class_id}">
                ${cls.edp_code} - ${cls.course_subject}
            </label>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

// Load Classes
async function loadClasses() {
    try {
        const response = await fetch('api/admin/classes.php');
        const data = await response.json();

        const container = document.getElementById('classesList');

        if (data.success && data.classes.length > 0) {
            let html = `
                <table>
                    <thead>
                        <tr>
                            <th>EDP Code</th>
                            <th>Course</th>
                            <th>Instructor</th>
                            <th>Room</th>
                            <th>Time</th>
                            <th>Days</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            data.classes.forEach(cls => {
                html += `
                    <tr>
                        <td>${cls.edp_code}</td>
                        <td>${cls.course_subject}</td>
                        <td>${cls.instructor}</td>
                        <td>${cls.room_number}</td>
                        <td>${cls.start_time} - ${cls.end_time}</td>
                        <td>${cls.days}</td>
                        <td>
                            <button class="btn btn-danger" onclick="deleteClass(${cls.class_id})">Delete</button>
                        </td>
                    </tr>
                `;
            });

            html += '</tbody></table>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<div class="empty-state">No classes found</div>';
        }
    } catch (error) {
        console.error('Error loading classes:', error);
    }
}

// Delete Class
async function deleteClass(classId) {
    if (!confirm('Are you sure you want to delete this class?')) return;

    try {
        const response = await fetch('api/admin/delete_class.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ class_id: classId })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Class deleted successfully', 'success');
            loadClasses();
        } else {
            showToast('Failed to delete class', 'error');
        }
    } catch (error) {
        showToast('Error deleting class', 'error');
        console.error('Error:', error);
    }
}

// Show/Hide Add Class Form
function showAddClassForm() {
    document.getElementById('addClassForm').style.display = 'block';
}

function hideAddClassForm() {
    document.getElementById('addClassForm').style.display = 'none';
}

// Toast Notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
