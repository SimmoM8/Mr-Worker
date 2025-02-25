<script src="../js/profile-picture.js"></script>

<section class="dashboard container-fluid">
  <div class="background-icon"><i class="fa-solid fa-user-tie"></i></div>
  <div class="container">
    <h5 class="text-muted">Name's Resumes</h5>
    <h1>Profile</h1>
    <!-- Profile Form -->
    <form id="profileForm">
      <div class="row" id="profile">

        <div class="col-md-6 g-3 d-flex">
          <!-- Profile Image Preview -->
          <div class="col-12 d-flex justify-content-center align-items-center">
            <div id="profileImagePreview" class="position-relative" style="border-radius: 50%; overflow: hidden; border: 2px solid #ddd; width: 50%;"></div>
          </div>
        </div>

        <div class="col-md-6 g-3">
          <!-- First and Last Name Group -->
          <div class="col-12 card card-body card-colored">
            <div class="justify-content-between input-group align-items-center input-group-header">
              <h4>Name</h4>
              <button type="button" class="menu-btn btn-outline-primary edit-btn"><i class="fas fa-pencil-alt"></i> Edit</button>
            </div>
            <p class="display-group" id="displayName">John Doe</p>
            <div class="row g-3 d-none edit-group">
              <div class="col-md-6">
                <label for="inputFirstName" class="form-label">First Name</label>
                <input type="text" class="form-control" id="inputFirstName" name="first_name">
              </div>
              <div class="col-md-6">
                <label for="inputLastName" class="form-label">Last Name</label>
                <input type="text" class="form-control" id="inputLastName" name="last_name">
              </div>
            </div>
          </div>

          <!-- Mobile Group -->
          <div class="col-12 card card-body card-colored">
            <div class="justify-content-between input-group align-items-center input-group-header">
              <h4>Mobile</h4>
              <button type="button" class="menu-btn btn-outline-primary edit-btn"><i class="fas fa-pencil-alt"></i> Edit</button>
            </div>
            <p class="display-group" id="displayMobile">+123 456 7890</p>
            <div class="row g-3 d-none edit-group">
              <div class="col-md-4">
                <label for="inputCountryCode" class="form-label">Country Code</label>
                <input type="text" class="form-control" id="inputCountryCode" name="country_code">
              </div>
              <div class="col-md-8">
                <label for="inputMobile" class="form-label">Mobile</label>
                <input type="text" class="form-control" id="inputMobile" name="mobile">
              </div>
            </div>
          </div>

          <!-- Address Group -->
          <div class="col-12 card card-body card-colored">
            <div class="justify-content-between input-group align-items-center input-group-header">
              <h4>Address</h4>
              <button type="button" class="menu-btn btn-outline-primary edit-btn"><i class="fas fa-pencil-alt"></i> Edit</button>
            </div>
            <p class="display-group" id="displayAddress"> 123 Main St<br>
              Springfield, 12345<br>
              USA </p>
            <div class="row g-3 d-none edit-group">
              <div class="col-12">
                <label for="inputStreet" class="form-label">Street</label>
                <input type="text" class="form-control" id="inputStreet" name="street">
              </div>
              <div class="col-md-6">
                <label for="inputTown" class="form-label">Town</label>
                <input type="text" class="form-control" id="inputTown" name="town">
              </div>
              <div class="col-md-3">
                <label for="inputPostCode" class="form-label">Post Code</label>
                <input type="text" class="form-control" id="inputPostCode" name="post_code">
              </div>
              <div class="col-md-3">
                <label for="inputCountry" class="form-label">Country</label>
                <input type="text" class="form-control" id="inputCountry" name="country">
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- About Me Group -->
      <div class="row">
        <div class="col">
          <div class="col-12 card card-body card-colored">
            <div class="justify-content-between input-group align-items-center input-group-header">
              <h4>About Me</h4>
              <button type="button" class="menu-btn btn-outline-primary edit-btn"><i class="fas fa-pencil-alt"></i> Edit</button>
            </div>
            <p class="display-group" id="displayAbout">Lorem ipsum dolor sit amet...</p>
            <div class="d-none edit-group">
              <textarea class="form-control" id="inputAboutMe" name="about_me" rows="3"></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="col-12">
        <button type="submit" class="btn btn-primary">Save</button>
      </div>
    </form>

    <!-- Edit Image Modal -->
    <div class="modal fade" id="editImageModal" tabindex="-1" aria-labelledby="editImageModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-md">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editImageModalLabel">Edit Profile Picture</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body d-flex flex-column align-items-center justify-content-center">
            <div id="editImage">
              <!-- Faded overlay with circular cutout -->
              <div class="edit-mask" style="margin: auto; position: absolute; z-index: 2;"></div>
              <!-- Profile Picture Container -->
              <div class="edit-image-container text-center position-relative" id="editableImageContainer"></div>
            </div>
            <div class="card card-colored d-flex flex-column align-items-center mt-3" style="position: absolute; right: var(--bs-modal-padding); z-index: 2;">
              <div class="slider-container d-flex flex-column align-items-center">
                <input type="range" id="imageScaleSlider" class="form-range mt-3" min="1" max="5" step="0.1" value="1">
              </div>
              <!-- Rotation Button -->
              <button id="rotateImageButton" class="menu-btn mt-3">
                <i class="fa-solid fa-undo"></i>
              </button>

            </div>
            <!-- Change Image Button and Options -->
            <div class="position-relative mt-3 d-flex justify-content-center align-items-center">
              <button id="uploadFileButton" class="btn btn-primary">
                Change Image
              </button>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" id="saveProfilePictureButton">Save</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
<script>
  if (typeof Profile !== "undefined" && Profile.init) {
    Profile.init(); // Initialize profile.js for this page
  }
</script>