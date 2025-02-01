<div class="col">
  <div class="card card-resumes" id="card_<?php echo htmlspecialchars($id); ?>">
    <div class="color-gradient" style="background-image: linear-gradient(to right, <?php echo isset($color1) ? $color1 : 'white'; ?>, <?php echo isset($color2) ? $color2 : 'white'; ?>">

    </div>
    <div style="position: relative;">
      <div class="card-body" style="display: flex; justify-content: space-between;">
        <div>
          <h3 class="card-text"><?php echo htmlspecialchars($name ?? 'Untitled'); ?></h3>
          <p class="card-subtitle mb-4 text-muted">Last updated <?php echo isset($last_updated) ? timeAgo($last_updated) : 'just now'; ?></p>
        </div>
        <div class="btn-icon menu-btn edit-resume-btn" id="edit_<?php echo htmlspecialchars($id); ?>" data-id="<?php echo htmlspecialchars($id); ?>">
          <i class="fas fa-pencil"></i>
        </div>
      </div>
      <!--     <ul class="list-group list-group-flush">
      <li class="list-group-item list-inline">
        <div style="display: inline-block; width: 50%">Language:</div>
        <span>English</span> </li>
    </ul> -->
      <div class="card-body" style="align-content: end;">
        <div class="buttons">
          <form action="gen-pdf.php" method="post">
            <input type="hidden" name="card_id" value="<?php echo htmlspecialchars($id); ?>">
            <button class="btn btn-primary main-btn btn-lg" name="submit">View</button>
          </form>
          <div class="btn-icon menu-btn delete-resume-btn" id="delete_<?php echo htmlspecialchars($id); ?>" data-id="<?php echo htmlspecialchars($id); ?>">
            <i class="fas fa-trash-arrow-up me-3"></i>Delete
          </div>
        </div>
      </div>
    </div>
  </div>
</div>