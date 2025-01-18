<?php
session_start();
header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'User not logged in']);
    exit();
}

require_once '../db.php'; // Include the PDO connection

try {
    $user_id = $_SESSION['user_id'];

    // Prepare and execute the query
    $stmt = $pdo->prepare("SELECT * FROM `users` WHERE `id` = :user_id");
    $stmt->execute([':user_id' => $user_id]);

    // Fetch the user data
    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($data) {
        echo json_encode($data);
    } else {
        echo json_encode(['error' => 'No user data found']);
    }
} catch (PDOException $e) {
    // Handle database errors gracefully
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
