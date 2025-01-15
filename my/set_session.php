<?php
session_start();

// If user is not logged in, redirect to sign-in page
if ( !isset( $_SESSION[ 'user_id' ] ) ) {
  header( "Location: ../sign-in.html" );
  exit();
}

include '../db.php';

$userId = $_SESSION[ 'user_id' ];

// Clear all session variables if mode is "clear"
if ( $_POST[ 'mode' ] === 'clear' ) {
  session_unset();
  $_SESSION[ 'user_id' ] = $userId;
  exit();
}

// Set the mode
$_SESSION[ 'mode' ] = $_POST[ 'mode' ];

if ( $_SESSION[ 'mode' ] === 'new' ) {
  // Clear existing session and initialize a new session
  session_unset();
  $_SESSION[ 'user_id' ] = $userId;
  exit();
}

// If in edit mode, retrieve and return data from the database
$_SESSION[ 'card_id' ] = $_POST[ 'id' ];

try {
  // Prepare and execute query to fetch resume data
  $stmt = $pdo->prepare( "SELECT * FROM `resumes` WHERE id = :card_id AND user_id = :user_id" );
  $stmt->execute( [
    'card_id' => $_SESSION[ 'card_id' ],
    'user_id' => $userId,
  ] );

  $resumes = $stmt->fetch( PDO::FETCH_ASSOC );

  if ( !$resumes ) {
    throw new Exception( "Resume not found or access denied." );
  }

  // Populate session variables
  $_SESSION[ 'job_position' ] = $resumes[ 'job_position' ];
  $_SESSION[ 'grad_color_1' ] = $resumes[ 'grad_color_1' ];
  $_SESSION[ 'grad_color_2' ] = $resumes[ 'grad_color_2' ];
  $_SESSION[ 'background_color' ] = $resumes[ 'background_color' ];
  $_SESSION[ 'bubble_color' ] = $resumes[ 'bubble_color' ];
  $_SESSION[ 'hard_skills' ] = $resumes[ 'hard_skills' ];
  $_SESSION[ 'soft_skills' ] = $resumes[ 'soft_skills' ];
  $_SESSION[ 'languages' ] = $resumes[ 'languages' ];
  $_SESSION[ 'licenses' ] = $resumes[ 'licenses' ];
  $_SESSION[ 'education' ] = $resumes[ 'education' ];
  $_SESSION[ 'work_experience' ] = $resumes[ 'work_experience' ];
  $_SESSION[ 'courses' ] = $resumes[ 'courses' ];
  $_SESSION[ 'employers' ] = $resumes[ 'employers' ];

  // Return session data as JSON
  echo json_encode( $_SESSION );
} catch ( Exception $e ) {
  // Handle errors gracefully
  http_response_code( 500 );
  echo json_encode( [ 'error' => $e->getMessage() ] );
}
?>
