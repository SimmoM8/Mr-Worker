<?php
session_start();

header('Content-Type: application/json');

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
  error_log('User not logged in');
  echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
  exit();
}

// Check if the POST request contains the required data
if (isset($_POST['call'])) {
  require '../db.php'; // Include the PDO connection

  $user_id = $_SESSION['user_id'];
  $entryType = trim(strip_tags($_POST['call']));
  $city = trim(strip_tags($_POST['city']));
  $country = trim(strip_tags($_POST['country']));
  $start_date = date('Y-m', strtotime(trim(strip_tags($_POST['start_date']))));
  $is_current = isset($_POST['is_current']) ? (int)$_POST['is_current'] : 0;
  $end_date = isset($_POST['end_date']) ? date('Y-m', strtotime(trim(strip_tags($_POST['end_date']))))
    : ($is_current ? date('Y-m') : null);

  try {
    if ($entryType === 'work_experience') {
      // Handle work experience fields
      $employer = trim(strip_tags($_POST['employer']));
      $job_position = trim(strip_tags($_POST['job_position']));

      if (!$employer || !$job_position) {
        echo json_encode(['status' => 'error', 'message' => 'Missing required fields for work experience']);
        exit();
      }

      // Prepare the SQL statement
      $stmt = $pdo->prepare(
        "INSERT INTO `employers` (`user_id`, `employer`, `job_position`, `area`, `country`, `start_date`, `end_date`, `is_current`) 
                 VALUES (:user_id, :employer, :job_position, :city, :country, :start_date, :end_date, :is_current)"
      );

      // Bind parameters
      $stmt->execute([
        ':user_id' => $user_id,
        ':employer' => $employer,
        ':job_position' => $job_position,
        ':city' => $city,
        ':country' => $country,
        ':start_date' => $start_date,
        ':end_date' => $end_date,
        ':is_current' => $is_current,
      ]);
    } elseif ($entryType === 'education') {
      // Handle education fields
      $school = trim(strip_tags($_POST['school']));
      $course = trim(strip_tags($_POST['course']));

      if (!$school || !$course) {
        echo json_encode(['status' => 'error', 'message' => 'Missing required fields for education']);
        exit();
      }

      // Prepare the SQL statement
      $stmt = $pdo->prepare(
        "INSERT INTO `courses` (`user_id`, `school`, `course`, `area`, `country`, `start_date`, `end_date`, `is_current`) 
                 VALUES (:user_id, :school, :course, :city, :country, :start_date, :end_date, :is_current)"
      );

      // Bind parameters
      $stmt->execute([
        ':user_id' => $user_id,
        ':school' => $school,
        ':course' => $course,
        ':city' => $city,
        ':country' => $country,
        ':start_date' => $start_date,
        ':end_date' => $end_date,
        ':is_current' => $is_current,
      ]);
    } else {
      echo json_encode(['status' => 'error', 'message' => 'Invalid entry type']);
      exit();
    }

    // If the query executes successfully
    echo json_encode(['status' => 'success']);
  } catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
  }
} else {
  echo json_encode(['status' => 'error', 'message' => 'Missing required call type']);
}
