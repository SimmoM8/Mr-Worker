<?php
session_start(); // Start session to access user ID
ini_set( 'display_errors', 1 );
ini_set( 'display_startup_errors', 1 );
error_reporting( E_ALL );

$userId = $_SESSION[ 'user_id' ] ?? 'default'; // Use null coalescing operator
$uploadDir = __DIR__ . '/uploads/';
if ( !is_dir( $uploadDir ) ) {
  mkdir( $uploadDir, 0777, true );
}

if ( $_FILES[ 'file' ][ 'error' ] === UPLOAD_ERR_OK ) {
  // Clear temporary files for the user
  clearTemporaryFiles( $uploadDir, $userId );

  $fileExtension = strtolower( pathinfo( $_FILES[ 'file' ][ 'name' ], PATHINFO_EXTENSION ) );
  $conversionFileName = "_conv_profile_picture_user_{$userId}." . $fileExtension;
  $convFilePath = $uploadDir . $conversionFileName;
  $tempFileName = "_temp_profile_picture_user_{$userId}." . ".jpeg";
  $tempFilePath = $uploadDir . $tempFileName;

  if ( move_uploaded_file( $_FILES[ 'file' ][ 'tmp_name' ], $convFilePath ) ) {
    $jpegFileName = $tempFileName;
    $jpegFilePath = $uploadDir . $jpegFileName;

    // Use CLI to convert the file to JPEG
    if ( convertToJpegUsingCli( $convFilePath, $jpegFilePath ) ) {
      unlink( $convFilePath ); // Clean up the temporary file
      respondWithSuccess( "uploads/" . $jpegFileName );
    } else {
      respondWithError( "Image conversion failed." );
    }
  } else {
    respondWithError( "Failed to upload file." );
  }
} else {
  respondWithError( "No file uploaded or upload error occurred.", 400 );
}

/**
 * Clear temporary files for the current user.
 *
 * @param string $uploadDir Directory containing uploads.
 * @param string $userId User ID to clear temporary files for.
 */
function clearTemporaryFiles( $uploadDir, $userId ) {
  $tempFiles = glob( $uploadDir . "_temp_profile_picture_user_{$userId}.*" );
  foreach ( $tempFiles as $tempFile ) {
    unlink( $tempFile );
  }
}

/**
 * Convert any image to JPEG using ImageMagick CLI.
 *
 * @param string $inputPath Path to the input image file.
 * @param string $outputPath Path to save the converted JPEG file.
 * @return bool True on success, false on failure.
 */
function convertToJpegUsingCli( $inputPath, $outputPath ) {
  $command = escapeshellcmd( "/usr/local/bin/magick convert '$inputPath' -strip -quality 90 '$outputPath'" );
  exec( $command, $output, $returnVar );
  return $returnVar === 0; // Return true if the conversion is successful
}

/**
 * Send a success response.
 *
 * @param string $filePath Path to the saved JPEG file.
 */
function respondWithSuccess( $filePath ) {
  http_response_code( 200 );
  echo json_encode( [
    'status' => 'success',
    'message' => 'File uploaded and converted successfully',
    'filePath' => $filePath
  ] );
  exit;
}

/**
 * Send an error response.
 *
 * @param string $message Error message.
 * @param int $statusCode HTTP status code (default: 500).
 */
function respondWithError( $message, $statusCode = 500 ) {
  http_response_code( $statusCode );
  echo json_encode( [
    'status' => 'error',
    'message' => $message
  ] );
  exit;
}
?>