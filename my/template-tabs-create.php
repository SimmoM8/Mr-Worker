<ol class="nav nav-tabs" id="tabs-create">
  <li class="nav-item"> <a href="_details.php" class="nav-link d-flex">Details
    <div class="nav-arrow"></div>
    </a></li>
  <li class="nav-item"> <a href="_skills.php" class="nav-link d-flex <?php if(!isset($_SESSION['submited-details'])) { echo 'disabled'; }?>">Skills
    <div class="nav-arrow"></div>
    </a></li>
  <li class="nav-item"> <a href="_work_experience.php" class="nav-link d-flex <?php if(!isset($_SESSION['submited-skills'])) { echo 'disabled'; }?>">Work Experience
    <div class="nav-arrow"></div>
    </a></li>
  <li class="nav-item"> <a href="_education.php" class="nav-link d-flex <?php if(!isset($_SESSION['submited-work_experience'])) { echo 'disabled'; }?>">Education
    <div class="nav-arrow"></div>
    </a></li>
  <li class="nav-item"> <a class="nav-link d-flex">Finish</a></li>
</ol>
