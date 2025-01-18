<?php
// Create heading
$currentY = $pdf->GetY();
drawHeader( $pdf, $content[ 'x' ] + $content[ 'margin' ][ 3 ], $currentY, $content[ 'inner_width' ], $headings[ $language ][ 4 ], 0, $style );
$currentY = $pdf->GetY();

$pdf->setX( $content[ 'x' ] + $content[ 'margin' ][ 3 ] );

// Write the about me
$pdf->MultiCell( $content[ 'inner_width' ], '', $about_me, $border, 'L' );

$currentY = $pdf->GetY();
?>