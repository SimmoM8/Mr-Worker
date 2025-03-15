<?php
// Calculate the remaining space on the current page
$remainingSpace = $pageHeight - $currentY - $style['bottom_margin'];

// Check if there is enough space on the current page
if ($requiredHeight > $remainingSpace) {
  newPage($pdf, $side_bar, $content, $profile_info, $headings, $language, $style, $profile_pic_path, $img_scale, $img_pos_x, $img_pos_y);
}
$currentY = $pdf->GetY();

// Create heading
drawHeader($pdf, $content['x'] + $content['margin'][3], $currentY, $content['inner_width'], $headings[$language][6], 0, $style);
$currentY = $pdf->GetY();

$education = array(); // Define work experience (dot points) array to be outputed underneath each employer.
$sel_e = explode(',', $resumes['education']); // The id's of the dot points selected for this resume
$course_title_h = 12; // Includes margin below title -> 9 + margin
$requiredHeight = $course_title_h;

// Fetch all education (dot points) from database
$stmt = $pdo->prepare("SELECT * FROM `education` WHERE user_id = :user_id");
$stmt->execute(['user_id' => $user_id]);
$all_education = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($all_education as $edu) {
  if (in_array($edu['id'], $sel_e)) {
    $education[] = $edu;
  }
}

$courses = [];
$sel_courses = explode(',', $resumes['courses']); // Selected course IDs for this resume

// Fetch all courses from the database
$stmt = $pdo->prepare("SELECT * FROM `courses` WHERE user_id = :user_id ORDER BY `order` ASC");
$stmt->execute(['user_id' => $user_id]);
$all_courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($all_courses as $course) {
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
      $requiredHeight += calculateSkillHeight($pdf, $content['inner_width'], $e["skill_$selected_language"], $style['font']);
    }
  }

  // Calculate the remaining space on the current page
  $remainingSpace = $pdf->GetPageHeight() - $currentY;

  // Check if there is enough space on the current page
  if ($requiredHeight > $remainingSpace) {
    newPage($pdf, $side_bar, $content, $profile_info, $headings, $language, $style, $profile_pic_path, $img_scale, $img_pos_x, $img_pos_y);
  }
  $currentY = $pdf->GetY();
  $pdf->setY($currentY + $employer_title_h); // Set y coord for the skills list including margin

  // Iterate over the fetched rows within the nested loop
  foreach ($education as $e) {
    if ($e['courseId'] === $course['id']) {
      genPoint($pdf, $content['x'] + $content['margin'][3], $content['inner_width'], $e["skill_$selected_language"], $style);
    }
  }

  $next_course = $pdf->GetY() + 4; // Add bottom margin and set y coord for next employer

  // Output employer information (Work experience heading) and dates
  genExp($pdf, $content['x'] + $content['margin'][3], $currentY, $content['inner_width'], $course["course_$selected_language"], $course['school'], $course['area'] . ", " . $course["country_$selected_language"], $course['start_date'], $course['end_date'], $style);
  $pdf->setY($next_course);
  $currentY = $pdf->GetY();
}

// reset pointer to the last page
$pdf->lastPage();
