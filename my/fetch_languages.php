<?php
header('Content-Type: application/json');
require '../db.php'; // Database connection

$query = isset($_GET['q']) ? trim($_GET['q']) : '';

if (!empty($query)) {
    $stmt = $pdo->prepare("SELECT language_name, language_code FROM translation_languages WHERE language_name LIKE ? LIMIT 10");
    $stmt->execute(["%$query%"]);
    $languages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($languages);
} else {
    echo json_encode([]);
}
