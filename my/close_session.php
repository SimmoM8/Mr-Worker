<?php
// Start or resume the current session
session_start();

// Perform any cleanup or data-saving operations as needed before closing the session.
// For example, you can unset session variables or destroy the session data.

$userId = $_SESSION['user_id'];

// remove all session variables
session_unset();


// Unset all session variables
$_SESSION = array();



// If you want to clear the session cookie, force the session to expire immediately
if (ini_get("session.use_cookies")) {
  $params = session_get_cookie_params();
  setcookie(
    session_name(),
    '',
    time() - 42000,
    $params["path"],
    $params["domain"],
    $params["secure"],
    $params["httponly"]
  );
}

// Destroy the session
//session_destroy();

$_SESSION['user_id'] = $userId;
?>
