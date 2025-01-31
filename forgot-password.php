<?php

require 'db.php'; // Your PDO database connection file

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = trim($_POST['email']);

    // Check if email exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Generate reset token and expiry
        $token = bin2hex(random_bytes(32));
        $expires = date("Y-m-d H:i:s", strtotime('+1 hour'));

        // Store token in the database
        $stmt = $pdo->prepare("INSERT INTO password_resets (email, token, expires) 
                               VALUES (?, ?, ?) 
                               ON DUPLICATE KEY UPDATE token=?, expires=?");
        $stmt->execute([$email, $token, $expires, $token, $expires]);

        // Send reset email
        $serverIP = "localhost/mr-worker"; // Replace with your actual Google Cloud server IP
        $resetLink = "http://$serverIP/reset-password.html?token=$token";

        $subject = "Password Reset Request";
        $message = "Click the link below to reset your password:\n$resetLink\nThis link expires in 1 hour.";

        //mail($email, $subject, $message, "From: no-reply@yourwebsite.com");

        //echo "A password reset link has been sent to your email.";

        echo "Copy and paste this link in your browser to reset your password: <a href='$resetLink'>$resetLink</a>";
    } else {
        echo "No account found with that email.";
        echo "</br><a href='sign-in.html'>Login</a>";
    }
}
