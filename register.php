<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
ob_clean(); // Clear any previous output

require 'db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    echo json_encode(['error' => 'Invalid request.']);
    exit;
}

$email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
$firstName = htmlspecialchars(trim($data['first_name']));
$lastName = htmlspecialchars(trim($data['last_name']));
$password = $data['password'];
$confirmPassword = $data['confirmPassword'];

if (!$email || !$firstName || !$lastName || !$password || !$confirmPassword) {
    echo json_encode(['error' => 'All fields are required.']);
    exit;
}

if ($password !== $confirmPassword) {
    echo json_encode(['error' => 'Passwords do not match.']);
    exit;
}

if (strlen($password) < 8) {
    echo json_encode(['error' => 'Password must be at least 8 characters.']);
    exit;
}

$passwordHash = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare('INSERT INTO users (email, first_name, last_name, password) VALUES (?, ?, ?, ?)');
    $stmt->execute([$email, $firstName, $lastName, $passwordHash]);
    $userId = $pdo->lastInsertId();
    $initLangStmt = $pdo->prepare('INSERT INTO user_languages (user_id, lang_1) VALUES (?, ?)');
    $initLangStmt->execute([$userId, 'en']);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    if ($e->getCode() == 23000) { // Unique constraint violation
        echo json_encode(['error' => 'Email already exists.']);
    } else {
        echo json_encode(['error' => 'An error occurred.']);
    }
}
