<?php
session_start();
$data = json_decode(file_get_contents("php://input"), true);
error_log("Language Data: " . print_r($data, true));

if (isset($data['selected_language'])) {
    $_SESSION['selected_language'] = $data['selected_language'];
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false]);
}
