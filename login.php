<?php
require 'db.php';
session_start();

$username = htmlspecialchars(trim($_POST['username']));
$password = $_POST['password'];

if (!$username || !$password) {
    echo 'Username and password are required.';
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT id, password FROM users WHERE username = ?');
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        header('Location: my/index.php');
        exit;
    } else {
        echo 'Invalid username or password.';
    }
} catch (PDOException $e) {
    echo 'An error occurred.';
}
?>
