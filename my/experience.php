<?php
// Determine type based on URL
$type = isset($_GET['type']) && $_GET['type'] === 'work' ? 'work' : 'education';

// Set dynamic variables based on type
$pageTitle = $type === 'work' ? 'Work Experience' : 'Education';
$iconClass = $type === 'work' ? 'fa-briefcase' : 'fa-graduation-cap';
$containerId = $type === 'work' ? 'employers' : 'courses';
?>

<section class="dashboard container-fluid">
    <div class="background-icon"><i class="fa-solid <?php echo $iconClass; ?>"></i></div>
    <div class="container">
        <h1><?php echo $pageTitle; ?></h1>
        <div class="experience-container" id="<?php echo $containerId; ?>"> </div>
        <p class="alert"></p>
    </div>
</section>

<?php include 'modal-experience.php'; ?>

<script>
    if (typeof Experience !== "undefined" && Experience.init) {
        Experience.init(); // Initialize Experience.js for this page
    }
</script>