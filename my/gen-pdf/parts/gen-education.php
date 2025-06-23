<?php
// Calculate the remaining space on the current page
$remainingSpace = $pageHeight - $currentY - $style['bottom_margin'];

// Check if there is enough space on the current page
if ($requiredHeight > $remainingSpace) {
  newPage($pdf, $side_bar, $content, $profile_info, $headings, $language, $style, $profile_pic_path, $img_scale, $img_pos_x, $img_pos_y);
}
$currentY = $pdf->GetY();

// Create heading
drawHeader($pdf, $content['x'] + $content['margin'][3], $currentY, $content['inner_width'], $translatedHeadings['education'], 0, $style);
$currentY = $pdf->GetY();

$education = array(); // Define work experience (dot points) array to be outputed underneath each employer.
$sel_e = explode(',', $data['resume']['education']); // The id's of the dot points selected for this resume
$course_title_h = 12; // Includes margin below title -> 9 + margin
$requiredHeight = $course_title_h;

foreach ($data['education'] as $edu) {
  if (in_array($edu['id'], $sel_e)) {
    $education[] = $edu;
  }
}

$courses = [];
$sel_courses = explode(',', $data['resume']['courses']); // Selected course IDs for this resume

foreach ($data['courses'] as $course) {
  if (in_array($course['id'], $sel_courses)) {
    $courses[] = $course;
  }
}

// Populate work experience from database
foreach ($courses as $course) {
  $course_title_h = 12; // Includes margin below title -> 9 + margin
  $requiredHeight = $course_title_h;

  // Iterate over the dot points within the current employer to calculate the total height required
  foreach ($education as $e) {
    if ($e['courseId'] === $course['id']) {
      $requiredHeight += calculateSkillHeight($pdf, $content['inner_width'], $e['skill'][$selected_language], $style['font']);
    }
  }

  // Calculate the remaining space on the current page
  $remainingSpace = $pdf->GetPageHeight() - $currentY;

  // Check if there is enough space on the current page
  if ($requiredHeight > $remainingSpace) {
    newPage($pdf, $side_bar, $content, $profile_info, $translatedHeadings, $language, $style, $profile_pic_path, $img_scale, $img_pos_x, $img_pos_y);
  }
  $currentY = $pdf->GetY();
  $pdf->setY($currentY + $employer_title_h); // Set y coord for the skills list including margin

  // Iterate over the fetched rows within the nested loop
  foreach ($education as $e) {
    if ($e['courseId'] === $course['id']) {
      genPoint($pdf, $content['x'] + $content['margin'][3], $content['inner_width'], $e['skill'][$selected_language], $style);
    }
  }

  $next_course = $pdf->GetY() + 4; // Add bottom margin and set y coord for next employer

  // Output employer information (Work experience heading) and dates
  genExp($pdf, $content['x'] + $content['margin'][3], $currentY, $content['inner_width'], $course['title'][$selected_language], $course['organisation'], $course['area'] . ", " . $course['country'][$selected_language], $course['start_date'], $course['end_date'], $style);
  $pdf->setY($next_course);
  $currentY = $pdf->GetY();
}

// reset pointer to the last page
$pdf->lastPage();
