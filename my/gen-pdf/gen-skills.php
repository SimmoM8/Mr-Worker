<?php
// Create heading
$currentY = $pdf->GetY();
drawHeader( $pdf, $side_bar[ 'x' ] + $side_bar[ 'm_left' ], $currentY, $side_bar[ 'inner_width' ], $headings[ $language ][ 1 ], $side_bar[ 'm_left' ], $style );
$currentY = $pdf->GetY();

$pdf->SetFont( $style[ 'font' ], '', 8 );


$skills = array(); // Define skills array to be outputed
$skillWidths = array(); // Define skill widths array
$skillsRow = array(); // Define skill rows array
$sel_hs = explode( ',', $resumes[ 'hard_skills' ] ); // The id's of the hard skills selected for this resume
$sel_ss = explode( ',', $resumes[ 'soft_skills' ] ); // The id's of the soft skills selected for this resume*/

// Fetch all hard skills from the database
$stmt = $pdo->prepare("SELECT id, skill FROM `hard_skills` WHERE user_id = :user_id");
$stmt->execute(['user_id' => $user_id]);
$all_hskills = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Add selected hard skills to the skills array
foreach ($all_hskills as $hskill) {
    if (in_array($hskill['id'], $sel_hs)) {
        $skills[] = $hskill['skill'];
    }
}

// Fetch all soft skills from the database
$stmt = $pdo->prepare("SELECT id, skill FROM `soft_skills` WHERE user_id = :user_id");
$stmt->execute(['user_id' => $user_id]);
$all_sskills = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Add selected soft skills to the skills array
foreach ($all_sskills as $sskill) {
    if (in_array($sskill['id'], $sel_ss)) {
        $skills[] = $sskill['skill'];
    }
}

foreach ( $skills as $key => $s ) {
  $skillWidths[ $key ][ 'data' ] = $s;
  $skillWidths[ $key ][ 'width' ] = getDynamicWidth( $pdf, $s, $side_bar[ 'inner_width' ] );
}

function sortByWidth( $a, $b ) {
  return $b[ 'width' ] - $a[ 'width' ];
}
// Sort the array based on 'width'
if ( $skillWidths ) {
  usort( $skillWidths, 'sortByWidth' );
}

foreach ( $skillWidths as $s ) {
  $width = $s[ 'width' ] + 2 * $style[ 'skill' ][ 'padding' ];
  $room = $side_bar[ 'inner_width' ] - $width - $style[ 'skill' ][ 'gap' ];
  $filled = false;
  if ( !empty( $skillsRow ) ) {
    foreach ( $skillsRow as $key => $r ) {
      if ( $width < $r[ 'room' ] ) {
        $skillsRow[ $key ][ 0 ][] = array( 'data' => $s[ 'data' ], 'width' => $width );
        $skillsRow[ $key ][ 'room' ] -= $width;
        $filled = true;
        break;
      }
    }
    if ( !$filled ) {
      $skillsRow[] = array( array( array( 'data' => $s[ 'data' ], 'width' => $width ) ), 'room' => $room );
    }
  } else {
    $skillsRow[] = array( array( array( 'data' => $s[ 'data' ], 'width' => $width ) ), 'room' => $room );
  }
}
if ( $skillWidths ) {
  shuffle( $skillsRow ); // Randomise the list of skill rows
}

// Sort the array based on 'room' so that while keeping it shuffled
if ( $skillsRow ) {
  usort( $skillsRow, function ( $a, $b ) {
    if ( $a[ 'room' ] > 30 && $b[ 'room' ] <= 30 ) {
      return 1; // Move $a to the end
    } elseif ( $a[ 'room' ] <= 5 && $b[ 'room' ] > 5 ) {
      return -1; // Move $b to the end
    } else {
      return 0; // Preserve order for other cases
    }
  } );
}

$side_bar[ 'skills' ] = $skillsRow;

sbSkills( $pdf, $side_bar, $currentY, $side_bar[ 'inner_width' ], $style );
$currentY = $pdf->GetY();

// Function to calculate the height required for each skill entry
function calculateSkillHeight( $pdf, $width, $data, $font ) {
  $pdf->SetFont( $font, '', 8 );
  $totalHeight = $pdf->getStringHeight( $width, $data );
  return $totalHeight;
}

// Function to calculate the dynamic width of the string with word wrapping
function getDynamicWidth( $pdf, $text, $maxWidth ) {
  $words = explode( ' ', $text );
  $lines = array();
  $currentLine = '';
  $currentWidth = 0;

  foreach ( $words as $word ) {
    $wordWidth = $pdf->GetStringWidth( $word );
    if ( $currentWidth + $wordWidth <= $maxWidth ) {
      // Word fits in the current line
      $currentLine .= $word . ' ';
      $currentWidth += $wordWidth + $pdf->GetStringWidth( ' ' );
    } else {
      // Word exceeds the current line, start a new line
      $lines[] = rtrim( $currentLine );
      $currentLine = $word . ' ';
      $currentWidth = $wordWidth + $pdf->GetStringWidth( ' ' );
    }
  }

  // Add the last line
  $lines[] = rtrim( $currentLine );

  // Calculate the maximum width among the lines
  $dynamicWidth = 0;
  foreach ( $lines as $line ) {
    $lineWidth = $pdf->GetStringWidth( $line );
    if ( $lineWidth > $dynamicWidth ) {
      $dynamicWidth = $lineWidth;
    }
  }

  return $dynamicWidth;
}

function sbSkills( $pdf, $side_bar, $y, $maxWidth, $style ) {
  foreach ( $side_bar[ 'skills' ] as $s ) {
    drawSkillRow( $pdf, $side_bar[ 'x' ] + $side_bar[ 'm_left' ], $y, $maxWidth, $s[ 0 ], $style );
    $y = $pdf->GetY();
  }
}

// Create skill bubble
function drawSkill( $pdf, $x, $y, $width, $height, $data, $style ) {
  // Set font properties
  $pdf->SetFont( $style[ 'font' ], '', 8 );
  // Draw the rounded rectangle with the specified color
  $pdf->SetFillColor( $style[ 'skill' ][ 'color' ][ 'r' ], $style[ 'skill' ][ 'color' ][ 'g' ], $style[ 'skill' ][ 'color' ][ 'b' ] );
  $pdf->RoundedRect( $x, $y, $width, $height, ( $height < 10 ) ? $height / 2 : 3.76, '1111', ( $style[ 'border' ] === 1 ) ? 'DF' : 'F' );

  $pdf->SetFont( $style[ 'font' ], '', 8 );
  // Print the data within the rectangle, centered vertically and horizontally
  $pdf->SetXY( $x + $style[ 'skill' ][ 'padding' ] / 2, $y + $style[ 'skill' ][ 'padding' ] );
  $pdf->MultiCell( $width, 8 + $style[ 'skill' ][ 'padding' ], $data, $style[ 'border' ], 'L', false, 0 );
}

// Output each row of the skill bubble section in the side bar
function drawSkillRow( $pdf, $x, $y, $maxWidth, $skills, $style ) {
  $nextX = $x;
  foreach ( $skills as $s ) {
    $pdf->SetFont( $style[ 'font' ], '', 8 );
    $width = $s[ 'width' ];
    $height = $pdf->getStringHeight( min( $width, $maxWidth ), $s[ 'data' ] ) + 2 * $style[ 'skill' ][ 'padding' ];
    drawSkill( $pdf, $nextX, $y, $width, $height, $s[ 'data' ], $style );
    $nextX += $width + $style[ 'skill' ][ 'gap' ]; // Set X coord for next row including a gap
  }
  $pdf->SetY( $y + $height + $style[ 'skill' ][ 'gap' ] ); // Set Y coord for next row including a gap

}
?>