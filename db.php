<?php
// Load environment variables
$host = getenv('DB_HOST');
$user = getenv('DB_USER');
$pass = getenv('DB_PASS');
$db = getenv('DB_NAME');
$charset = 'utf8mb4';

if ($pass === 'empty') {
  $pass = ''; // Convert placeholder to blank password
}

error_log($host);
error_log($user);
error_log($pass);
error_log($db);

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  PDO::ATTR_EMULATE_PREPARES => false,
];

try {
  $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {

  error_log("Database connection failed: " . $e->getMessage());
  exit('Database connection failed.');
}
