<div class="main-nav">
  <aside
    class="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark fixed-top vh-100"
    style="width: 280px"
    id="sidebar">
    <a
      href="#"
      class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
      <svg
        class="bi me-3"
        width="40"
        height="32"
        role="img"
        aria-label="Bootstrap">
        <use xlink:href="#bootstrap"></use>
      </svg>
      <span class="fs-4">My Dashboard</span>
    </a>
    <hr />
    <ul class="sidebar-nav nav nav-pills flex-column mb-auto">
      <li class="nav-item">
        <a class="nav-link text-white active" data-page="resumes.php"><i class="fas fa-file-lines me-3"></i>Resumes</a>
      </li>
      <li class="nav-item">
        <a class="nav-link text-white" data-page="work_experience.php"><i class="fas fa-briefcase me-3"></i>Work Experience</a>
      </li>
      <li class="nav-item">
        <a class="nav-link text-white" data-page="education.php"><i class="fa-solid fa-graduation-cap me-3"></i>Education</a>
      </li>
      <li class="nav-item">
        <a class="nav-link text-white" data-page="skills.php"><i class="fa-solid fa-id-card me-3"></i>Skills</a>
      </li>
      <li class="nav-item">
        <a class="nav-link text-white" data-page="profile.php"><i class="fa-solid fa-user-tie me-3"></i>Profile</a>
      </li>
      <?php
      if ($_SESSION['user_id'] == '14') {
        echo
        "
      <li class='nav-item'>
        <a class='nav-link text-white' data-page='admin-dashboard.php'
          ><i class='fa-solid fa-lock me-3'></i>Admin</a
        >
      </li>
      ";
      }
      ?>
    </ul>
    <hr />
    <div class="dropdown">
      <a
        href="#"
        class="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
        id="dropdownUser1"
        data-bs-toggle="dropdown"
        aria-expanded="false">
        <div
          class="me-3"
          id="sidebarProfileContainer"
          style="
            width: 40px;
            height: 40px;
            overflow: hidden;
            border-radius: 50%;
            position: relative;
          "></div>
        <script>
          document.addEventListener("DOMContentLoaded", function() {
            renderProfilePicture("#sidebarProfileContainer");
          });
        </script>
        <strong>Username</strong>
      </a>
      <ul
        class="dropdown-menu dropdown-menu-dark text-small shadow"
        aria-labelledby="dropdownUser1">
        <li><a class="dropdown-item" href="_details.php">New resume...</a></li>
        <li><a class="dropdown-item" href="#">Settings</a></li>
        <li><a class="dropdown-item" href="#">Profile</a></li>
        <li>
          <hr class="dropdown-divider" />
        </li>
        <li><a class="dropdown-item" href="../sign-in.html">Sign out</a></li>
      </ul>
    </div>
  </aside>

  <!-- Bottom Navigation for Mobile -->
  <ul class="sidebar-nav nav nav-pills" id="bottom-nav">
    <li class="nav-item">
      <a data-page="resumes.php" class="nav-link text-white">
        <i class="fas fa-file-lines"></i>
        <span class="nav-text">Resumes</span>
      </a>
    </li>
    <li class="nav-item">
      <a data-page="work_experience.php" class="nav-link text-white">
        <i class="fas fa-briefcase"></i>
        <span class="nav-text">Work Experience</span>
      </a>
    </li>
    <li class="nav-item">
      <a data-page="education.php" class="nav-link text-white">
        <i class="fa-solid fa-graduation-cap"></i>
        <span class="nav-text">Education</span>
      </a>
    </li>
    <li class="nav-item">
      <a data-page="skills.php" class="nav-link text-white">
        <i class="fa-solid fa-id-card"></i>
        <span class="nav-text">Skills</span>
      </a>
    </li>
    <li class="nav-item">
      <a data-page="profile.php" class="nav-link text-white">
        <i class="fa-solid fa-user-tie"></i>
        <span class="nav-text">Profile</span>
      </a>
    </li>
  </ul>
</div>