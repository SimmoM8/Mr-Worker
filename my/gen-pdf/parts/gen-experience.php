<?php
// Create heading
drawHeader($pdf, $content['x'] + $content['margin'][3], $currentY, $content['inner_width'], $headings[$language][5], 0, $style);
$currentY = $pdf->GetY();

$we = array(); // Define work experience (dot points) array to be outputed underneath each employer.
$sel_we = explode(',', $data['resume']['work_experience']); // The id's of the dot points selected for this resume
$employer_title_h = 12; // Includes margin below title -> 9 + margin
$requiredHeight = $employer_title_h;

foreach ($data['work_experience'] as $we_item) {
  if (in_array($we_item['id'], $sel_we)) {
    $we[] = $we_item;
  }
}

$employers = [];
$sel_employers = explode(',', $data['resume']['employers']); // Selected employer IDs for this resume

// Fetch employers from database
$stmt = $pdo->prepare("SELECT * FROM `employers` WHERE user_id = :user_id ORDER BY `order` ASC");
$stmt->execute(['user_id' => $user_id]);
$all_employers = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($data['employers'] as $employer) {
  if (in_array($employer['id'], $sel_employers)) {
    $employers[] = $employer;
  }
}

// Populate work experience from database
foreach ($employers as $employer) {
  $employer_title_h = 12; // Includes margin below title -> 9 + margin
  $requiredHeight = $employer_title_h;

  // Iterate over the dot points within the current employer to calculate the total height required
  foreach ($we as $e) {
    if ($e['employerId'] === $employer['id']) {
      $requiredHeight += calculateSkillHeight($pdf, $content['inner_width'], $e['skill'][$selected_language], $style['font']);
    }
  }

  // Calculate the remaining space on the current page
  $remainingSpace = $pageHeight - $currentY - $style['bottom_margin'];

  // Check if there is enough space on the current page
  if ($requiredHeight > $remainingSpace) {
    newPage($pdf, $side_bar, $content, $profile_info, $headings, $language, $style, $profile_pic_path, $img_scale, $img_pos_x, $img_pos_y);
  }
  $currentY = $pdf->GetY();

  $pdf->setY($currentY + $employer_title_h); // Set y coord for the skills list including margin

  // Iterate over the fetched rows within the nested loop
  foreach ($we as $e) {
    if ($e['employerId'] === $employer['id']) {
      genPoint($pdf, $content['x'] + $content['margin'][3], $content['inner_width'], $e['skill'][$selected_language], $style);
    }
  }

  $next_employer = $pdf->GetY() + 4; // Add bottom margin and set y coord for next employer

  // Output employer information (Work experience heading) and dates
  genExp($pdf, $content['x'] + $content['margin'][3], $currentY, $content['inner_width'], $employer['title'][$selected_language], $employer['organisation'], $employer['area'] . ", " . $employer['country'][$selected_language], $employer['start_date'], $employer['end_date'], $style);
  $pdf->setY($next_employer);
  $currentY = $pdf->GetY();
}
