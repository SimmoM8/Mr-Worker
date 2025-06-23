<!--

Ideas:<br>
    element image in teh form of the resume design, styled with chosen colors of that resume as preview image for each resume.<br>
    Filtering and sorting<br>

-->

<!-- The Dashboard -->
<section class="dashboard container-fluid">
  <div class="background-icon"><i class="fa-solid fa-file-lines"></i></div>
  <div class="container">
    <h1>My Resumes</h1>
    <p class="alert"></p>
    <div class="row resumes-grid row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4"> </div>
  </div>
</section>
<!-- Modal -->
<div class="modal fade" id="modal_resume" data-bs-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="modalResume" aria-hidden="true">
  <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="modalTitleAddResume">Manage Resume</h5>
        <!-- Navigation for Edit Mode -->
        <nav id="nav-edit">
          <div class="nav nav-tabs">
            <button class="nav-link active" id="modal-edit-nav-details-tab" data-current="details" data-bs-toggle="tab" data-bs-target="#modal-content" type="button" role="tab" aria-controls="modal-content" aria-selected="true">Details</button>
            <button class="nav-link" id="modal-edit-nav-skills-tab" data-current="skills" data-bs-toggle="tab" data-bs-target="#modal-content" type="button" role="tab" aria-controls="modal-content" aria-selected="false">Skills</button>
            <button class="nav-link" id="modal-edit-nav-work_experience-tab" data-current="work_experience" data-bs-toggle="tab" data-bs-target="#modal-content" type="button" role="tab" aria-controls="modal-content" aria-selected="false">Work Experience</button>
            <button class="nav-link" id="modal-edit-nav-education-tab" data-current="education" data-bs-toggle="tab" data-bs-target="#modal-content" type="button" role="tab" aria-controls="modal-content" aria-selected="false">Education</button>
          </div>
        </nav>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick="Resumes.closeModal()"></button>
      </div>
      <div class="modal-body">
        <!-- Navigation for New Mode -->
        <nav id="nav-new">
          <div class="nav nav-pills nav-fill">
            <button class="nav-link active" id="modal-new-nav-details-tab" data-current="details" data-bs-toggle="tab" data-bs-target="#modal-content" type="button" role="tab" aria-controls="modal-content" aria-selected="true">Details</button>
            <button class="nav-link" id="modal-new-nav-skills-tab" data-current="skills" data-bs-toggle="tab" data-bs-target="#modal-content" type="button" role="tab" aria-controls="modal-content" aria-selected="false" disabled>Skills</button>
            <button class="nav-link" id="modal-new-nav-work_experience-tab" data-current="work_experience" data-bs-toggle="tab" data-bs-target="#modal-content" type="button" role="tab" aria-controls="modal-content" aria-selected="false" disabled>Work Experience</button>
            <button class="nav-link" id="modal-new-nav-education-tab" data-current="education" data-bs-toggle="tab" data-bs-target="#modal-content" type="button" role="tab" aria-controls="modal-content" aria-selected="false" disabled>Education</button>
          </div>
        </nav>

        <!-- Tab Content -->
        <div class="tab-content" id="nav-tabContent" style="overflow-y: auto; height: 100%;">
          <div class="tab-pane fade show active" id="modal-content" role="tabpanel" tabindex="0" style="height: 100%;"> </div>
        </div>
      </div>
      <div class="modal-footer">
        <!-- Buttons -->
        <button type="button" class="btn btn-secondary main-btn" id="cancelBtn" data-bs-dismiss="modal" aria-label="Cancel" onClick="Resumes.closeModal()">Cancel</button>
        <button type="button" class="btn btn-primary main-btn" id="submitBtn">Next</button>
        <button type="button" class="btn btn-secondary main-btn" id="closeBtn" data-bs-dismiss="modal" aria-label="Close" onClick="Resumes.closeModal()">Close</button>
        <button type="button" class="btn btn-primary main-btn" id="updateBtn">Save</button>
      </div>
    </div>
  </div>
</div>
<script>
  if (typeof Resumes !== "undefined" && Resumes.init) {
    Resumes.init(); // Initialize Experience.js for this page
  }
</script>