<?php

// Create heading
$currentY = $pdf->GetY();
drawHeader($pdf, $side_bar['x'] + $side_bar['m_left'], $currentY, $side_bar['inner_width'], $translatedHeadings['contact_info'], $side_bar['m_left'], $style);
$currentY = $pdf->GetY();


// Set contact info
$contact_info = array(
  'number' => array(
    'data' => $mobile,
    'svg' => '../images/i_mobile.svg'
  ),
  'address' => array(
    'data' => $address,
    'svg' => '../images/i_home.svg'
  ),
  'email' => array(
    'data' => $email,
    'svg' => '../images/i_letter.svg'
  )
);

$side_bar['contact_info'] = $contact_info;

sbInfo($pdf, $currentY, $side_bar, $style);
$currentY = $pdf->GetY();


// Draw circle icon with gradient fill
function drawIcon($pdf, $x, $y, $w, $h, $icon_w, $data, $iconPath, $style)
{
  $iy = $y + ($h - $icon_w) / 2; // Vertically centre icon with cell
  $r = $icon_w / 2;

  // Draw the rectangle with rounded edges by creating a clipping mask on the linear gradient
  $pdf->StartTransform();
  // Draw the circle
  $pdf->Circle($x + $r, $iy + $r, $r, 0, 360, 'CNZ');

  // Set the gradient fill colors
  $pdf->LinearGradient($x, $iy, $icon_w, $icon_w, $style['color1'], $style['color2']);
  // Get the SVG icon content
  $iconContent = file_get_contents($iconPath);
  // Embed the SVG icon in the PDF
  $pdf->ImageSVG('@' . $iconContent, $x, $iy, $icon_w, $icon_w, '', '', '', 0, true);
  $pdf->StopTransform();

  // Create text cell
  $pdf->SetXY($x + $icon_w, $y);
  $pdf->SetFont($style['font'], '', 8);
  $pdf->MultiCell($w - $icon_w + 100, $h, $data, $style['border'], 'L', false, 1, '', '', true, 0, 0, false, 0, 'M', 'true');
}

function sbInfo($pdf, $y, $side_bar, $style)
{
  $pdf->SetFont($style['font'], '', 8); // Set font
  // Generate each line of contact info
  $currentY = $y;
  foreach ($side_bar['contact_info'] as $a) {
    drawIcon($pdf, $side_bar['x'] + $side_bar['m_left'], $currentY, $side_bar['inner_width'], $side_bar['cell_height'], $side_bar['icon_width'], $a['data'], $a['svg'], $style);

    $currentY = $pdf->GetY();
  }
  $pdf->SetY($currentY);
}
