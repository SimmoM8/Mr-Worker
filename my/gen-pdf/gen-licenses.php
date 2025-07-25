<?php
// Create heading
drawHeader( $pdf, $side_bar[ 'x' ] + $side_bar[ 'm_left' ], $currentY, $side_bar[ 'inner_width' ], $headings[ $language ][ 3 ], $side_bar[ 'm_left' ], $style );
$currentY = $pdf->GetY();

$licenses = array();
$sel_licenses = explode( ',', $resumes[ 'licenses' ] ); // The id's of the licenses selected for this resume

// Fetch all licenses from the database
$stmt = $pdo->prepare( "SELECT id, license_lang_1, description_lang_1 FROM `licenses` WHERE user_id = :user_id" );
$stmt->execute( [ 'user_id' => $user_id ] );
$all_licenses = $stmt->fetchAll( PDO::FETCH_ASSOC );

// Add selected licenses to the `$licenses` array
foreach ( $all_licenses as $row ) {
  if ( in_array( $row[ 'id' ], $sel_licenses ) ) {
    $licenses[] = [
      'type' => $row[ 'license_lang_1' ],
      'license' => $row[ 'description_lang_1' ]
    ];
  }
}

$side_bar[ 'licenses' ] = $licenses;

sblicenses( $pdf, $currentY, $side_bar, $style );

// Create license bar
function drawlicense( $pdf, $x, $y, $license_type, $data, $maxWidth, $style ) {
  // Heading
  $pdf->SetX( $x );
  $pdf->SetFont( $style[ 'font' ], 'B', 8 );
  $pdf->Cell( $maxWidth, '', $license_type, $style[ 'border' ], 1, 'L' );
  // Text
  $pdf->SetX( $x );
  $pdf->SetFont( $style[ 'font' ], '', 8 );
  $pdf->Cell( $maxWidth, '', $data, $style[ 'border' ], 1, 'L' );
  $pdf->SetY( $pdf->GetY() + 5 );
}

function sblicenses( $pdf, $y, $side_bar, $style ) {
  // Populate languages with bars from database
  foreach ( $side_bar[ 'licenses' ] as $row ) {
    drawlicense( $pdf, $side_bar[ 'x' ] + $side_bar[ 'm_left' ], $y, $row[ 'type' ], $row[ 'license' ], $side_bar[ 'inner_width' ], $style );
  }
}
?>