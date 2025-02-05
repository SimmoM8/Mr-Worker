<?php
session_start();

// Start output buffering to capture any output from warnings/errors
ob_start();

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
  error_log('User not logged in');
  echo json_encode(['error' => 'User not logged in']);
  exit();
}

// Check if the required parameters are provided
if (isset($_GET['id']) && isset($_GET['call'])) {
  $experienceId = trim(strip_tags($_POST['id']));
  $call = trim(strip_tags($_POST['call']));

  if (!$experienceId || !$call) {
    ob_end_clean();
    echo json_encode(['error' => 'Invalid input parameters']);
    exit();
  }

  require '../db.php'; // Include the PDO connection

  try {
    // Prepare the SQL query based on the type of experience
    if ($call === 'work_experience') {
      $sql = "SELECT `id`, `employer`, `job_position`, `area` AS `city`, `country`, 
                           `start_date`, `end_date`, `is_current`
                    FROM `employers`
                    WHERE `id` = :id";
    } elseif ($call === 'education') {
      $sql = "SELECT `id`, `school`, `course`, `area` AS `city`, `country`, 
                           `start_date`, `end_date`, `is_current`
                    FROM `courses`
                    WHERE `id` = :id";
    } else {
      ob_end_clean();
      echo json_encode(['error' => 'Invalid call type']);
      exit();
    }

    // Prepare the statement
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $experienceId]);

    // Fetch the result
    $experience = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($experience) {
      // Convert start_date and end_date to separate month/year values
      if (!empty($experience['start_date'])) {
        $startDate = date_create($experience['start_date']);
        $experience['start_month'] = date_format($startDate, 'F');
        $experience['start_year'] = date_format($startDate, 'Y');
      } else {
        $experience['start_month'] = '';
        $experience['start_year'] = '';
      }

      if (!empty($experience['end_date']) && $experience['end_date'] !== '0000-00-00') {
        $endDate = date_create($experience['end_date']);
        $experience['end_month'] = date_format($endDate, 'F');
        $experience['end_year'] = date_format($endDate, 'Y');
      } else {
        $experience['end_month'] = '';
        $experience['end_year'] = '';
      }

      // Convert `is_current` from integer to boolean for easier frontend usage
      $experience['is_current'] = (bool)$experience['is_current'];

      ob_end_clean();
      header('Content-Type: application/json');
      echo json_encode($experience);
    } else {
      ob_end_clean();
      echo json_encode(['error' => 'No experience found']);
    }
  } catch (PDOException $e) {
    ob_end_clean();
    error_log('Database error: ' . $e->getMessage());
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
  }
} else {
  ob_end_clean();
  echo json_encode(['error' => 'Missing required fields']);
}
