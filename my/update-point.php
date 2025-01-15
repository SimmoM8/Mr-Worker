<?php
session_start();

// Set the content type to JSON
header( 'Content-Type: application/json' );

// Check if the user is logged in
if ( !isset( $_SESSION[ 'user_id' ] ) ) {
  echo json_encode( [ 'status' => 'error', 'message' => 'User not logged in' ] );
  exit();
}

// Check if the request is a POST request
if ( $_SERVER[ 'REQUEST_METHOD' ] === 'POST' ) {
  // Get parameters from POST request
  $pointId = filter_input( INPUT_POST, 'pointId', FILTER_VALIDATE_INT );
  $call = filter_input( INPUT_POST, 'call', FILTER_SANITIZE_FULL_SPECIAL_CHARS );
  $editedPoint = filter_input( INPUT_POST, 'editedPoint', FILTER_SANITIZE_FULL_SPECIAL_CHARS );
  $percentage = filter_input( INPUT_POST, 'percentage', FILTER_VALIDATE_INT );
  $license = filter_input( INPUT_POST, 'license', FILTER_SANITIZE_FULL_SPECIAL_CHARS );
  $description = filter_input( INPUT_POST, 'description', FILTER_SANITIZE_FULL_SPECIAL_CHARS );

  require '../db.php'; // Include the PDO connection

  try {
    if ( $call === 'languages' ) {
      // Update language percentage
      if ( $percentage === null ) {
        echo json_encode( [ 'status' => 'error', 'message' => 'Percentage value missing' ] );
        exit();
      }

      $stmt = $pdo->prepare( "UPDATE `languages` SET `percentage` = :percentage WHERE `id` = :id" );
      $stmt->execute( [ ':percentage' => $percentage, ':id' => $pointId ] );
    } elseif ( $call === 'licenses' ) {
      // Update license and description
      if ( $license === null || $description === null ) {
        echo json_encode( [ 'status' => 'error', 'message' => 'Field value missing' ] );
        exit();
      }

      $stmt = $pdo->prepare( "UPDATE `licenses` SET `license` = :license, `description` = :description WHERE `id` = :id" );
      $stmt->execute( [
        ':license' => $license,
        ':description' => $description,
        ':id' => $pointId
      ] );
    } else {
      // Handle work_experience and education points
      if ( $editedPoint === null ) {
        echo json_encode( [ 'status' => 'error', 'message' => 'Skill value missing' ] );
        exit();
      }
      error_log( 'call: ' . $call );
      $stmt = $pdo->prepare( "UPDATE `$call` SET `skill` = :skill WHERE `id` = :id" );
      $stmt->execute( [ ':skill' => $editedPoint, ':id' => $pointId ] );
    }

    // If the query is successful
    if ( $stmt->rowCount() > 0 ) {
      echo json_encode( [ 'status' => 'success' ] );
    } else {
      echo json_encode( [ 'status' => 'error', 'message' => 'No changes made.' ] );
    }
  } catch ( PDOException $e ) {
    echo json_encode( [ 'status' => 'error', 'message' => 'Database error: ' . $e->getMessage() ] );
  }
} else {
  echo json_encode( [ 'status' => 'error', 'message' => 'Invalid request method' ] );
}
?>
