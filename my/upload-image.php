<?php
$uploadDir = '/var/www/html/my/uploads/';
if (!is_dir($uploadDir)) {
  mkdir($uploadDir, 0777, true);
}

$uploadFile = $uploadDir . basename($_FILES['file']['name']);
error_log("Temporary file path: " . $_FILES['file']['tmp_name']);
error_log("Destination file: " . $uploadFile);

if (!file_exists($_FILES['file']['tmp_name'])) {
  error_log("Temporary file does not exist: " . $_FILES['file']['tmp_name']);
  die("Temporary file not found.");
}

if (!is_writable($uploadDir)) {
  error_log("Destination directory is not writable.");
  die("Upload directory is not writable.");
}

if (!file_exists(dirname($uploadFile))) {
  error_log("Destination directory does not exist: " . dirname($uploadFile));
  die("Destination directory not found.");
}

if (!move_uploaded_file($_FILES['file']['tmp_name'], $uploadFile)) {
  error_log("Failed to move uploaded file.");
  error_log("Temporary file exists: " . (file_exists($_FILES['file']['tmp_name']) ? 'yes' : 'no'));
  error_log("Destination directory writable: " . (is_writable($uploadDir) ? 'yes' : 'no'));
  error_log("Error details: " . json_encode(error_get_last()));
  die("Failed to upload file.");
}

echo "File uploaded successfully!";
?>