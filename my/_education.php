<?php
session_start();

// If user is not logged in, redirect to sign-in page
if ( !isset( $_SESSION[ 'user_id' ] ) ) {
  header( "Location: ../sign-in.html" );
  exit();
}
?>
<form id="education-form">
  <h3 class="sub-heading">Education</h3>
  <p>Select the skills you want displayed on this resume</p>
	<div class="" id="fetched-education"></div>
  <input type="hidden" name="submit-education" id="submit-education-hidden" value="false">
</form>
