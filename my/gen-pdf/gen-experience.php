<?php
// Create heading
drawHeader( $pdf, $content[ 'x' ] + $content[ 'margin' ][ 3 ], $currentY, $content[ 'inner_width' ], $headings[ $language ][ 5 ], 0, $style );
$currentY = $pdf->GetY();

$we = array(); // Define work experience (dot points) array to be outputed underneath each employer.
$sel_we = explode( ',', $resumes[ 'work_experience' ] ); // The id's of the dot points selected for this resume
$employer_title_h = 12; // Includes margin below title -> 9 + margin
$requiredHeight = $employer_title_h;

// Fetch all work experiences (dot points) from database
$stmt = $pdo->prepare( "SELECT * FROM `work_experience` WHERE user_id = :user_id" );
$stmt->execute( [ 'user_id' => $user_id ] );
$all_we = $stmt->fetchAll( PDO::FETCH_ASSOC );

foreach ( $all_we as $we_item ) {
  if ( in_array( $we_item[ 'id' ], $sel_we ) ) {
    $we[] = $we_item;
  }
}

$employers = [];
$sel_employers = explode( ',', $resumes[ 'employers' ] ); // Selected employer IDs for this resume

// Fetch employers from database
$stmt = $pdo->prepare( "SELECT * FROM `employers` WHERE user_id = :user_id ORDER BY `order` ASC" );
$stmt->execute( [ 'user_id' => $user_id ] );
$all_employers = $stmt->fetchAll( PDO::FETCH_ASSOC );

foreach ( $all_employers as $employer ) {
  if ( in_array( $employer[ 'id' ], $sel_employers ) ) {
    $employers[] = $employer;
  }
}

// Populate work experience from database
foreach ( $employers as $employer ) {
  $employer_title_h = 12; // Includes margin below title -> 9 + margin
  $requiredHeight = $employer_title_h;

  // Iterate over the dot points within the current employer to calculate the total height required
  foreach ( $we as $e ) {
    if ( $e[ 'employerId' ] === $employer[ 'id' ] ) {
      $requiredHeight += calculateSkillHeight( $pdf, $content[ 'inner_width' ], $e[ 'skill_lang_1' ], $style[ 'font' ] );
    }
  }

  // Calculate the remaining space on the current page
  $remainingSpace = $pageHeight - $currentY - $style[ 'bottom_margin' ];

  // Check if there is enough space on the current page
  if ( $requiredHeight > $remainingSpace ) {
    newPage( $pdf, $side_bar, $content, $profile_info, $headings, $language, $style, $profile_pic_path, $img_scale, $img_pos_x, $img_pos_y );
  }
  $currentY = $pdf->GetY();

  $pdf->setY( $currentY + $employer_title_h ); // Set y coord for the skills list including margin

  // Iterate over the fetched rows within the nested loop
  foreach ( $we as $e ) {
    if ( $e[ 'employerId' ] === $employer[ 'id' ] ) {
      genPoint( $pdf, $content[ 'x' ] + $content[ 'margin' ][ 3 ], $content[ 'inner_width' ], $e[ 'skill_lang_1' ], $style );
    }
  }

  $next_employer = $pdf->GetY() + 4; // Add bottom margin and set y coord for next employer

  // Output employer information (Work experience heading) and dates
  genExp( $pdf, $content[ 'x' ] + $content[ 'margin' ][ 3 ], $currentY, $content[ 'inner_width' ], $employer[ 'job_position_lang_1' ], $employer[ 'employer' ], $employer[ 'area' ] . ", " . $employer[ 'country' ], $employer[ 'start_date' ], $employer[ 'end_date' ], $style );
  $pdf->setY( $next_employer );
  $currentY = $pdf->GetY();
}

?>