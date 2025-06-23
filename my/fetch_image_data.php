<?php
session_start();
include '../db.php';
// If user is not logged in, redirect to sign-in page
if (!isset($_SESSION['user_id'])) {
  header("Location: ../sign-in.html");
  exit();
}

$user_id = $_SESSION["user_id"];

$uploadDir = __DIR__ . '/uploads/';
$profilePicture = glob($uploadDir . "profile_picture_user_{$user_id}.*"); // Find file with any extension

$filePath = $profilePicture ? "uploads/" . basename($profilePicture[0]) : null; // Get the file name or set to null

// Retrieve scale, position, and other data
try {
  $id = $user_id;
  $stmt = $pdo->prepare("SELECT img_scale, img_pos_x, img_pos_y FROM users WHERE `user_id` = :id");
  $stmt->bindValue(':id', $id, PDO::PARAM_INT);
  $stmt->execute();

  $imageData = $stmt->fetch(PDO::FETCH_ASSOC);
  if ($imageData) {
    $imageData['img_path'] = $filePath; // Set image path
    echo json_encode($imageData); // Return image data
  } else {
    echo json_encode(['error' => 'No image found']);
  }
} catch (Exception $e) {
  error_log($e->getMessage());
  echo json_encode(['error' => 'An error occurred']);
}
