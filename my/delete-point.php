<?php
session_start();

// Set the content type to JSON
header('Content-Type: application/json');

// If user is not logged in, return error response
if (!isset($_SESSION['user_id'])) {
  echo json_encode(['status' => 'error', 'message' => 'User is not logged in']);
  exit();
}

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $pointId = trim(strip_tags($_POST['pointId']));
  $call = trim(strip_tags($_POST['call']));

  if (!$pointId || !$call) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid input parameters']);
    exit();
  }

  require '../db.php'; // Include the PDO connection

  try {
    // Prepare the SQL statement to delete the point
    $stmt = $pdo->prepare("DELETE FROM `$call` WHERE `id` = :id");
    $stmt->execute([':id' => $pointId]);

    if ($stmt->rowCount() > 0) {
      echo json_encode(['status' => 'success', 'message' => 'Point deleted successfully']);
    } else {
      echo json_encode(['status' => 'error', 'message' => 'No record found to delete']);
    }
  } catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
  }
} else {
  echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
  http_response_code(405); // Method Not Allowed
}
