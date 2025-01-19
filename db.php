<?php
// Load environment variables
$host = getenv('DB_HOST');
$user = getenv('DB_USER');
$pass = getenv('DB_PASS');
$db = getenv('DB_NAME');
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  PDO::ATTR_EMULATE_PREPARES => false,
];

try {
  $pdo = new PDO( $dsn, $user, $pass, $options );
} catch ( PDOException $e ) {

  error_log("Database connection failed: " . $e->getMessage());

  echo "Error Code: " . $e->getCode() . "<br>";
  echo "Error Message: " . $e->getMessage() . "<br>";
  echo $DB_HOST . "<br>";
echo $DB_NAME . "<br>";
echo $DB_USER . "<br>";
echo $DB_PASS;


  exit('Database connection failed.');

}
?>