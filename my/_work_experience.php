<?php
session_start();

// If user is not logged in, redirect to sign-in page
if ( !isset( $_SESSION[ 'user_id' ] ) ) {
  header( "Location: ../sign-in.html" );
  exit();
}
?>
<form id="work_experience-form">
  <h3 class="sub-heading">Work Experience</h3>
  <p>Select the skills you want displayed on this resume</p>
	<div class="" id="fetched-work_experience"></div>
  <input type="hidden" name="submit-work_experience" id="submit-work_experience-hidden" value="false">
</form>
