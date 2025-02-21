<?php
session_start();
require '../db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "User not logged in."]);
    exit;
}

$user_id = $_SESSION['user_id'];
$data = json_decode(file_get_contents("php://input"), true);
$language_code = $data['language_code'] ?? '';
$action = $data['action'] ?? '';
$column = $data['column'] ?? '';

if (!$language_code) {
    echo json_encode(["success" => false, "message" => "Invalid language selection."]);
    exit;
}

// Get user's languages
$stmt = $pdo->prepare("SELECT lang_1, lang_2, lang_3, lang_4 FROM user_translations WHERE user_id = ?");
$stmt->execute([$user_id]);
$user_languages = $stmt->fetch(PDO::FETCH_ASSOC);

if ($action === "insert") {
    if (!$user_languages) {
        $stmt = $pdo->prepare("INSERT INTO user_translations (user_id, lang_1) VALUES (?, ?)");
        $stmt->execute([$user_id, $language_code]);
        echo json_encode(["success" => true, "message" => "Default language saved successfully."]);
    } else {
        echo json_encode(["error" => true, "message" => "User already has a default language."]);
    }
} elseif ($action === "add") {
    for ($i = 2; $i <= 4; $i++) {
        $column = "lang_" . $i;
        if (empty($user_languages[$column])) {
            $stmt = $pdo->prepare("UPDATE user_translations SET $column = ? WHERE user_id = ?");
            $stmt->execute([$language_code, $user_id]);
            echo json_encode(["success" => true, "message" => "Language added successfully."]);
            exit;
        }
    }
    echo json_encode(["success" => false, "message" => "You already have 4 languages."]);
}
