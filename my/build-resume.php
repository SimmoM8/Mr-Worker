<?php
session_start();

require_once '../helpers/api_core.php';

if (!isset($_SESSION['user_id'])) {
  exit("Unauthorized");
}

$user_id = $_SESSION['user_id'];
error_log("Posted data: " . print_r($_POST, true));

$card_id = $_POST['card_id'] ?? null;
$selected_language = $_POST['sel_lang'] ?? 'lang_1'; // Default to 'lang_1' if not set
$selected_lang_code = $_POST['sel_lang_code'] ?? 'en';


if (!$card_id) {
  exit("No resume ID provided.");
}

// Fetch all required resume data
$resume = handleRequest('fetch', 'resumes', ['conditions' => ['id' => $card_id]], $user_id)['data'][0] ?? null;
$user = handleRequest('fetch', 'users', ['conditions' => ['id' => $user_id]], $user_id)['data'][0] ?? null;
$hard_skills = handleRequest('fetch', 'hard_skills', [], $user_id)['data'] ?? [];
$soft_skills = handleRequest('fetch', 'soft_skills', [], $user_id)['data'] ?? [];
$languages = handleRequest('fetch', 'languages', [], $user_id)['data'] ?? [];
$licenses = handleRequest('fetch', 'licenses', [], $user_id)['data'] ?? [];
$employers = handleRequest('fetch', 'employers', [], $user_id)['data'] ?? [];
$courses = handleRequest('fetch', 'courses', [], $user_id)['data'] ?? [];
$work_experience = handleRequest('fetch', 'work_experience', [], $user_id)['data'] ?? [];
$education = handleRequest('fetch', 'education', [], $user_id)['data'] ?? [];

$global_languages = handleRequest('fetch', 'global_languages', ['user_scope' => false], null)['data'] ?? [];
$global_language_translations = handleRequest('fetch', 'global_language_translations', ['user_scope' => false], null)['data'] ?? [];

if (!$resume || !$user) {
  exit("Resume or user not found.");
}

// Combine into a structured package
$resumePackage = [
  'resume' => $resume,
  'user' => $user,
  'hard_skills' => $hard_skills,
  'soft_skills' => $soft_skills,
  'languages' => $languages,
  'licenses' => $licenses,
  'employers' => $employers,
  'courses' => $courses,
  'work_experience' => $work_experience,
  'education' => $education,
  'selected_language' => $selected_language,
  'selected_lang_code' => $selected_lang_code,
  'global_languages' => $global_languages,
  'global_language_translations' => $global_language_translations
];

// Render PDF from assembled data
require_once 'gen-pdf/pdf-renderer.php';
