<?php
require_once 'db_queries.php';
require_once 'helpers/api_core.php';

header('Content-Type: application/json'); // Ensure JSON response
session_start(); // Start session for user authentication

$request = json_decode(file_get_contents("php://input"), true) ?? [];

$table = $request['table'] ?? null;
$action = $request['action'] ?? null;

error_log("Received request: " . json_encode($request));

$user_id = $_SESSION['user_id'] ?? null;

if (!$table || !$action) {
    sendResponse(false, "Missing table or action.");
}

// Ensure the table name is valid
$allowedTables = ['work_experience', 'education', 'hard_skills', 'soft_skills', 'languages', 'licenses', 'users', 'resumes', 'courses', 'employers', 'user_reports', 'password_resets', 'global_languages', 'user_languages', 'global_language_translations'];
if (!in_array($table, $allowedTables)) {
    sendResponse(false, "Invalid table name.");
}

// Enforce user scope unless explicitly overridden
$enforceScope = !(isset($request['user_scope']) && $request['user_scope'] === false);
error_log("Enforcing user scope: " . ($enforceScope ? "Yes" : "No"));
enforceUserScope($request, $user_id, $enforceScope);

// Handle API request dynamically
$response = handleRequest($action, $table, $request, $user_id);
sendResponse($response['success'], $response['message'], $response['data'] ?? []);

// Return a JSON response to the front-end
function sendResponse($success, $message = "", $data = [])
{
    $nullMessage = "- Enter translate mode to type translation -";

    echo json_encode([
        'success' => $success,
        'message' => is_string($message) ? $message : "No message provided.",
        'data' => $data,
        'null_message' => $nullMessage
    ]);
    exit;
}
