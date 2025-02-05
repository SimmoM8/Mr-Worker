<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


// Set the content type to JSON
header('Content-Type: application/json');

// If user is not logged in, return an error response
if (!isset($_SESSION['user_id'])) {
  echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
  exit();
}

// Check if the request is a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  // Get the reordered list and section type from POST parameters
  $section = trim(strip_tags($_POST['section']));

  $orderData = json_decode($_POST['order'], true);

  if (!$section || !$orderData) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid input data']);
    exit();
  }

  require '../db.php'; // Include the PDO connection

  try {
    // Determine which table to update based on the section
    $tableName = $section === 'work_experience' ? 'employers' : 'courses';

    // Prepare the SQL statement
    $stmt = $pdo->prepare("UPDATE `$tableName` SET `order` = :newOrder WHERE `id` = :id");

    // Loop through each reordered item and update its position in the database
    foreach ($orderData as $item) {
      $experienceId = intval($item['id']);
      $newOrder = intval($item['order']);
      error_log("Updating ID: $experienceId with Order: $newOrder");

      $stmt->execute([
        ':newOrder' => $newOrder,
        ':id' => $experienceId,
      ]);
    }

    echo json_encode(['status' => 'success']);
  } catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
  }
} else {
  echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}
