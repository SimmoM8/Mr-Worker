<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// If the user is not logged in, redirect to the sign-in page
if ( !isset( $_SESSION[ 'user_id' ] ) ) {
  header( "Location: ../sign-in.html" );
  exit();
}

require '../db.php'; // Include the PDO connection

$userId = $_SESSION[ 'user_id' ];
$call = filter_input( INPUT_POST, 'call', FILTER_SANITIZE_FULL_SPECIAL_CHARS );
$input = filter_input( INPUT_POST, 'input', FILTER_SANITIZE_FULL_SPECIAL_CHARS ); // Use 'skill_name' for general skills
$parentId = filter_input( INPUT_POST, 'parent_id', FILTER_SANITIZE_FULL_SPECIAL_CHARS ); // Use 'parent_id' for work experience or education
$input2 = filter_input( INPUT_POST, 'input_2', FILTER_SANITIZE_FULL_SPECIAL_CHARS ); // Use 'percentage' for languages

try {
  // Determine the table and columns for the insertion
  $table = null;
  $columns = null;
  $values = null;
  $params = [];

  switch ( $call ) {
    case "work_experience":
      $table = "work_experience";
      $columns = "`user_id`, `employerId`, `skill`";
      $values = ":user_id, :parent_id, :input";
      $params = [
        ':user_id' => $userId,
        ':parent_id' => $parentId,
        ':input' => $input,
      ];
      break;

    case "education":
      $table = "education";
      $columns = "`user_id`, `courseId`, `skill`";
      $values = ":user_id, :parent_id, :input";
      $params = [
        ':user_id' => $userId,
        ':parent_id' => $parentId,
        ':input' => $input,
      ];
      break;

    case "languages":
      $table = "languages";
      $columns = "`user_id`, `language`, `percentage`";
      $values = ":user_id, :input, :input_2";
      $params = [
        ':user_id' => $userId,
        ':input' => $input,
        ':input_2' => $input2 ?? 50, // Default percentage to 50% if not provided
      ];
      break;

    case "licenses":
      $table = "licenses";
      $columns = "`user_id`, `license`, `description`";
      $values = ":user_id, :input, :input_2";
      $params = [
        ':user_id' => $userId,
        ':input' => $input,
        ':input_2' => $input2,
      ];
      break;

    default:
      // Assume 'hard_skills' or 'soft_skills' match their table names
      $table = $call;
      $columns = "`user_id`, `skill`";
      $values = ":user_id, :input";
      $params = [
        ':user_id' => $userId,
        ':input' => $input,
      ];
      break;
  }

  if ( !$table || !$columns || !$values ) {
    echo json_encode( [ 'status' => 'error', 'message' => 'Invalid call type' ] );
    exit();
  }

  // Prepare and execute the SQL statement
  $sql = "INSERT INTO $table ($columns) VALUES ($values)";
  $stmt = $pdo->prepare( $sql );
  $stmt->execute( $params );

  // Return a JSON response with the inserted ID and skill name
  echo json_encode( [
    'status' => 'success',
    'insert_id' => $pdo->lastInsertId(),
    'skill_name' => $input,
    'percentage' => $params[ ':input_2' ] ?? null,
  ] );
} catch ( PDOException $e ) {
  echo json_encode( [ 'status' => 'error', 'message' => 'Database error: ' . $e->getMessage() ] );
}
?>
