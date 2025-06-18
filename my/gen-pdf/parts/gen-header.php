<?php

// Output the name cell
$nameHeight = 0;
$name_y = 24.8;
$pdf->SetXY(0, $name_y - 8);
$pdf->SetFont('avenir_heavy', '', 28);
$pdf->Cell($pageWidth, $nameHeight, $name, $border, 1, 'C', 0, '', 0, false);

// Set current Y coord and create margin below the name
$pdf->setY($pdf->GetY() + 4.65); // Add margin
$currentY = $pdf->GetY();

// Output the title
genTitle($pdf, 0, $currentY, $pageWidth, $title, false, $style);

// Output the profile pic
$profile_pic_width = 28;
drawProfile($pdf, 21, $name_y - $profile_pic_width / 2, $profile_pic_width, 1.41, $profile_pic_path, $style, $img_scale, $img_pos_x, $img_pos_y);

$pdf->setTextColor(0, 0, 0); // Reset the text color to black.


$title_end = $pdf->GetY();

// Create profile image with gradient filled border
function drawProfile($pdf, $x, $y, $width, $thickness, $imagePath, $style, $scale, $posXRatio, $posYRatio)
{
  $defaultImagePath = __DIR__ . '/../uploads/profile_default.jpeg'; // Ensure default fallback is JPEG


  // Validate the image path; fallback to default if invalid
  if (!file_exists($imagePath) || !$imageInfo = getimagesize($imagePath)) {
    $imagePath = $defaultImagePath;
    $imageInfo = getimagesize($defaultImagePath);
  }

  // Get image dimensions
  list($imgWidth, $imgHeight) = $imageInfo;

  // Calculate aspect ratio
  $aspectRatio = ($imgWidth > 0 && $imgHeight > 0) ? $imgWidth / $imgHeight : 1;

  // Determine dimensions to scale the image
  if ($aspectRatio > 1) {
    // Wider than tall
    $newWidth = $width;
    $newHeight = $width / $aspectRatio;
  } else {
    // Taller than wide
    $newHeight = $width;
    $newWidth = $width * $aspectRatio;
  }

  // Ensure the image fills the circle
  $ms = max($width / $newWidth, $width / $newHeight);
  // Apply scaling
  $newWidth *= $ms * $scale;
  $newHeight *= $ms * $scale;

  // Center the image in the circle
  $posX = ($x + ($width - $newWidth) / 2) + $width * $posXRatio;
  $posY = ($y + ($width - $newHeight) / 2) + $width * $posYRatio;

  $r = $width / 2;

  // Draw the profile image with a gradient border
  $pdf->StartTransform();
  // Draw gradient-filled border circle
  $pdf->Circle($x + $r, $y + $width / 2, $r + $thickness, 0, 360, 'CNZ');
  $pdf->LinearGradient($x - $thickness, $y - $thickness, $width + $thickness * 2, $width + $thickness * 2, $style['color1'], $style['color2']);
  // Draw the clipped circular image
  $pdf->Circle($x + $r, $y + $r, $r, 0, 360, 'CNZ');
  $pdf->Image($imagePath, $posX, $posY, $newWidth, $newHeight);
  $pdf->StopTransform();
}

function genTitle($pdf, $x, $y, $width, $title, $rounded, $style)
{
  // Set font and font color for title cell
  $pdf->SetFont($style['font'], '', 10);
  $pdf->SetTextColor(255, 255, 255); // White color for the font


  // Output the title
  $titleHeight = 12;
  $r = $titleHeight / 2;
  $pdf->StartTransform();
  if ($rounded) {
    // Draw the rectangle with rounded edges by creating a clipping mask on the linear gradient
    $pdf->RoundedRect($x, $y, $width, $titleHeight, $r, '1100', 'CNZ');
  }
  $pdf->LinearGradient($x, $y, $width, $titleHeight, $style['color1'], $style['color2']);
  $pdf->Cell($width, $titleHeight, strtoupper($title), $style['border'], 1, 'C');

  $pdf->StopTransform();
  $pdf->setTextColor(0, 0, 0); // Reset the text color to black.
  $pdf->SetY($pdf->GetY());
}
