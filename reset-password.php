<?php
require 'db.php'; // Your PDO database connection file

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $token = $_POST['token'];
    $new_password = password_hash($_POST['new_password'], PASSWORD_DEFAULT);

    // Verify token and get email
    $stmt = $pdo->prepare("SELECT email FROM password_resets WHERE token = ? AND expires > NOW()");
    $stmt->execute([$token]);
    $reset = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($reset) {
        $email = $reset['email'];

        // Update user password
        $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE email = ?");
        $stmt->execute([$new_password, $email]);

        // Delete token
        $stmt = $pdo->prepare("DELETE FROM password_resets WHERE email = ?");
        $stmt->execute([$email]);

        echo "Password has been reset successfully. You can now log in.";
        echo "</br><a href='sign-in.html'>Login</a>";
    } else {
        echo "Invalid or expired token.";
        echo "</br><a href='sign-in.html'>Login</a>";
    }
}
