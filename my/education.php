<section class="dashboard container-fluid">
  <div class="background-icon"><i class="fa-solid fa-graduation-cap"></i></div>
  <div class="container">
    <h5 class="text-muted">Name's Resumes</h5>
    <h1>Education</h1>
    <div class="experience-container" id="courses"> </div>
    <p class="alert"></p>
  </div>
</section>
<?php include 'modal-experience.php'; ?>
<script>
    console.log("Inline script in education.php executed");
    if (typeof Experience !== "undefined" && Experience.init) {
      Experience.init(); // Initialize Experience.js for this page
    }
  </script> 
