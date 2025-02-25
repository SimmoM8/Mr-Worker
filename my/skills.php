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
          <input type="text" class="form-control" id="input_hard_skills" placeholder="Type your skill here">
          <div class="input-group-append">
            <button class="btn btn-outline-secondary" type="button" id="add_hard_skills" name="add_hard_skills" onClick="Skills.addSkill('hard_skills')">Add Skill</button>
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
          <input type="text" class="form-control" id="input_soft_skills" placeholder="Type your skill here">
          <div class="input-group-append">
            <button class="btn btn-outline-secondary" type="button" id="add_soft_skills" name="add_soft_skills" onClick="Skills.addSkill('soft_skills')">Add Skill</button>
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
          <input type="text" class="form-control" id="input_languages" placeholder="Type a language here">
          <div class="input-group-append">
            <button class="btn btn-outline-secondary" type="button" id="add_languages" name="add_languages" onClick="Skills.addSkill('languages')">Add Skill</button>
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
          <input type="text" class="form-control" id="input_license" placeholder="Type a license name here">
          <textarea class="form-control mt-2" id="input_license_description" placeholder="Enter license description"></textarea>
          <div class="input-group-append mt-2">
            <button class="btn btn-outline-secondary" type="button" id="add_licenses" name="add_licenses" onClick="Skills.addLicense()">Add License</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <p class="alert"></p>
</section>
<script>
  if (typeof Skills !== "undefined" && Skills.init) {
    Skills.init(); // Initialize Experience.js for this page
  }
</script>