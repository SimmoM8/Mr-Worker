<section class="dashboard container-fluid">
  <div class="background-icon"><i class="fa-solid fa-graduation-cap"></i></div>
  <div class="container">
    <h1>Education</h1>
    <div class="experience-container" id="courses"> </div>
    <p class="alert"></p>
  </div>
</section>
<?php include 'modal-experience.php'; ?>
<script>
  if (typeof Experience !== "undefined" && Experience.init) {
    Experience.init(); // Initialize Experience.js for this page
  }
</script>