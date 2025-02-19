<?php
session_start();

// Set the content type to JSON
header('Content-Type: application/json');

// If user is not logged in, return error response
if (!isset($_SESSION['user_id'])) {
  echo json_encode(['error' => 'User is not logged in']);
  exit();
}

require '../db.php'; // Include the PDO connection

$call = trim(strip_tags($_GET['call']));
$valid_calls = ['work_experience', 'education', 'hard_skills', 'soft_skills', 'languages', 'licenses'];

if (!in_array($call, $valid_calls)) {
  echo json_encode(['error' => 'Invalid call type']);
  exit();
}

$userId = $_SESSION['user_id'];
$response = [];

try {
  if (in_array($call, ['hard_skills', 'soft_skills'])) {
    // Fetch skills
    $stmt = $pdo->prepare("SELECT id, skill_lang_1 FROM `$call` WHERE `user_id` = :user_id ORDER BY `id` ASC");
    $stmt->execute([':user_id' => $userId]);
    $response = $stmt->fetchAll(PDO::FETCH_ASSOC);
  } elseif ($call === 'languages') {
    // Fetch languages
    $stmt = $pdo->prepare("SELECT id, language_lang_1, percentage FROM `languages` WHERE `user_id` = :user_id ORDER BY `id` ASC");
    $stmt->execute([':user_id' => $userId]);
    $response = $stmt->fetchAll(PDO::FETCH_ASSOC);
  } elseif ($call === 'licenses') {
    // Fetch licenses
    $stmt = $pdo->prepare("SELECT id, license_lang_1, description_lang_1 FROM `licenses` WHERE `user_id` = :user_id ORDER BY `id` ASC");
    $stmt->execute([':user_id' => $userId]);
    $response = $stmt->fetchAll(PDO::FETCH_ASSOC);
  } else {
    // Fetch work experience or education
    if ($call === 'work_experience') {
      $mainTable = 'employers';
      $skillsTable = 'work_experience';
      $fields = 'id, job_position_lang_1, employer, area, country_lang_1, start_date, end_date, is_current';
    } else {
      $mainTable = 'courses';
      $skillsTable = 'education';
      $fields = 'id, course_lang_1, school, area, country_lang_1, start_date, end_date, is_current';
    }

    $stmt = $pdo->prepare("SELECT $fields FROM `$mainTable` WHERE `user_id` = :user_id ORDER BY `order` ASC");
    $stmt->execute([':user_id' => $userId]);
    $entries = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($entries as $entry) {

      // Convert dates to Mmm Year format
      $startDate = $entry['start_date'] ? (new DateTime($entry['start_date']))->format('M Y') : '';
      $endDate = $entry['is_current'] ? 'Present' : ($entry['end_date'] ? (new DateTime($entry['end_date']))->format('M Y') : '');

      $entryData = [
        "id" => $entry['id'],
        "title" => $call === 'work_experience' ? $entry['job_position_lang_1'] : $entry['course_lang_1'],
        "organization" => $call === 'work_experience' ? $entry['employer'] : $entry['school'],
        "location" => $entry['area'] . ", " . $entry['country_lang_1'],
        "start_date" => $startDate,
        "end_date" => $endDate,
        "skills" => [],
      ];

      // Fetch skills associated with the entry
      $columnId = $call === 'work_experience' ? 'employerId' : 'courseId';
      $skillsStmt = $pdo->prepare("SELECT id, skill_lang_1 FROM `$skillsTable` WHERE `$columnId` = :id AND `user_id` = :user_id");
      $skillsStmt->execute([':id' => $entry['id'], ':user_id' => $userId]);

      $skills = $skillsStmt->fetchAll(PDO::FETCH_ASSOC);

      foreach ($skills as $skill) {
        $entryData['skills'][] = [
          "skill_id" => $skill['id'],
          "skill_name" => $skill['skill_lang_1'],
        ];
      }

      $response[] = $entryData;
    }
  }

  echo json_encode($response);
} catch (PDOException $e) {
  echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
