<?php
session_start();

// Redirect to sign-in page if user is not logged in
if ( !isset( $_SESSION[ 'user_id' ] ) ) {
  header( "Location: ../sign-in.html" );
  exit();
}

// Get session data for pre-selecting skills
$resumeId = isset( $_SESSION[ 'resume_id' ] ) ? intval( $_SESSION[ 'resume_id' ] ) : null;

$skillTypes = [
  'hard_skills' => 'Hard Skills',
  'soft_skills' => 'Soft Skills',
  'languages' => 'Languages',
  'licenses' => 'licenses'
];
?>
<form id="skills-form">
  <h3 class="sub-heading">Skills</h3>
  <p>Select the skills you want displayed on this resume. It is recommended to choose around 5 skills for each hard and soft skills.</p>
  <?php foreach ($skillTypes as $type => $label): ?>
  <div class="card card-body card-colored">
    <h4><?php echo $label; ?></h4>
    <p>selected: 4/5 	score: 8/10 (stars or bar)</p>
    <div class="skills" id="fetched-<?php echo $type; ?>" data-skill-type="<?php echo $type; ?>"> </div>
  </div>
  <?php endforeach; ?>
  <input type="hidden" name="submit-skills" id="submit-skills-hidden" value="false">
</form>
