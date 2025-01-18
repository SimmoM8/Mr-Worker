<?php
session_start();


// If user is not logged in, redirect to sign-in page
if ( !isset( $_SESSION[ 'user_id' ] ) ) {
  header( "Location: ../sign-in.html" );
  exit();
}

//Submit eduaction to Session
if ( isset( $_POST[ 'submit-education' ] ) ) {
  $_SESSION[ 'education' ] = $_POST[ 'education' ] ? implode( ",", ( array_filter( $_POST[ 'education' ] ) ) ) : '';
  $_SESSION[ 'courses' ] = $_POST[ 'courses' ] ? implode( ",", ( array_filter( $_POST[ 'courses' ] ) ) ) : '';
  if ( $_SESSION[ 'mode' ] === 'new' ) {
    $_SESSION[ 'submited-education' ] = 'true';
    echo json_encode( array( 'currentTab' => 'education', 'nextTab' => 'finish' ) );
    //redirect( 'create-resume.php' );
  } elseif ( $_SESSION[ 'mode' ] === 'edit' ) {
    echo "Successfully updated resume.";
  }
}

//Submit work experience to Session
elseif ( isset( $_POST[ 'submit-work_experience' ] ) ) {
  $_SESSION[ 'work_experience' ] = $_POST[ 'work_experience' ] ? implode( ",", ( array_filter( $_POST[ 'work_experience' ] ) ) ) : '';
  $_SESSION[ 'employers' ] = $_POST[ 'employers' ] ? implode( ",", ( array_filter( $_POST[ 'employers' ] ) ) ) : '';
  if ( $_SESSION[ 'mode' ] === 'new' ) {
    $_SESSION[ 'submited-work_experience' ] = 'true';
    echo json_encode( array( 'currentTab' => 'work_experience', 'nextTab' => 'education' ) );
  } elseif ( $_SESSION[ 'mode' ] === 'edit' ) {
    echo "Successfully updated resume.";
  }
}

//Submit skills to Session
elseif ( isset( $_POST[ 'submit-skills' ] ) ) {
  // Using array filter to select only non empty keys
    $_SESSION[ 'hard_skills' ] = $_POST[ 'hard_skills' ] ? implode( ",", ( array_filter( $_POST[ 'hard_skills' ] ) ) ) : '';
    $_SESSION[ 'soft_skills' ] = $_POST[ 'soft_skills' ] ? implode( ",", ( array_filter( $_POST[ 'soft_skills' ] ) ) ) : '';
    $_SESSION[ 'languages' ] = $_POST[ 'languages' ] ? implode( ",", ( array_filter( $_POST[ 'languages' ] ) ) ) : '';
    $_SESSION[ 'licenses' ] = $_POST[ 'licenses' ] ? implode( ",", ( array_filter( $_POST[ 'licenses' ] ) ) ) : '';
	
  if ( $_SESSION[ 'mode' ] === 'new' ) {
    $_SESSION[ 'submited-skills' ] = 'true';
    echo json_encode( array( 'currentTab' => 'skills', 'nextTab' => 'work_experience' ) );
  } elseif ( $_SESSION[ 'mode' ] === 'edit' ) {
    echo "Successfully updated resume.";
  }
}

//Submit details to Session
elseif ( isset( $_POST[ 'submit-details' ] ) ) {
  $_SESSION[ 'job_position' ] = $_POST[ 'job_position' ];
  $_SESSION[ 'grad_color_1' ] = $_POST[ 'grad_color_1_hidden' ];
  $_SESSION[ 'grad_color_2' ] = $_POST[ 'grad_color_2_hidden' ];
  $_SESSION[ 'background_color' ] = $_POST[ 'background_color_hidden' ];
  $_SESSION[ 'bubble_color' ] = $_POST[ 'bubble_color_hidden' ];

  if ( $_SESSION[ 'mode' ] === 'new' ) {
    $_SESSION[ 'submited-details' ] = 'true';
    echo json_encode( array( 'currentTab' => 'details', 'nextTab' => 'skills' ) );
  } elseif ( $_SESSION[ 'mode' ] === 'edit' ) {
    echo "Successfully updated resume.";
  }
}

else {
  echo 'HELP!';
}
error_log( "Updated SESSION DATA: " . print_r( $_SESSION, true ) );

function redirect( $url, $statusCode = 303 ) {
  header( 'Location: ' . $url );
  exit();
}
?>
