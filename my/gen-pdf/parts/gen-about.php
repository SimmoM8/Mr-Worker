<?php
// Create heading
$currentY = $pdf->GetY();
drawHeader($pdf, $content['x'] + $content['margin'][3], $currentY, $content['inner_width'], $translatedHeadings['about_me'], 0, $style);
$currentY = $pdf->GetY();

$pdf->setX($content['x'] + $content['margin'][3]);

// Write the about me
$pdf->MultiCell($content['inner_width'], '', $data['user']['about_me'][$selected_language], $border, 'L');

$currentY = $pdf->GetY();
