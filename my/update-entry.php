<?php
session_start();

header('Content-Type: application/json');

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
  error_log('User not logged in');
  echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
  exit();
}

$user_id = $_SESSION['user_id'];
$selectedLanguage = $_SESSION['selected_language'];

// Check if the POST request contains the required data
if (isset($_POST['id']) && isset($_POST['call'])) {
  require '../db.php'; // Include the PDO connection

  // Get the entry type and ID
  $entryType = trim(strip_tags($_POST['call']));
  $id = trim(strip_tags($_POST['id']));

  // Sanitize input values
  $city = trim(strip_tags($_POST['city']));
  $country = trim(strip_tags($_POST['country']));
  $start_date = trim(strip_tags($_POST['start_date']));
  $is_current = isset($_POST['is_current']) ? (int)$_POST['is_current'] : 0;
  $end_date = !$is_current ? trim(strip_tags($_POST['end_date'])) : null;

  if ($entryType === 'work_experience' || $entryType === 'education') {
    // Determine the table and fields
    $table = ($entryType === 'work_experience') ? 'employers' : 'courses';
    $titleField = ($entryType === 'work_experience') ? ['employer', 'job_position'] : ['school', 'course'];

    // Validate title fields
    $title1 = trim(strip_tags($_POST[$titleField[0]]));
    $title2 = trim(strip_tags($_POST[$titleField[1]]));

    if (!$title1 || !$title2) {
      error_log("Missing required fields for $entryType update");
      echo json_encode(['status' => 'error', 'message' => "Missing required fields for $entryType"]);
      exit();
    }

    // Format dates
    $start_date = $start_date ? date('Y-m', strtotime($start_date)) : null;
    // Set end_date to the current saved date in the database if is_current is true
    if ($is_current) {
      $query = $pdo->prepare("SELECT end_date FROM `$table` WHERE `id` = :id AND `user_id` = :user_id");
      $query->execute([':id' => $id, ':user_id' => $user_id]);
      $result = $query->fetch(PDO::FETCH_ASSOC);
      $end_date = $result['end_date'] ?? null;
    } else {
      $end_date = $end_date ? date('Y-m', strtotime($end_date)) : null;
    }

    try {
      // Prepare the SQL query
      $sql = "UPDATE `$table` SET 
                    `$titleField[0]` = :title1, 
                    `$titleField[1]_$selectedLanguage` = :title2, 
                    `area` = :city, 
                    `country_$selectedLanguage` = :country, 
                    `start_date` = :start_date, 
                    `end_date` = :end_date, 
                    `is_current` = :is_current 
                    WHERE `id` = :id AND `user_id` = :user_id";

      $stmt = $pdo->prepare($sql);

      // Bind parameters
      $stmt->execute([
        ':title1' => $title1,
        ':title2' => $title2,
        ':city' => $city,
        ':country' => $country,
        ':start_date' => $start_date,
        ':end_date' => $end_date,
        ':is_current' => $is_current,
        ':id' => $id,
        ':user_id' => $user_id
      ]);

      if ($stmt->rowCount() > 0) {
        echo json_encode(['status' => 'success']);
      } else {
        echo json_encode(['status' => 'error', 'message' => 'No changes made or invalid ID.']);
      }
    } catch (PDOException $e) {
      error_log('Database error: ' . $e->getMessage());
      echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
  } else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid entry type']);
    exit();
  }
} else {
  echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
}
