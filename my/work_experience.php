<!--

<div>Ideas: sorting toolbar -> 'Custom' 'Alfabet' 'Datum' 'Duration' -> 'save order' button<br>
    List of information on each header -> 'dot point count' 'ai calculated review (bad to good scale)' 'word count' 'ai calculated value to resume'<br>
    Language selector button</div>

-->
<section class="dashboard container-fluid">
  <div class="background-icon"><i class="fa-solid fa-briefcase"></i></div>
  <div class="container">
    <h1>Work Experience</h1>
    <div class="experience-container" id="employers"></div>
    <!-- Content is loaded in via javascript -->
    <p class="alert"></p>
  </div>
  <?php include 'modal-experience.php'; ?>
</section>
<script>
  if (typeof Experience !== "undefined" && Experience.init) {
    Experience.init(); // Initialize Experience.js for this page
  }
</script>