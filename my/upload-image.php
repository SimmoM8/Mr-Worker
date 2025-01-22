<?php
$uploadDir = '/var/www/html/my/uploads/';
if (!is_dir($uploadDir)) {
  mkdir($uploadDir, 0777, true);
}

$uploadFile = $uploadDir . basename($_FILES['file']['name']);

error_log("Temporary file path: " . $_FILES['file']['tmp_name']);
error_log("Destination file: " . $uploadFile);

if (!isset($_FILES['file'])) {
  error_log("No file uploaded.");
  die("No file uploaded.");
}

if ($_FILES['file']['error'] !== UPLOAD_ERR_OK) {
  error_log("File upload error: " . $_FILES['file']['error']);
  die("File upload error.");
}

if (!file_exists($_FILES['file']['tmp_name'])) {
  error_log("Temporary file does not exist: " . $_FILES['file']['tmp_name']);
  die("Temporary file not found.");
}

if (move_uploaded_file($_FILES['file']['tmp_name'], $uploadFile)) {
  error_log("File uploaded successfully: " . $uploadFile);
  echo "File uploaded successfully!";
} else {
  error_log("Failed to move uploaded file.");
  var_dump(error_get_last());
  die("Failed to upload file.");
}
?>