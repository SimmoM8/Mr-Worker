<?php
if (!isset($_FILES['file'])) {
  die("No file uploaded.");
}

$uploadDir = '/var/www/html/my/uploads/';
if (!is_dir($uploadDir)) {
  mkdir($uploadDir, 0777, true);
}

$uploadFile = $uploadDir . basename($_FILES['file']['name']);

echo "Temporary file: " . $_FILES['file']['tmp_name'] . "\n";
echo "Destination file: " . $uploadFile . "\n";

if (move_uploaded_file($_FILES['file']['tmp_name'], $uploadFile)) {
  echo "File uploaded successfully!";
} else {
  echo "Failed to upload file.";
  var_dump(error_get_last());
}
?>