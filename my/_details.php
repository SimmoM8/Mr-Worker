<?php
session_start();

// Redirect to sign-in page if user is not logged in
if ( !isset( $_SESSION[ 'user_id' ] ) ) {
  header( "Location: ../sign-in.html" );
  exit();
}

// Helper function to get session value with a default fallback
function getSessionValue( $key, $default ) {
  return isset( $_SESSION[ $key ] ) ? htmlspecialchars( $_SESSION[ $key ] ) : $default;
}

// CSS Variables
$cssVariables = [
  '--pWidth' => '500px',
  '--c1' => getSessionValue( 'grad_color_1', '#FF1C1C' ),
  '--c2' => getSessionValue( 'grad_color_2', '#750D64' ),
  '--bgc' => getSessionValue( 'background_color', '#FCE8E8' ),
  '--bc' => getSessionValue( 'bubble_color', '#E69BA8' )
];
?>
<style>
:root {
<?php foreach ($cssVariables as $var => $value) {
echo "$var: $value;\n";
}
?>
}
</style>

<form id="details-form">
  <div class="card card-body card-colored">
    <h4>Job Position</h4>
    <div>
      <label for="job_position" class="form-label">What type of job position are you searching?</label>
      <input type="text" class="form-control" id="job_position" name="job_position" placeholder="Shop Manager" value="<?php echo getSessionValue('job_position', ''); ?>">
    </div>
  </div>
  <div class="card card-body card-colored">
    <h4>Theme Gradient</h4>
    <p>These will be the theme colours for this resume. Colour 1 is the left colour of the gradient, and colour 2 is the right.</p>
    <div class="form-colors row">
      <?php include_once('template-color-inputs.php'); ?>
    </div>
  </div>
  <input type="hidden" name="submit-details" id="submit-details-hidden" value="false">
  <div class="col-12"></div>
</form>
