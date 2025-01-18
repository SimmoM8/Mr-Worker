<?php
session_start();

header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in.']);
    exit;
}

include_once '../db.php';

if (isset($_POST['submitReport'])) {
    if (isset($_POST['reportMessage']) && !empty($_POST['reportMessage'])) {
        try {
            $userId = $_SESSION['user_id'];
            $reportMessage = htmlspecialchars($_POST['reportMessage'], ENT_QUOTES, 'UTF-8');
            $reportDate = date("Y-m-d H:i:s");

            // Prepare the SQL query
            $stmt = $pdo->prepare(
                "INSERT INTO user_reports (report_message, user_id, report_date) VALUES (:reportMessage, :userId, :reportDate)"
            );

            // Execute the query with bound parameters
            $stmt->execute([
                ':reportMessage' => $reportMessage,
                ':userId' => $userId,
                ':reportDate' => $reportDate,
            ]);

            echo json_encode(['success' => true, 'message' => 'Thank you for your report!']);
        } catch (PDOException $e) {
            // Handle database errors gracefully
            echo json_encode(['success' => false, 'message' => 'Failed to save your report.', 'error' => $e->getMessage()]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Message cannot be empty.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request.']);
}
?>
