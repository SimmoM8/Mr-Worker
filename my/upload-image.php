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

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  respondWithError("Invalid request method.", 405);
}

// Check for uploaded file
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
  respondWithError("No file uploaded or file upload error.", 400);
}

// Clear temporary files for the user
clearTemporaryFiles($uploadDir, $userId);

// Generate file paths
$fileExtension = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
$conversionFileName = "_conv_profile_picture_user_{$userId}." . $fileExtension;
$convFilePath = $uploadDir . $conversionFileName;
$tempFileName = "_temp_profile_picture_user_{$userId}." . ".jpeg";
$tempFilePath = $uploadDir . $tempFileName;

// Check upload directory properties
if (!is_dir($uploadDir) || !is_writable($uploadDir)) {
  respondWithError("Upload directory is not writable: $uploadDir", 500);
}
// Move the uploaded file
if (!file_exists($_FILES['file']['tmp_name'])) {
  respondWithError("Temporary file not found.", 500);
}
if (!move_uploaded_file($_FILES['file']['tmp_name'], $convFilePath)) {
  respondWithError("Failed to move uploaded file.", 500);
}

$jpegFilePath = $uploadDir . $tempFileName;

// Convert the file to JPEG using CLI
if (!convertToJpegUsingCli($convFilePath, $jpegFilePath)) {
  unlink($convFilePath); // Clean up the temporary file
  respondWithError("Image conversion failed.", 500);
}

// Remove the original file after successful conversion
unlink($convFilePath);

// Respond with success
respondWithSuccess("uploads/" . $tempFileName);

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
  $isLocal = strpos(PHP_OS, 'WIN') !== false || file_exists('/Applications/XAMPP/xamppfiles');

  // Set the ImageMagick path
  $convertCommand = $isLocal ? '/usr/local/bin/magick' : '/usr/bin/convert';

  // Ensure the input file exists
  if (!file_exists($inputPath)) {
    error_log("Input file for conversion does not exist: $inputPath");
    return false;
  }

  $command = escapeshellcmd("$convertCommand '$inputPath' -auto-orient -strip -quality 90 '$outputPath'");
  exec($command, $output, $returnVar);


  // Log command and output for debugging
  error_log("ImageMagick Command: $command");
  error_log("Command Output: " . implode("\n", $output));
  error_log("Return Value: $returnVar");

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
  error_log($message);
  http_response_code($statusCode);
  echo json_encode([
    'status' => 'error',
    'message' => $message
  ]);
  exit;
}
?>