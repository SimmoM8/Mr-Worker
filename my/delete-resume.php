<?php
session_start();

// If user is not logged in, redirect to sign-in page
if (!isset($_SESSION['user_id'])) {
    header("Location: ../sign-in.html");
    exit();
}

$userId = $_SESSION['user_id'];
$resumeId = $_POST['id'] ?? null;

if (!$resumeId) {
    echo json_encode(['error' => 'Resume ID is required.']);
    exit();
}

// Include the database connection
include '../db.php';

try {
    // Prepare the SQL statement with placeholders
    $stmt = $pdo->prepare("DELETE FROM `resumes` WHERE `id` = :resumeId AND `user_id` = :userId");

    // Bind parameters securely to prevent SQL injection
    $stmt->bindValue(':resumeId', $resumeId, PDO::PARAM_INT);
    $stmt->bindValue(':userId', $userId, PDO::PARAM_INT);

    // Execute the query
    $stmt->execute();

    // Check if a row was deleted
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => 'Resume successfully deleted.']);
    } else {
        echo json_encode(['error' => 'No matching resume found or delete failed.']);
    }
} catch (PDOException $e) {
    // Log the error for debugging
    error_log($e->getMessage());

    // Return an error response
    echo json_encode(['error' => 'An error occurred while deleting the resume.']);
}
?>
