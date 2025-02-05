<?php
session_start();

// Set the content type to JSON
header('Content-Type: application/json');

// If user is not logged in, return error
if (!isset($_SESSION['user_id'])) {
  echo json_encode(['status' => 'error', 'message' => 'User is not logged in']);
  exit();
}

if (isset($_POST['id']) && isset($_POST['call'])) {
  $experienceId = trim(strip_tags($_POST['id']));
  $call = trim(strip_tags($_POST['call']));

  if (!$experienceId || !$call) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid parameters']);
    exit();
  }

  require '../db.php'; // Include the PDO connection

  try {
    if ($call === 'work_experience') {
      // Delete work experience
      $stmt = $pdo->prepare("DELETE FROM `employers` WHERE `id` = :id");
      $stmt->execute([':id' => $experienceId]);

      // Delete associated skills
      $stmt = $pdo->prepare("DELETE FROM `work_experience` WHERE `employerId` = :id");
      $stmt->execute([':id' => $experienceId]);
    } elseif ($call === 'education') {
      // Delete education
      $stmt = $pdo->prepare("DELETE FROM `courses` WHERE `id` = :id");
      $stmt->execute([':id' => $experienceId]);

      // Delete associated skills
      $stmt = $pdo->prepare("DELETE FROM `education` WHERE `courseId` = :id");
      $stmt->execute([':id' => $experienceId]);
    } else {
      echo json_encode(['status' => 'error', 'message' => 'Invalid call type']);
      exit();
    }

    echo json_encode(['status' => 'success']);
  } catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
  }
} else {
  echo json_encode(['status' => 'error', 'message' => 'Missing required parameters']);
}
