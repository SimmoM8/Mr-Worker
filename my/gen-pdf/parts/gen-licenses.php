<?php
// Create heading
drawHeader($pdf, $side_bar['x'] + $side_bar['m_left'], $currentY, $side_bar['inner_width'], $translatedHeadings['licenses'], $side_bar['m_left'], $style);
$currentY = $pdf->GetY();

$licenses = array();
$sel_licenses = explode(',', $data['resume']['licenses']); // The id's of the licenses selected for this resume

// Add selected licenses to the `$licenses` array
foreach ($data['licenses'] as $row) {
  if (in_array($row['id'], $sel_licenses)) {
    $licenses[] = [
      'type' => $row['license'][$selected_language],
      'license' => $row['description'][$selected_language]
    ];
  }
}

$side_bar['licenses'] = $licenses;

sblicenses($pdf, $currentY, $side_bar, $style);

// Create license bar
function drawlicense($pdf, $x, $y, $license_type, $data, $maxWidth, $style)
{
  // Heading
  $pdf->SetX($x);
  $pdf->SetFont($style['font'], 'B', 8);
  $pdf->Cell($maxWidth, '', $license_type, $style['border'], 1, 'L');
  // Text
  $pdf->SetX($x);
  $pdf->SetFont($style['font'], '', 8);
  $pdf->Cell($maxWidth, '', $data, $style['border'], 1, 'L');
  $pdf->SetY($pdf->GetY() + 5);
}

function sblicenses($pdf, $y, $side_bar, $style)
{
  // Populate languages with bars from database
  foreach ($side_bar['licenses'] as $row) {
    drawlicense($pdf, $side_bar['x'] + $side_bar['m_left'], $y, $row['type'], $row['license'], $side_bar['inner_width'], $style);
  }
}
