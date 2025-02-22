<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in.']);
    exit();
}

require '../db.php'; // Database connection

error_log('updating translation: ' . print_r($_POST, true));

$id = $_POST['id'] ?? null;
$column = $_POST['column'] ?? null;
$value = $_POST['inputValue'] ?? null;
$call = $_POST['call'] ?? null;
$type = $_POST['type'] ?? null;

// Use a concise map for table names
$tableMap = [
    'work_experience' => 'employers',
    'education' => 'courses'
];

// Update the table name only if type is 'entry' and exists in the map
if ($type === 'entry' && isset($tableMap[$call])) {
    $call = $tableMap[$call];
}

error_log('call: ' . $call);

$selectedLanguage = $_SESSION['selected_language'];

if (!$id || !$column || !$value || !$call) {
    error_log('id: ' . $id . ' column: ' . $column . ' value: ' . $value . ' call: ' . $call);
    echo json_encode(['success' => false, 'message' => 'Missing required data.']);
    exit();
}

if (!$call) {
    echo json_encode(['success' => false, 'message' => 'Invalid call type.']);
    exit();
}

$columnLang = "{$column}_{$selectedLanguage}";

error_log('columnLang: ' . $columnLang);

try {
    $stmt = $pdo->prepare("UPDATE `$call` SET `$columnLang` = :value WHERE `id` = :id AND `user_id` = :user_id");
    $stmt->execute([
        ':value' => $value,
        ':id' => $id,
        ':user_id' => $_SESSION['user_id']
    ]);

    echo json_encode(['success' => true, 'message' => 'Translation saved successfully.']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
