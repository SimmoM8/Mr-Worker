<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
  echo json_encode(['error' => 'User not logged in']);
  exit();
}

include '../db.php'; // Include database connection file

$userId = $_SESSION['user_id'];
$resumeData = [
  'job_position' => isset($_SESSION['job_position']) ? $_SESSION['job_position'] : 'Untitled',
  'grad_color_1' => isset($_SESSION['grad_color_1']) ? $_SESSION['grad_color_1'] : '',
  'grad_color_2' => isset($_SESSION['grad_color_2']) ? $_SESSION['grad_color_2'] : '',
  'background_color' => isset($_SESSION['background_color']) ? $_SESSION['background_color'] : '',
  'bubble_color' => isset($_SESSION['bubble_color']) ? $_SESSION['bubble_color'] : '',
  'hard_skills' => isset($_SESSION['hard_skills']) ? $_SESSION['hard_skills'] : '',
  'soft_skills' => isset($_SESSION['soft_skills']) ? $_SESSION['soft_skills'] : '',
  'languages' => isset($_SESSION['languages']) ? $_SESSION['languages'] : '',
  'licenses' => isset($_SESSION['licenses']) ? $_SESSION['licenses'] : '',
  'employers' => isset($_SESSION['employers']) ? $_SESSION['employers'] : '',
  'work_experience' => isset($_SESSION['work_experience']) ? $_SESSION['work_experience'] : '',
  'courses' => isset($_SESSION['courses']) ? $_SESSION['courses'] : '',
  'education' => isset($_SESSION['education']) ? $_SESSION['education'] : ''
];

try {
  // Prepare the SQL statement
  $stmt = $pdo->prepare(
    "INSERT INTO resumes 
        (user_id, job_position_lang_1, grad_color_1, grad_color_2, background_color, bubble_color, hard_skills, soft_skills, languages, licenses, employers, work_experience, courses, education, last_updated) 
        VALUES 
        (:user_id, :job_position, :grad_color_1, :grad_color_2, :background_color, :bubble_color, :hard_skills, :soft_skills, :languages, :licenses, :employers, :work_experience, :courses, :education, NOW())"
  );

  // Execute the statement with data
  $stmt->execute([
    ':user_id' => $userId,
    ':job_position' => $resumeData['job_position'],
    ':grad_color_1' => $resumeData['grad_color_1'],
    ':grad_color_2' => $resumeData['grad_color_2'],
    ':background_color' => $resumeData['background_color'],
    ':bubble_color' => $resumeData['bubble_color'],
    ':hard_skills' => $resumeData['hard_skills'],
    ':soft_skills' => $resumeData['soft_skills'],
    ':languages' => $resumeData['languages'],
    ':licenses' => $resumeData['licenses'],
    ':employers' => $resumeData['employers'],
    ':work_experience' => $resumeData['work_experience'],
    ':courses' => $resumeData['courses'],
    ':education' => $resumeData['education']
  ]);

  header('Content-Type: application/json');
  // Append the created resume to the grid
  $id = $pdo->lastInsertId();
  $name = $resumeData['job_position'];

  ob_start();
  include 'template-card-resume.php'; // Render the new card
  $cardHTML = ob_get_clean();

  echo json_encode(['status' => 'success', 'card' => $cardHTML]);
  exit();
} catch (Exception $e) {
  error_log($e->getMessage()); // Log the error
  echo json_encode(['error' => 'Failed to create resume: ' . $e->getMessage()]);
}
