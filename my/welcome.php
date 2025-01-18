<?php
session_start();

// If user is not logged in, redirect to sign-in page
if ( !isset( $_SESSION[ 'user_id' ] ) ) {
  header( "Location: ../sign-in.html" );
  exit();
}

$userId = $_SESSION[ 'user_id' ];
// remove all session variables
session_unset();
// reset the user id into the session - THERE IS A BETTER WAY TO DO THIS!!!
$_SESSION[ 'user_id' ] = $userId;
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome - My Job AI</title>

<!-- Include jQuery --> 
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script> 

<!-- Include Popper.js (required by Bootstrap 5) --> 
<script src="https://cdn.jsdelivr.net/npm/@floating-ui/core@1.6.0"></script> 
<script src="https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.6.1"></script> 

<!-- Include Bootstrap JS, CSS and Icons -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous"></script> 

<!-- Include site CSS -->
<link href="../css/styles.css" rel="stylesheet" type="text/css">
<link href="../css/popup_styles.css" rel="stylesheet" type="text/css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" integrity="sha384-mQ93GR66B00ZXjt0YO5KlohRA5SY2XofGJYq2H5R02Xx0a/HN1+2fW5q1j2FgNPA" crossorigin="anonymous">
<style>
body, html {
    height: 100%;
    margin: 0;
    background: url('../images/sign-in-hero-4.png') no-repeat center center fixed;
    background-size: cover;
}
.full-height {
    height: 100%;
}
.form-container {
    background: white;
    padding: 8rem 15rem;
    box-shadow: 0 1px 24px rgba(0, 0, 0, 1);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    max-width: 800px;
    border-radius: 20px;
}
</style>
</head>
<body>
<div class="form-container">
  <h2 class="text-center mb-4">Welcome</h2>
  <form id="welcomeForm" method="post" enctype="multipart/form-data">
    <div class="step">
      <div class="mb-3">
        <label for="countryCode" class="form-label">Country Code</label>
        <div class="input-group">
          <input type="text" class="form-control" id="countryCode" name="countryCode" placeholder="Country Code" style="max-width: 100px;" required>
          <input type="text" class="form-control" id="mobile" name="mobile" placeholder="Mobile Number" required>
        </div>
      </div>
      <button type="button" class="btn btn-primary w-100" onclick="nextStep()">Next</button>
      <button type="button" class="btn btn-secondary w-100 mt-2" onclick="skipStep()">Fill in later</button>
    </div>
    <div class="step" style="display: none;">
      <div class="mb-3">
        <label for="street" class="form-label">Street</label>
        <input type="text" class="form-control" id="street" name="street" placeholder="Street" required>
      </div>
      <div class="mb-3">
        <label for="town" class="form-label">Town</label>
        <input type="text" class="form-control" id="town" name="town" placeholder="Town" required>
      </div>
      <div class="mb-3">
        <label for="postCode" class="form-label">Post Code</label>
        <input type="text" class="form-control" id="postCode" name="postCode" placeholder="Post Code" required>
      </div>
      <div class="mb-3">
        <label for="country" class="form-label">Country</label>
        <input type="text" class="form-control" id="country" name="country" placeholder="Country" required>
      </div>
      <button type="button" class="btn btn-primary w-100" onclick="nextStep()">Next</button>
      <button type="button" class="btn btn-secondary w-100 mt-2" onclick="prevStep()">Back</button>
      <button type="button" class="btn btn-secondary w-100 mt-2" onclick="skipStep()">Fill in later</button>
    </div>
    <div class="step" style="display: none;">
      <div class="mb-3">
        <label for="about_me" class="form-label">About Me</label>
        <textarea class="form-control" id="aboutMe" name="aboutMe" placeholder="About Me" required></textarea>
      </div>
      <button type="button" class="btn btn-primary w-100" onclick="nextStep()">Next</button>
      <button type="button" class="btn btn-secondary w-100 mt-2" onclick="prevStep()">Back</button>
      <button type="button" class="btn btn-secondary w-100 mt-2" onclick="skipStep()">Fill in later</button>
    </div>
    <div class="step" style="display: none;">
      <div class="mb-3">
        <label for="image" class="form-label">Image Selector</label>
        <input type="file" class="form-control" id="image" name="image" required>
      </div>
      <div class="mb-3">
        <label for="imagePositionX" class="form-label">Image Position X</label>
        <input type="number" class="form-control" id="imagePositionX" name="imagePositionX" placeholder="Image Position X" required>
      </div>
      <div class="mb-3">
        <label for="imagePositionY" class="form-label">Image Position Y</label>
        <input type="number" class="form-control" id="imagePositionY" name="imagePositionY" placeholder="Image Position Y" required>
      </div>
      <div class="mb-3">
        <label for="imageScale" class="form-label">Image Scale</label>
        <input type="number" class="form-control" id="imageScale" name="imageScale" placeholder="Image Scale" required>
      </div>
      <button type="button" class="btn btn-primary w-100" onclick="submitForm()">Submit</button>
      <button type="button" class="btn btn-secondary w-100 mt-2" onclick="prevStep()">Back</button>
      <button type="button" class="btn btn-secondary w-100 mt-2" onclick="skipStep()">Fill in later</button>
    </div>
  </form>
  <div id="message" class="mt-3"></div>
</div>
<script>
let currentStep = 0;
const steps = document.querySelectorAll('.step');
const messageDiv = document.getElementById('message');

function nextStep() {
    if (validateStep(currentStep)) {
        steps[currentStep].style.display = 'none';
        currentStep++;
        steps[currentStep].style.display = 'block';
    }
}

function prevStep() {
    if (currentStep > 0) {
        steps[currentStep].style.display = 'none';
        currentStep--;
        steps[currentStep].style.display = 'block';
    }
}

function skipStep() {
    steps[currentStep].style.display = 'none';
    currentStep++;
    if (currentStep < steps.length) {
        steps[currentStep].style.display = 'block';
    } else {
        submitForm();
    }
}

function validateStep(step) {
    messageDiv.innerHTML = ''; // Clear any previous messages
    let isValid = true;
    let field;

    switch(step) {
        case 0:
            field = document.getElementById('countryCode');
            if (!field.value) {
                messageDiv.innerHTML = 'Country Code is required';
                isValid = false;
            }
            field = document.getElementById('mobile');
            if (!field.value) {
                messageDiv.innerHTML = 'Mobile is required';
                isValid = false;
            }
            break;
        case 1:
            field = document.getElementById('street');
            if (!field.value) {
                messageDiv.innerHTML = 'Address is required';
                isValid = false;
            }
            field = document.getElementById('town');
            if (!field.value) {
                messageDiv.innerHTML = 'Address is required';
                isValid = false;
            }
            field = document.getElementById('postCode');
            if (!field.value) {
                messageDiv.innerHTML = 'Address is required';
                isValid = false;
            }
            field = document.getElementById('country');
            if (!field.value) {
                messageDiv.innerHTML = 'Address is required';
                isValid = false;
            }
            break;
        case 2:
            field = document.getElementById('aboutMe');
            if (!field.value) {
                messageDiv.innerHTML = 'About Me is required';
                isValid = false;
            }
            break;
        case 3:
            field = document.getElementById('image');
            if (!field.value) {
                messageDiv.innerHTML = 'Image is required';
                isValid = false;
            }
            field = document.getElementById('imagePositionX');
            if (!field.value) {
                messageDiv.innerHTML = 'Image Position X is required';
                isValid = false;
            }
            field = document.getElementById('imagePositionY');
            if (!field.value) {
                messageDiv.innerHTML = 'Image Position Y is required';
                isValid = false;
            }
            field = document.getElementById('imageScale');
            if (!field.value) {
                messageDiv.innerHTML = 'Image Scale is required';
                isValid = false;
            }
            break;
    }

    return isValid;
}

function submitForm() {
    if (validateStep(currentStep)) {
        const formData = new FormData(document.getElementById('welcomeForm'));

        $.ajax({
            url: 'update-profile.php',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response === "success") {
                    window.location.href = 'resumes.php';
                } else {
                    messageDiv.innerHTML = response;
                    messageDiv.classList.remove('text-success');
                    messageDiv.classList.add('text-danger');
                }
            },
			error: function(xhr, status, error) {
    			console.log("Error: " + error);
    			messageDiv.innerHTML = 'Error submitting form. Please try again.<br>' + xhr.responseText;
			}

        });
    }
}
</script>
</body>
</html>
