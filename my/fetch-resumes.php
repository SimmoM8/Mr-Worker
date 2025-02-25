<?php
session_start();

// If user is not logged in, redirect to sign-in page
if (!isset($_SESSION['user_id'])) {
  header("Location: ../sign-in.html");
  exit();
}

$selectedLanguage = $_SESSION['selected_language'] ?? 'lang_1'; // Default to lang_1 if not set
$translateMode = $_GET['translate_mode'];

error_log("Get: " . print_r($_GET, true));

error_log("Translate mode: " . $translateMode);

require '../db.php';

try {
  $ajax_output = ''; // Initialize variable

  // Include the "add new resume" template
  ob_start();
  include('template-card-add.html');
  $ajax_output .= ob_get_clean();

  // Fetch resumes for the logged-in user
  $stmt = $pdo->prepare("SELECT * FROM resumes WHERE user_id = :user_id ORDER BY last_updated DESC");
  $stmt->execute(['user_id' => $_SESSION['user_id']]);

  if ($stmt->rowCount() > 0) {
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      // Extract data for the template
      $id = htmlspecialchars($row['id']);
      $name = htmlspecialchars($row['job_position_' . $selectedLanguage]);
      $name_ref = htmlspecialchars($row['job_position_lang_1']);
      $last_updated = htmlspecialchars($row['last_updated']);
      $color1 = $row['grad_color_1'];
      $color2 = $row['grad_color_2'];

      // Use the template file to render the card
      ob_start();
      include 'template-card-resume.php';
      $ajax_output .= ob_get_clean();
    }
  } else {
    $ajax_output .= "<p>No resumes found.</p>";
  }
  echo $ajax_output;
} catch (Exception $e) {
  error_log($e->getMessage());
  echo "<p>An error occurred while fetching resumes.</p>";
}

// Calculate the time difference
function timeAgo($datetime)
{
  $now = new DateTime();
  $lastUpdated = new DateTime($datetime);
  $diff = $now->diff($lastUpdated);

  if ($diff->y > 0) {
    return $diff->y . " year" . ($diff->y > 1 ? "s" : "") . " ago";
  } elseif ($diff->m > 0) {
    return $diff->m . " month" . ($diff->m > 1 ? "s" : "") . " ago";
  } elseif ($diff->d > 0) {
    return $diff->d . " day" . ($diff->d > 1 ? "s" : "") . " ago";
  } elseif ($diff->h > 0) {
    return $diff->h . " hour" . ($diff->h > 1 ? "s" : "") . " ago";
  } elseif ($diff->i > 0) {
    return $diff->i . " minute" . ($diff->i > 1 ? "s" : "") . " ago";
  } else {
    return "just now";
  }
}
