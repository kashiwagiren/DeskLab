-- DeskLab Database Schema
-- Drop existing tables if they exist
DROP TABLE IF EXISTS Pending_Requests;
DROP TABLE IF EXISTS Logins;
DROP TABLE IF EXISTS Enrolled_Students;
DROP TABLE IF EXISTS Classes;
DROP TABLE IF EXISTS Students;

-- Students Table
CREATE TABLE Students (
    student_id VARCHAR(8) PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    year_section VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classes Table
CREATE TABLE Classes (
    class_id INT AUTO_INCREMENT PRIMARY KEY,
    edp_code VARCHAR(5) NOT NULL UNIQUE,
    course_subject VARCHAR(100) NOT NULL,
    instructor VARCHAR(100) NOT NULL,
    room_number VARCHAR(10) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    days VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enrolled_Students Table
CREATE TABLE Enrolled_Students (
    enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(8) NOT NULL,
    class_id INT NOT NULL,
    edp_code VARCHAR(5) NOT NULL,
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES Classes(class_id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (student_id, class_id)
);

-- Logins Table
CREATE TABLE Logins (
    login_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(8) NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    year_section VARCHAR(50) NOT NULL,
    room_number VARCHAR(10) NOT NULL,
    class_id INT NULL,
    purpose TEXT NULL,
    time_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_out TIMESTAMP NULL,
    status ENUM('Enrolled (Allowed)', 'No class - Auto Allowed', 'Admin Approved', 'Denied') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES Classes(class_id) ON DELETE SET NULL
);

-- Pending_Requests Table
CREATE TABLE Pending_Requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(8) NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    year_section VARCHAR(50) NOT NULL,
    room_number VARCHAR(10) NOT NULL,
    class_id INT NOT NULL,
    purpose TEXT NOT NULL,
    request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin_decision ENUM('Pending', 'Accepted', 'Rejected') DEFAULT 'Pending',
    decided_at TIMESTAMP NULL,
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES Classes(class_id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_classes_room_time ON Classes(room_number, start_time, end_time);
CREATE INDEX idx_logins_active ON Logins(is_active, room_number);
CREATE INDEX idx_pending_status ON Pending_Requests(admin_decision, request_time);
