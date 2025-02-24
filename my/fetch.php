<?php
session_start();

// Set the content type to JSON
header('Content-Type: application/json');

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
  echo json_encode(['error' => 'User is not logged in']);
  exit();
}

error_log("Test: ");
// Set the selected language
$selectedLanguage = $_SESSION['selected_language'] ?? 'lang_1'; // Default to lang_1 if not set
error_log("Selected Language: " . $selectedLanguage);

require '../db.php'; // Include the PDO connection

// Validate the call
$call = trim(strip_tags($_GET['call']));
$valid_calls = ['work_experience', 'education', 'hard_skills', 'soft_skills', 'languages', 'licenses'];

if (!in_array($call, $valid_calls)) {
  echo json_encode(['error' => 'Invalid call type']);
  exit();
}

$userId = $_SESSION['user_id'];
$responseData = [];

try {
  error_log("Call: " . $call);
  // Dynamic queries based on call type
  if (in_array($call, ['hard_skills', 'soft_skills'])) {
    // Fetch skills
    $stmt = $pdo->prepare("SELECT id, `skill_$selectedLanguage` AS skill FROM `$call` WHERE `user_id` = :user_id ORDER BY `id` ASC");
    $stmt->execute([':user_id' => $userId]);
    $responseData = ($stmt->fetchAll(PDO::FETCH_ASSOC));
  } elseif ($call === 'languages') {
    // Fetch languages
    $stmt = $pdo->prepare("SELECT id, `language_$selectedLanguage` AS language, percentage FROM `languages` WHERE `user_id` = :user_id ORDER BY `id` ASC");
    $stmt->execute([':user_id' => $userId]);
    $responseData = ($stmt->fetchAll(PDO::FETCH_ASSOC));
  } elseif ($call === 'licenses') {
    // Fetch licenses
    $stmt = $pdo->prepare("SELECT id, `license_$selectedLanguage` AS license, `description_$selectedLanguage` AS description FROM `licenses` WHERE `user_id` = :user_id ORDER BY `id` ASC");
    $stmt->execute([':user_id' => $userId]);
    $responseData = ($stmt->fetchAll(PDO::FETCH_ASSOC));
  } else {
    // Work Experience or Education
    if ($call === 'work_experience') {
      $mainTable = 'employers';
      $skillsTable = 'work_experience';
      $fields = "id, job_position_lang_1 As ref, `job_position_$selectedLanguage` AS job_position, employer, area, `country_$selectedLanguage` AS country, start_date, end_date, is_current";
    } else {
      $mainTable = 'courses';
      $skillsTable = 'education';
      $fields = "id, course_lang_1 As ref, `course_$selectedLanguage` AS course, school, area, `country_$selectedLanguage` AS country, start_date, end_date, is_current";
    }

    // Main query
    $stmt = $pdo->prepare("SELECT $fields FROM `$mainTable` WHERE `user_id` = :user_id ORDER BY `order` ASC");
    $stmt->execute([':user_id' => $userId]);
    $entries = ($stmt->fetchAll(PDO::FETCH_ASSOC));

    foreach ($entries as $entry) {
      $startDate = $entry['start_date'] ? (new DateTime($entry['start_date']))->format('M Y') : '';
      $endDate = $entry['is_current'] ? 'Present' : ($entry['end_date'] ? (new DateTime($entry['end_date']))->format('M Y') : '');

      $entryData = [
        "id" => $entry['id'],
        "title" => $call === 'work_experience' ? $entry['job_position'] : $entry['course'],
        "ref_title" => $entry['ref'],
        "organization" => $call === 'work_experience' ? $entry['employer'] : $entry['school'],
        "location" => $entry['area'] . ", " . $entry['country'],
        "start_date" => $startDate,
        "end_date" => $endDate,
        "skills" => [],
      ];

      // Fetch skills for each entry
      $columnId = $call === 'work_experience' ? 'employerId' : 'courseId';
      $skillsStmt = $pdo->prepare("SELECT id, skill_lang_1 AS ref, `skill_$selectedLanguage` AS skill FROM `$skillsTable` WHERE `$columnId` = :id AND `user_id` = :user_id");
      $skillsStmt->execute([':id' => $entry['id'], ':user_id' => $userId]);
      $skills = ($skillsStmt->fetchAll(PDO::FETCH_ASSOC));

      foreach ($skills as $skill) {
        $entryData['skills'][] = [
          "skill_id" => $skill['id'],
          "skill_name" => $skill['skill'],
          "ref_skill" => $skill['ref'],
        ];
      }

      $responseData[] = $entryData;
    }
  }

  // Send selected language along with the data
  $response = [
    'selected_language' => $selectedLanguage,
    'null_message' => '- Enter translate mode to type translation -',
    'data' => $responseData,  // ✅ Always an array
  ];

  //error_log("Response: " . print_r($response, true));

  error_log("Test: ");
  error_log("Response: " . json_encode($response));


  echo json_encode($response);
} catch (PDOException $e) {
  echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

/** 🔄 Replace NULL values with a placeholder **/
function fixNull($results)
{
  foreach ($results as $key => $value) {
    foreach ($value as $k => $v) {
      if ($v === null) {
        $results[$key][$k] = 'Type translation in translate mode';
      }
    }
  }
  return $results;
}
