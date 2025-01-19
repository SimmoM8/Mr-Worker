<?php
// Load environment variables
$host = getenv('DB_HOST');
$user = getenv('DB_USER');
$pass = getenv('DB_PASS');
$db = getenv('DB_NAME');
$charset = 'utf8mb4';


error_log(print_r($host));
error_log(print_r($user));
error_log(print_r($pass));
error_log(print_r($db));

$dsn = "mysql:unix_socket=/run/mysqld/mysqld.sock;dbname=$db;charset=$charset";
$options = [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  PDO::ATTR_EMULATE_PREPARES => false,
];

try {
  $pdo = new PDO( $dsn, $user, $pass, $options );
} catch ( PDOException $e ) {

  error_log("Database connection failed: " . $e->getMessage());
  exit('Database connection failed.');

}
?>