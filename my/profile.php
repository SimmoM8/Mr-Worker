<script src="../js/profile-picture.js"></script>
<script src="../js/profile.js"></script>

<section class="dashboard container-fluid">
  <div class="background-icon"><i class="fa-solid fa-user-tie"></i></div>
  <div class="container">
    <h5 class="text-muted">Name's Resumes</h5>
    <h1>Profile</h1>
    <!-- Profile Form -->
    <form id="profileForm">
      <div class="row g-3" id="profile">
        <div class="col-md-6 row g-3"> 
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
        <div class="col-md-6 row g-3"> 
          <!-- Profile Image Preview -->
          <div class="col-12 d-flex justify-content-center">
            <div id="profileImagePreview" class="position-relative" style="width: 200px; height: 200px; border-radius: 50%; overflow: hidden; border: 2px solid #ddd;"></div>
          </div>
          
          <!-- About Me Group -->
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
            
            <!-- Change Image Button and Options -->
            <div id="changeImageWrapper dropdown" class="position-relative mt-3 d-flex justify-content-center align-items-center">
              <button id="changeImageButton" class="btn btn-primary position-absolute dropdown-toggle" id="dropdownChangeImage" data-bs-toggle="dropdown" aria-expanded="false">
              Change Image
              </button>
              <ul class="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownChangeImage">
                <li><a class="dropdown-item" id="uploadFileButton">Upload</a></li>
                <li>
                  <hr class="dropdown-divider">
                </li>
                <li><a class="dropdown-item" id="uploadCameraButton">Camera</a></li>
              </ul>
            </div>
            <input type="range" id="imageScaleSlider" class="form-range mt-3" min="1" max="5" step="0.1" value="1">
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
