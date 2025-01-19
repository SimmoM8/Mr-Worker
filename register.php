<?php
ini_set('display_errors', 0);
error_reporting(0);
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
$username = htmlspecialchars(trim($data['username']));
$password = $data['password'];
$confirmPassword = $data['confirmPassword'];

if (!$email || !$firstName || !$lastName || !$username || !$password || !$confirmPassword) {
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
    $stmt = $pdo->prepare('INSERT INTO users (email, first_name, last_name, username, password) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$email, $firstName, $lastName, $username, $passwordHash]);
    echo json_encode(['success' => 'Registration successful.']);
} catch (PDOException $e) {
    if ($e->getCode() == 23000) { // Unique constraint violation
        echo json_encode(['error' => 'Email or username already exists.']);
    } else {
        echo json_encode(['error' => 'An error occurred.']);
    }
}
?>
