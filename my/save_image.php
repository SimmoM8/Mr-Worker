<?php
session_start();

header('Content-Type: application/json');

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
  echo json_encode(['error' => 'User not logged in']);
  exit();
}

require_once '../db.php'; // Include the PDO connection

$user_id = $_SESSION['user_id'];
$img_scale = trim(strip_tags($_POST['img_scale']));
$img_pos_x = trim(strip_tags($_POST['img_pos_x']));
$img_pos_y = trim(strip_tags($_POST['img_pos_y']));

$uploadDir = __DIR__ . '/uploads/';

// Find the temporary file
$tempFiles = glob($uploadDir . "_temp_profile_picture_user_{$user_id}.*");
if ($tempFiles) {
  $tempFile = $tempFiles[0]; // Take the first match
  $fileExtension = pathinfo($tempFile, PATHINFO_EXTENSION);
  $finalFile = $uploadDir . "profile_picture_user_{$user_id}." . $fileExtension;

  // Remove old profile picture files if they exist
  $oldFiles = glob($uploadDir . "profile_picture_user_{$user_id}.*");
  foreach ($oldFiles as $oldFile) {
    unlink($oldFile);
  }

  // Rename the temporary file to the final profile picture name
  if (!rename($tempFile, $finalFile)) {
    echo json_encode(['error' => 'Failed to save the profile picture file.']);
    exit();
  }
} else {
  // If no temporary file exists, log this and continue
  $finalFile = null;
  $fileExtension = null;
}

try {
  // Save the image scale, position, and other data in the database
  $stmt = $pdo->prepare(
    "UPDATE `users` SET `img_scale` = :img_scale, `img_pos_x` = :img_pos_x, `img_pos_y` = :img_pos_y WHERE `id` = :user_id"
  );

  $stmt->execute([
    ':img_scale' => $img_scale,
    ':img_pos_x' => $img_pos_x,
    ':img_pos_y' => $img_pos_y,
    ':user_id' => $user_id,
  ]);

  echo json_encode([
    'success' => true,
    'message' => 'Profile picture updated successfully.',
    'filePath' => $finalFile ? "uploads/profile_picture_user_{$user_id}.{$fileExtension}" : null,
  ]);
} catch (PDOException $e) {
  echo json_encode(['error' => 'Failed to save image data.', 'details' => $e->getMessage()]);
}
