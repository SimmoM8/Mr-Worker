<?php
return [
    'success' => true,
    'message' => 'Successfully retrieved selected language.',
    'data' => [
        'selected_language' => $selectedLanguage = $_SESSION['selected_language'] ?? 'lang_1' // Default to 'lang_1' if not set
    ]
];
