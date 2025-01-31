<?php
require 'db.php';
session_start();

$input = htmlspecialchars(trim($_POST['username'])); // Can be either username or email
$password = $_POST['password'];

if (!$input || !$password) {
    echo 'Username/email and password are required.';
    exit;
}

try {
    // Check if input matches either username or email
    $stmt = $pdo->prepare('SELECT id, password FROM users WHERE username = ? OR email = ?');
    $stmt->execute([$input, $input]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        header('Location: my/index.php');
        exit;
    } else {
        echo 'Invalid username, email, or password.';
    }
} catch (PDOException $e) {
    echo 'An error occurred.';
}
