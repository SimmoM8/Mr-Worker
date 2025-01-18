<?php
session_start();

// If user is not logged in, redirect to sign-in page
if ( !isset( $_SESSION[ 'user_id' ] ) ) {
  header( "Location: ../sign-in.html" );
  exit();
}

include '../db.php';

try {
  $userId = $_SESSION[ 'user_id' ];
  $resumeId = $_SESSION[ 'card_id' ];

  // Prepare an associative array for update fields
  $fields = [
    'job_position' => $_SESSION[ 'job_position' ],
    'grad_color_1' => $_SESSION[ 'grad_color_1' ],
    'grad_color_2' => $_SESSION[ 'grad_color_2' ],
    'background_color' => $_SESSION[ 'background_color' ],
    'bubble_color' => $_SESSION[ 'bubble_color' ],
    'hard_skills' => $_SESSION[ 'hard_skills' ],
    'soft_skills' => $_SESSION[ 'soft_skills' ],
    'languages' => $_SESSION[ 'languages' ],
    'licenses' => $_SESSION[ 'licenses' ],
    'employers' => $_SESSION[ 'employers' ],
    'work_experience' => $_SESSION[ 'work_experience' ],
    'courses' => $_SESSION[ 'courses' ],
    'education' => $_SESSION[ 'education' ]
  ];

  // Generate dynamic query with placeholders
  $setClause = [];
  foreach ( $fields as $key => $value ) {
    $setClause[] = "`$key` = :$key";
  }
  $setClauseString = implode( ', ', $setClause );

  // Prepare the SQL statement
  $sql = "UPDATE `resumes` SET $setClauseString WHERE `id` = :resumeId AND `user_id` = :userId";
  $stmt = $pdo->prepare( $sql );

  // Bind parameters dynamically
  foreach ( $fields as $key => $value ) {
    $stmt->bindValue( ":$key", $value );
  }
  $stmt->bindValue( ':resumeId', $resumeId, PDO::PARAM_INT );
  $stmt->bindValue( ':userId', $userId, PDO::PARAM_INT );

  // Execute the query
  $stmt->execute();

  if ( $stmt->rowCount() > 0 ) {
    echo "Updated successfully<br>";
  } else {
    echo "No changes made to the resume<br>";
  }
} catch ( PDOException $e ) {
  echo "Error: " . $e->getMessage();
}
?>