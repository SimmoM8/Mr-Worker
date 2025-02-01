<!-- Modal -->
<div class="modal fade" id="modal-experience" data-entry-type="" data-bs-backdrop="static" tabindex="-1" aria-labelledby="modalExperience" aria-hidden="true">
  <div class="modal-dialog custom-modal modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="modalTitleExperience">Add Entry</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form id="form-experience">
          <!-- Organization fields for work experience -->
          <div id="organization-field-work">
            <label for="employer" class="form-label">Company/Organization</label>
            <input type="text" class="form-control" id="employer" name="employer" placeholder="Apple" required>
          </div>
          <!-- Position fields for work experience -->
          <div id="position-field-work">
            <label for="job_position" class="form-label">Job Position</label>
            <input type="text" class="form-control" id="job_position" name="job_position" placeholder="Shop Manager" required>
          </div>
          <!-- Organization fields for education -->
          <div id="organization-field-education" style="display: none;">
            <label for="school" class="form-label">School</label>
            <input type="text" class="form-control" id="school" name="school" placeholder="Harvard University" required>
          </div>
          <!-- Position fields for education -->
          <div id="position-field-education" style="display: none;">
            <label for="course" class="form-label">Course</label>
            <input type="text" class="form-control" id="course" name="course" placeholder="Bachelor of Science" required>
          </div>
          <!-- City and Country Fields Inline -->
          <div class="row mb-3">
            <div class="col">
              <label for="city" class="form-label">City</label>
              <input type="text" class="form-control" id="city" name="city" placeholder="City" required>
            </div>
            <div class="col">
              <label for="country" class="form-label">Country</label>
              <input type="text" class="form-control" id="country" name="country" placeholder="Country" required>
            </div>
          </div>
          
          <!-- Start Date Fields Inline -->
          <div class="row mb-3">
            <div class="col">
              <label for="start_month" class="form-label">Start Date</label>
              <div class="d-flex">
                <select id="start_month" name="start_month" class="form-control me-2" required>
                  <option value="">Month</option>
                  <!-- JavaScript will populate months here -->
                </select>
                <select id="start_year" name="start_year" class="form-control" required>
                  <option value="">Year</option>
                  <!-- JavaScript will populate years here -->
                </select>
              </div>
            </div>
            
            <!-- End Date Fields Inline -->
            <div class="col">
              <div id="end-date-container">
                <label for="end_month" class="form-label">End Date</label>
                <div class="d-flex">
                  <select id="end_month" name="end_month" class="form-control me-2">
                    <!-- JavaScript will populate months here -->
                  </select>
                  <select id="end_year" name="end_year" class="form-control">
                    <!-- JavaScript will populate years here -->
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="form-check form-switch mt-3">
            <input class="form-check-input" type="checkbox" id="current_job" name="current_job">
            <label class="form-check-label" for="current_job">Currently working here</label>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary main-btn" data-bs-dismiss="modal" aria-label="Cancel">Cancel</button>
        <button type="button" class="btn btn-primary main-btn" id="addEntryBtn">Add</button>
        <button type="button" class="btn btn-primary main-btn" id="updateEntryBtn">Save</button>
      </div>
    </div>
  </div>
</div>
