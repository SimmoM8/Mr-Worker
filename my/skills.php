<section class="dashboard container-fluid">
  <div class="background-icon"><i class="fa-solid fa-id-card"></i></div>
  <div class="container">
    <h1>Skills</h1>
    <div class="row">
      <div class="col card card-colored card-body">
        <h4 class="">Hard Skills</h4>
        <div class="skills">
          <ul class="list-group list-group-flush card" id="hard_skills">
            <p>Loading...</p>
          </ul>
        </div>
        <div class="input-group mb-3">
          <input type="text" class="form-control" id="input_hard_skills" placeholder="Type your skill here" data-trigger-button="#add_hard_skill_btn">
          <div class="input-group-append">
            <button id="add_hard_skill_btn" class="btn btn-outline-secondary add-item-btn" type="button" data-category="hard_skills">Add Skill</button>
          </div>
        </div>
      </div>
      <div class="col card card-colored card-body">
        <h4 class="">Soft Skills</h4>
        <div class="skills">
          <ul class="list-group list-group-flush card" id="soft_skills">
            <p>Loading...</p>
          </ul>
        </div>
        <div class="input-group mb-3">
          <input type="text" class="form-control" id="input_soft_skills" placeholder="Type your skill here" data-trigger-button="#add_soft_skill_btn">
          <div class="input-group-append">
            <button id="add_soft_skill_btn" class="btn btn-outline-secondary add-item-btn" type="button" data-category="soft_skills">Add Skill</button>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col card card-colored card-body">
        <h4 class="">Languages</h4>
        <div class="skills">
          <ul class="list-group list-group-flush card" id="languages">
            <p>Loading...</p>
          </ul>
        </div>
        <div class="input-group mb-3">
          <input type="text" class="form-control" id="input_languages" placeholder="Type a language here" data-trigger-button="#add_language_btn">
          <div class="input-group-append">
            <button id="add_language_btn" class="btn btn-outline-secondary add-item-btn" type="button" data-category="languages">Add Skill</button>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col card card-colored card-body">
        <h4 class="">Licenses</h4>
        <div class="skills">
          <ul class="list-group list-group-flush card" id="licenses">
            <p>Loading...</p>
          </ul>
        </div>
        <div class="input-group mb-3">
          <input type="text" class="form-control" id="input_license" placeholder="Enter type of license here">
          <input type="text" class="form-control" id="input_license_description" placeholder="Enter the license classes and levels here">
          <div class="input-group-append">
            <button class="btn btn-outline-secondary add-item-btn" type="button" data-category="licenses">Add License</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="modal fade" id="licenseModal" tabindex="-1" aria-labelledby="licenseModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="licenseModalLabel">Edit License</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <input type="text" id="licenseModalName" class="form-control mb-2" placeholder="License Name">
          <textarea id="licenseModalDescription" class="form-control" placeholder="License Description"></textarea>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" id="licenseModalSave">Save</button>
        </div>
      </div>
    </div>
  </div>
  <p class="alert"></p>
</section>