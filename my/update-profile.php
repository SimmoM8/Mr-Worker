<?php
session_start();
header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
  echo json_encode(['success' => false, 'error' => 'Unauthorized access.']);
  exit;
}

// Get the user ID from session
$user_id = $_SESSION['user_id'];

$selectedLanguage = $_SESSION['selected_language'];

require '../db.php';

// Validate and sanitize input
$first_name = trim(strip_tags($_POST['first_name']));
$last_name = trim(strip_tags($_POST['last_name']));
$country_code = trim(strip_tags($_POST['country_code']));
$mobile = trim(strip_tags($_POST['mobile']));
$street = trim(strip_tags($_POST['street']));
$town = trim(strip_tags($_POST['town']));
$post_code = trim(strip_tags($_POST['post_code']));
$country = trim(strip_tags($_POST['country']));
$about_me = trim(strip_tags($_POST['about_me']));

// Check for required fields
if (!$first_name || !$last_name || !$mobile || !$street || !$town || !$post_code || !$country) {
  echo json_encode(['success' => false, 'error' => 'All fields are required.']);
  exit;
}

try {
  // Prepare the SQL query to update the user's profile
  $sql = "UPDATE users 
            SET first_name = :first_name, 
                last_name = :last_name, 
                country_code = :country_code, 
                mobile = :mobile, 
                street = :street, 
                town = :town, 
                post_code = :post_code, 
                country_$selectedLanguage = :country, 
                about_me_$selectedLanguage = :about_me 
            WHERE id = :user_id";

  $stmt = $pdo->prepare($sql);

  // Bind parameters and execute the query
  $stmt->execute([
    ':first_name' => $first_name,
    ':last_name' => $last_name,
    ':country_code' => $country_code,
    ':mobile' => $mobile,
    ':street' => $street,
    ':town' => $town,
    ':post_code' => $post_code,
    ':country' => $country,
    ':about_me' => $about_me,
    ':user_id' => $user_id
  ]);

  if ($stmt->rowCount() > 0) {
    echo json_encode(['success' => true, 'message' => 'Profile updated successfully.']);
  } else {
    echo json_encode(['success' => false, 'error' => 'No changes were made to the profile.']);
  }
} catch (PDOException $e) {
  echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
