<?php
session_start();
require '../db.php'; // Database connection

$user_id = $_SESSION['user_id']; // Assume user is logged in

// Fetch user's saved languages with names from translation_languages
$stmt = $pdo->prepare("
    SELECT tl1.language_name AS lang_1, tl2.language_name AS lang_2, tl3.language_name AS lang_3, tl4.language_name AS lang_4
    FROM user_translations ut
    LEFT JOIN translation_languages tl1 ON ut.lang_1 = tl1.language_code
    LEFT JOIN translation_languages tl2 ON ut.lang_2 = tl2.language_code
    LEFT JOIN translation_languages tl3 ON ut.lang_3 = tl3.language_code
    LEFT JOIN translation_languages tl4 ON ut.lang_4 = tl4.language_code
    WHERE ut.user_id = ?
");
$stmt->execute([$user_id]);
$user_languages = $stmt->fetch(PDO::FETCH_ASSOC);

// If no languages exist in the database, return a flag
if (!$user_languages) {
    echo json_encode([
        'no_languages' => true,
        'message' => 'Please select a default language to continue.'
    ]);
    exit;
}

// Set a default language if none is selected
if (!isset($_SESSION['selected_language'])) {
    $_SESSION['selected_language'] = $user_languages['lang_1'];
}

// Remove NULL values from the list
$user_languages = array_filter($user_languages);

// Return JSON for JavaScript
echo json_encode([
    'languages' => $user_languages,
    'selected_language' => $_SESSION['selected_language']
]);
