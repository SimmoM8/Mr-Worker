<?php
require_once 'db_handler.php'; // Include the executeQuery function

function getUserById($userId)
{
    return executeQuery('SELECT', "SELECT * FROM users WHERE id = :id", [':id' => $userId], 'fetch');
}
