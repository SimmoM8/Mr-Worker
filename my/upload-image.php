<?php
session_start(); // Start session to access user ID
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$userId = $_SESSION['user_id'] ?? 'default'; // Use null coalescing operator
$uploadDir = __DIR__ . '/uploads/';
if (!is_dir($uploadDir)) {
  mkdir($uploadDir, 0777, true);
}
error_log("Script started.");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  error_log("Request method not POST.");
  respondWithError("Invalid request method.", 405);
}

if (!isset($_FILES['file'])) {
  error_log("No file detected in request.");
  respondWithError("No file uploaded.", 400);
}

error_log("Uploaded file details: " . print_r($_FILES, true));
// Check for upload errors

// Check for upload errors
if ($_FILES['file']['error'] === UPLOAD_ERR_OK) {
  // Clear temporary files for the user
  clearTemporaryFiles($uploadDir, $userId);

  $fileExtension = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
  $conversionFileName = "_conv_profile_picture_user_{$userId}." . $fileExtension;
  $convFilePath = $uploadDir . $conversionFileName;
  $tempFileName = "_temp_profile_picture_user_{$userId}." . ".jpeg";
  $tempFilePath = $uploadDir . $tempFileName;
  // Check upload directory
  if (!is_dir($uploadDir)) {
    error_log("Upload directory does not exist: $uploadDir");
    respondWithError("Upload directory not found.", 500);
  }

  // Test move_uploaded_file
  if (!move_uploaded_file($_FILES['file']['tmp_name'], $convFilePath)) {
    error_log("Failed to move uploaded file.");
    respondWithError("Failed to save uploaded file.", 500);
  }
  if ($_FILES['file']['size'] > 10485760) { // 10 MB
    error_log("File size exceeds limit: " . $_FILES['file']['size']);
    respondWithError("File size exceeds limit.", 400);
  }
  if (move_uploaded_file($_FILES['file']['tmp_name'], $convFilePath)) {
    $jpegFileName = $tempFileName;
    $jpegFilePath = $uploadDir . $jpegFileName;

    // Use CLI to convert the file to JPEG
    if (convertToJpegUsingCli($convFilePath, $jpegFilePath)) {
      unlink($convFilePath); // Clean up the temporary file
      respondWithSuccess("uploads/" . $jpegFileName);
    } else {
      respondWithError("Image conversion failed.");
    }
  } else {
    respondWithError("Failed to upload file.");
  }
} else {
  respondWithError("No file uploaded or upload error occurred.", 400);
  $errorMessages = [
    1 => "The uploaded file exceeds the upload_max_filesize directive in php.ini.",
    2 => "The uploaded file exceeds the MAX_FILE_SIZE directive specified in the HTML form.",
    3 => "The uploaded file was only partially uploaded.",
    4 => "No file was uploaded.",
    6 => "Missing a temporary folder.",
    7 => "Failed to write file to disk.",
    8 => "A PHP extension stopped the file upload."
  ];

  $error = $_FILES['file']['error'];
  error_log("Upload error $error: " . ($errorMessages[$error] ?? "Unknown error"));
  respondWithError($errorMessages[$error] ?? "Unknown upload error.", 400);
}

/**
 * Clear temporary files for the current user.
 *
 * @param string $uploadDir Directory containing uploads.
 * @param string $userId User ID to clear temporary files for.
 */
function clearTemporaryFiles($uploadDir, $userId)
{
  $tempFiles = glob($uploadDir . "_temp_profile_picture_user_{$userId}.*");
  foreach ($tempFiles as $tempFile) {
    unlink($tempFile);
  }
}

/**
 * Convert any image to JPEG using ImageMagick CLI.
 *
 * @param string $inputPath Path to the input image file.
 * @param string $outputPath Path to save the converted JPEG file.
 * @return bool True on success, false on failure.
 */
function convertToJpegUsingCli($inputPath, $outputPath)
{
  // Detect if running locally or on Google Cloud
  $isLocal = strpos(PHP_OS, 'WIN') !== false || file_exists('C:/xampp');

  // Set the ImageMagick path
  $convertCommand = $isLocal ? '/usr/local/bin/magick' : '/usr/bin/convert';
  $command = escapeshellcmd("$convertCommand convert '$inputPath' -strip -quality 90 '$outputPath'");
  exec($command, $output, $returnVar);
  return $returnVar === 0; // Return true if the conversion is successful
}

/**
 * Send a success response.
 *
 * @param string $filePath Path to the saved JPEG file.
 */
function respondWithSuccess($filePath)
{
  http_response_code(200);
  echo json_encode([
    'status' => 'success',
    'message' => 'File uploaded and converted successfully',
    'filePath' => $filePath
  ]);
  exit;
}

/**
 * Send an error response.
 *
 * @param string $message Error message.
 * @param int $statusCode HTTP status code (default: 500).
 */
function respondWithError($message, $statusCode = 500)
{
  http_response_code($statusCode);
  echo json_encode([
    'status' => 'error',
    'message' => $message
  ]);
  exit;
}
?>