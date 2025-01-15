<?php
session_start();

// Ensure the user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

// Return selected session data
echo json_encode([
    'hard_skills' => $_SESSION['hard_skills'] ?? '',
    'soft_skills' => $_SESSION['soft_skills'] ?? '',
    'languages' => $_SESSION['languages'] ?? '',
    'licenses' => $_SESSION['licenses'] ?? '',
    'work_experience' => $_SESSION['work_experience'] ?? '',
    'employers' => $_SESSION['employers'] ?? '',
    'education' => $_SESSION['education'] ?? '',
    'courses' => $_SESSION['courses'] ?? ''
]);
