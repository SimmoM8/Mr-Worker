<?php

// Retrieve global language data
$global_languages = $data['global_languages'] ?? [];
$global_translations = $data['global_language_translations'] ?? [];
$selected_language = $data['selected_language'] ?? 'lang_1';
$selected_lang_code = $data['selected_lang_code'] ?? 'en';


// Create heading
drawHeader($pdf, $side_bar['x'] + $side_bar['m_left'], $currentY, $side_bar['inner_width'], $translatedHeadings['languages'], $side_bar['m_left'], $style);
$currentY = $pdf->GetY();


$languages = array();
$sel_lang = explode(',', $data['resume']['languages']); // The id's of the dot points selected for this resume

// Add selected languages to the `$languages` array
foreach ($data['languages'] as $row) {
  if (in_array($row['id'], $sel_lang)) {
    $translated = 'language'; // fallback if no translation found

    foreach ($global_languages as $g) {
      if ($g['code'] === $row['language_code']) {
        foreach ($global_translations as $t) {
          if ($t['language_id'] == $g['id'] && $t['translation_code'] === $selected_lang_code) {
            $translated = $t['translated_name'];
            break 2;
          }
        }
      }
    }

    $languages[] = [
      'language' => $translated,
      'percentage' => $row['percentage']
    ];
  }
}

$side_bar['languages'] = $languages;

sbLanguages($pdf, $currentY, $side_bar, $style);
$currentY = $pdf->GetY();


// Create language bar
function drawLang($pdf, $x, $y, $lang, $maxWidth, $bar_amount, $style)
{
  $width = $maxWidth * $bar_amount;
  $height = 1.5;
  $pdf->SetX($x);

  // Text
  $pdf->SetFont($style['font'], '', 10);
  $pdf->setFontSpacing(-0.1);
  $pdf->Cell($maxWidth, '', strtoupper($lang), $style['border'], 1, 'L');
  $barY = $pdf->GetY() + 1;
  $pdf->setFontSpacing(0);

  // Draw the black rectangle
  $pdf->SetFillColor(35, 32, 31);
  $pdf->RoundedRect($x, $barY, $maxWidth, $height, 0.4, '1111', 'F');

  // Draw the colored rectangle as a percentage bar
  $pdf->SetFillColor($style['bubble_color']['r'], $style['bubble_color']['g'], $style['bubble_color']['b']);
  $pdf->RoundedRect($x, $barY, $width, $height, 0.4, '1111', 'F');
  $pdf->SetY($barY + $height + 5);
}

function sbLanguages($pdf, $y, $side_bar, $style)
{
  // Populate languages with bars from database
  foreach ($side_bar['languages'] as $row) {
    drawLang($pdf, $side_bar['x'] + $side_bar['m_left'], $y, $row['language'], $side_bar['inner_width'], $row['percentage'] / 100, $style);
  }
}
