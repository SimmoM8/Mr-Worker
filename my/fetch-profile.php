<?php
session_start();

// If user is not logged in, redirect to sign-in page
if (!isset($_SESSION['user_id'])) {
    header("Location: ../sign-in.html");
    exit();
}

require '../db.php'; // Include the PDO connection

try {
    $userId = $_SESSION['user_id'];

    // Prepare the SQL query
    $stmt = $pdo->prepare("SELECT * FROM `users` WHERE `id` = :user_id");
    $stmt->execute([':user_id' => $userId]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        $imgPath = $user['img_path'];
        $imgScale = $user['img_scale'];
        $imgPosX = $user['img_pos_x'];
        $imgPosY = $user['img_pos_y'];

        // Include the HTML template
        ob_start(); // Start output buffering
        include('template-card-add.html');
        $ajax_output = ob_get_clean(); // Get the buffered output
    } else {
        $ajax_output = 'No user data found.';
    }
} catch (PDOException $e) {
    $ajax_output = 'Error: ' . $e->getMessage();
}

// Output the result
echo $ajax_output;
?>