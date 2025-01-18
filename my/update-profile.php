<?php
session_start();
header( 'Content-Type: application/json' );

// Check if user is logged in
if ( !isset( $_SESSION[ 'user_id' ] ) ) {
  echo json_encode( [ 'success' => false, 'error' => 'Unauthorized access.' ] );
  exit;
}

// Get the user ID from session
$user_id = $_SESSION[ 'user_id' ];

require '../db.php';

// Validate and sanitize input
$first_name = filter_input( INPUT_POST, 'first_name', FILTER_SANITIZE_FULL_SPECIAL_CHARS );
$last_name = filter_input( INPUT_POST, 'last_name', FILTER_SANITIZE_FULL_SPECIAL_CHARS );
$country_code = filter_input( INPUT_POST, 'country_code', FILTER_SANITIZE_FULL_SPECIAL_CHARS );
$mobile = filter_input( INPUT_POST, 'mobile', FILTER_SANITIZE_FULL_SPECIAL_CHARS );
$street = filter_input( INPUT_POST, 'street', FILTER_SANITIZE_FULL_SPECIAL_CHARS );
$town = filter_input( INPUT_POST, 'town', FILTER_SANITIZE_FULL_SPECIAL_CHARS );
$post_code = filter_input( INPUT_POST, 'post_code', FILTER_SANITIZE_FULL_SPECIAL_CHARS );
$country = filter_input( INPUT_POST, 'country', FILTER_SANITIZE_FULL_SPECIAL_CHARS );
$about_me = filter_input( INPUT_POST, 'about_me', FILTER_SANITIZE_FULL_SPECIAL_CHARS );

// Check for required fields
if ( !$first_name || !$last_name || !$mobile || !$street || !$town || !$post_code || !$country ) {
  echo json_encode( [ 'success' => false, 'error' => 'All fields are required.' ] );
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
                country = :country, 
                about_me = :about_me 
            WHERE id = :user_id";

  $stmt = $pdo->prepare( $sql );

  // Bind parameters and execute the query
  $stmt->execute( [
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
  ] );

  if ( $stmt->rowCount() > 0 ) {
    echo json_encode( [ 'success' => true, 'message' => 'Profile updated successfully.' ] );
  } else {
    echo json_encode( [ 'success' => false, 'error' => 'No changes were made to the profile.' ] );
  }
} catch ( PDOException $e ) {
  echo json_encode( [ 'success' => false, 'error' => 'Database error: ' . $e->getMessage() ] );
}
?>
