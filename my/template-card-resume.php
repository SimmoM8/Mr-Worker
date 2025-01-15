<div class="col">
  <div class="card card-resumes" id="card_<?php echo htmlspecialchars($id); ?>"> <img class="card-img-top" src="default_image.jpeg" alt="Resume image">
    <div class="card-body">
      <h3 class="card-text"><?php echo htmlspecialchars($name ?? 'Untitled'); ?></h3>
      <p class="card-subtitle mb-4 text-muted">Last updated <?php echo isset($last_updated) ? timeAgo($last_updated) : 'just now'; ?></p>
    </div>
    <ul class="list-group list-group-flush">
      <li class="list-group-item list-inline">
        <div style="display: inline-block; width: 50%">Language:</div>
        <span>English</span> </li>
    </ul>
    <div class="card-body">
      <div class="buttons">
        <form action="gen-pdf.php" method="post">
          <input type="hidden" name="card_id" value="<?php echo htmlspecialchars($id); ?>">
          <button class="btn btn-primary btn-lg" name="submit">View</button>
        </form>
        <div class="btn-icon delete-resume-btn" id="delete_<?php echo htmlspecialchars($id); ?>" data-id="<?php echo htmlspecialchars($id); ?>">
          <svg class="icon i-colored" xmlns="http://www.w3.org/2000/svg" width="14" height="18" viewBox="0 0 14 18">
            <path id="Icon_material-delete-forever" data-name="Icon material-delete-forever" d="M8.5,20.5a2.006,2.006,0,0,0,2,2h8a2.006,2.006,0,0,0,2-2V8.5H8.5Zm2.46-7.12,1.41-1.41,2.13,2.12,2.12-2.12,1.41,1.41L15.91,15.5l2.12,2.12-1.41,1.41L14.5,16.91l-2.12,2.12-1.41-1.41,2.12-2.12ZM18,5.5l-1-1H12l-1,1H7.5v2h14v-2Z" transform="translate(-7.5 -4.5)"/>
          </svg>
          Delete </div>
      </div>
    </div>
    <div class="btn-icon edit-resume-btn" id="edit_<?php echo htmlspecialchars($id); ?>" data-id="<?php echo htmlspecialchars($id); ?>">
      <svg class="icon i-colored" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
        <path data-name="Icon material-edit" d="M4.5,20.33V24.5H8.666L20.953,12.209,16.787,8.043ZM24.175,8.987a1.106,1.106,0,0,0,0-1.566l-2.6-2.6a1.106,1.106,0,0,0-1.566,0L17.976,6.854l4.166,4.166,2.033-2.033Z" transform="translate(-4.5 -4.496)"/>
      </svg>
    </div>
  </div>
</div>
