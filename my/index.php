<?php
session_start();

// If the user is not logged in, redirect to the sign-in page
if (!isset($_SESSION['user_id'])) {
  header("Location: ../sign-in.html");
  exit();
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dynamic Resume Builder</title>

  <!-- Include Bootstrap and jQuery -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"
    crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
    crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.14.0/Sortable.min.js"></script>

  <!-- Include Popper.js (required by Bootstrap 5) -->
  <script src="https://cdn.jsdelivr.net/npm/@floating-ui/core@1.6.0"></script>
  <script src="https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.6.1"></script>

  <!-- Include site CSS -->
  <link href="../css/styles.css" rel="stylesheet">
  <link href="../css/popup_styles.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
    crossorigin="anonymous">

  <!-- Include Color input JS -->
  <script src="https://cdn.skypack.dev/vanilla-colorful" type="module"></script>
  <script src="https://cdn.skypack.dev/vanilla-colorful/hex-input.js" type="module"></script>
  <script src="../js/profile-picture.js" defer></script>
</head>

<body>
  <!-- SIDE BAR -->
  <?php include 'side_bar.php'; ?>

  <div class="container-fluid" style="overflow-y: auto; padding: 0;">

    <!-- TOP BAR -->
    <div id="top-bar" class="d-flex justify-content-between align-items-center px-5 py-3">
      <!-- Language Selector -->
      <div class="d-flex align-items-center">
        <label for="userLanguageSelector" class="me-2">Language:</label>
        <select id="userLanguageSelector" class="form-select me-3">
        </select>

        <!-- Hidden Add Language Input -->
        <div id="addLanguageContainer" class="align-items-center" style="display: none;">
          <div class="dropdown w-100">
            <input type="text" id="searchLanguageInput" class="form-control dropdown-toggle"
              data-bs-toggle="dropdown" placeholder="Search for a language...">
            <ul id="languagesDropdown" class="dropdown-menu w-100"></ul>
          </div>
          <button id="addLanguageBtn" class="btn btn-primary mt-3 w-100" disabled>Add Language</button>
          <button id="cancelAddLanguageBtn" class="btn btn-primary mt-3 w-100">Cancel</button>
        </div>

        <!-- Translate Mode Button -->
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" id="translateModeSwitch">
          <label class="form-check-label" for="translateModeSwitch" style="text-wrap: nowrap;">Translate Mode</label>
        </div>
      </div>

      <!-- User Profile Dropdown -->
      <div class="dropdown">
        <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="userMenu" data-bs-toggle="dropdown"
          aria-expanded="false">
          <i class="bi bi-person-circle"></i> Profile
        </button>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
          <li><a class="dropdown-item" href="settings.php"><i class="bi bi-gear"></i> Settings</a></li>
          <li><a class="dropdown-item text-danger" href="logout.php"><i class="bi bi-box-arrow-right"></i> Logout</a>
          </li>
        </ul>
      </div>
    </div>

    <!-- MAIN CONTENT CONTAINER -->
    <div id="main-content" class="p-3">
      <!-- Content will be dynamically loaded here -->
      <p>Loading...</p>
    </div>
  </div>

  <!-- Floating Report Button -->
  <div id="reportButton" class="floating-button"> <i class="bi bi-bug"></i> </div>
  <form id="reportForm" class="floating-form form-control hidden">
    <textarea id="reportMessage" name="reportMessage" placeholder="Report any bugs or suggestions..."
      rows="4"></textarea>
    <button id="submitReport" name="submitReport" class="btn btn-primary">Submit</button>
  </form>
  <script src="../js/main.js"></script>
  <script src="../js/experience.js" defer></script>
  <script src="../js/resumes.js"></script>
</body>

</html>