$(document).ready(function () {
  const profileImagePreview = $('#profileImagePreview');
  const editableImageContainer = $('#editableImageContainer');
  const overlayHTML = `
        <div class="overlay position-absolute w-100 h-100 d-flex justify-content-center align-items-center"
            style="background-color: rgba(0, 0, 0, 0.5); color: white; opacity: 0; transition: opacity 0.3s; cursor: pointer;">
            <span>Edit</span>
        </div>
    `;
  const imageScaleSlider = $('#imageScaleSlider');
  const profileImageContainerId = '#profileImagePreview';
  const editableImageContainerId = '#editableImageContainer';
  let adjustmentX = 0,
    adjustmentY = 0,
    adjustmentScale = 1;
  let dragging = false,
    startX = 0,
    startY = 0;
  let rotationAngle = 0; // Track rotation angle

  // Render the profile picture with the overlay if required
  function renderImage(containerSelector, addOverlay = false, altPath) {
	  console.log("-->");
    renderProfilePicture(containerSelector, () => {
        const container = $(containerSelector);

        // Add the overlay if needed
        if (addOverlay && !container.find('.overlay').length) {
          container.append(overlayHTML);
        }

        // Update slider after rendering the image
        const img = container.find('img');
        adjustmentScale = parseFloat(img.attr('data-scale')) || 1;
        imageScaleSlider.val(adjustmentScale);
        adjustmentX = parseFloat(img.attr('data-x')) || 0;
        adjustmentY = parseFloat(img.attr('data-y')) || 0;

      },
      altPath
    );
  }

  // Apply hover behavior to the container
  profileImagePreview.on('mouseenter', function () {
    $(this).find('.overlay').css('opacity', 1);
  });

  profileImagePreview.on('mouseleave', function () {
    $(this).find('.overlay').css('opacity', 0);
  });

  // Open modal for editing the image
  profileImagePreview.on('click', '.overlay', function () {
    resetEditModal();
    const modal = new bootstrap.Modal(document.getElementById('editImageModal'));
    modal.show();

    // Remove any previously attached 'shown.bs.modal' event listener to prevent duplicates
    $('#editImageModal').off('shown.bs.modal');

    // Add the listener to ensure rendering after the modal is fully visible
    $('#editImageModal').on('shown.bs.modal', function () {
      // Get the container width dynamically
      const container = $(editableImageContainerId);
      const containerWidth = container.width(); // Current container width

      renderImage(editableImageContainerId, false);


      // Initialize values for editing
      const img = container.find('img');
      const savedScale = parseFloat(img.attr('data-scale')) || 1;
      const savedXRatio = parseFloat(img.attr('data-x')) / containerWidth || 0;
      const savedYRatio = parseFloat(img.attr('data-y')) / containerWidth || 0;

      // Recalculate adjustments based on current container size
      adjustmentScale = savedScale;
      adjustmentX = savedXRatio * containerWidth;
      adjustmentY = savedYRatio * containerWidth;

      // Update the scale slider to reflect the current scale
      imageScaleSlider.val(adjustmentScale);

      // Apply initial transformations
      img.css({
        transform: `translate(-50%, -50%) translate(${adjustmentX}px, ${adjustmentY}px) scale(${adjustmentScale})`
      });
    });
  });

  function resetEditModal() {
    // Reset adjustment values
    adjustmentX = 0;
    adjustmentY = 0;
    adjustmentScale = 1;

    // Reset slider input
    const scaleSlider = document.getElementById('imageScaleSlider');
    if (scaleSlider) {
      scaleSlider.value = 1;
    }

    // Clear the editable image container
    const editableImageContainer = document.getElementById('editableImageContainer');
    if (editableImageContainer) {
      editableImageContainer.innerHTML = '';
    }

    // Hide edit mask (if applicable)
    const editMask = document.querySelector('.edit-mask');
    if (editMask) {
      editMask.style.visibility = 'hidden';
    }
  }

  // Save adjustments on click
  $('#saveProfilePictureButton').on('click', function () {
    const container = $(editableImageContainerId);
    const containerWidth = container.width(); // Current container width


    // Save ratios relative to the container size
    const imgPosXRatio = adjustmentX / containerWidth;
    const imgPosYRatio = adjustmentY / containerWidth;

    $.ajax({
      url: 'save_image.php',
      type: 'POST',
      data: {
        img_scale: adjustmentScale,
        img_pos_x: imgPosXRatio,
        img_pos_y: imgPosYRatio,
      },
      success: function (response) {
        if (response.success) {
          // Re-render the profile picture preview
          renderImage(profileImageContainerId, true);

          // Update the sidebar profile picture in real time
          renderProfilePicture('#sidebarProfileContainer');

          // Reset the modal
          resetEditModal();

          // Hide the modal
          $('#editImageModal').modal('hide');
        } else {
          alert(response.error || 'An error occurred while saving the image.');
        }
      },
      error: function () {
        alert('Failed to save profile picture.');
      }
    });
  });

  // Handle dragging for X/Y adjustments
  $(editableImageContainerId).on('mousedown', 'img', function (e) {
    e.preventDefault(); // Prevent default behavior
    dragging = true; // Enable dragging state
    const img = $(this);

    startX = e.pageX; // Record starting X position
    startY = e.pageY; // Record starting Y position

    // Get the dimensions of the image and the container
    const imgWidth = img.width();
    const imgHeight = img.height();

    const container = $(editableImageContainerId);
    const profilePicture = container.find('.profile-picture');
    const containerWidth = container.width();
    const profileWidth = profilePicture.width();

    const scale = adjustmentScale;

    // Calculate m, k, and j
    const m = profileWidth / 2;
    const k = (imgWidth * scale) / 2;
    const j = (imgHeight * scale) / 2;

    // Show the edit mask and make the overflow visible
    $('.edit-mask').css({
      visibility: 'visible',
    }); // Make the mask visible

    profilePicture.css({
      overflow: 'visible'
    }); // Show overflowing parts of the image

    $(document).on('mousemove', function (e) {
      if (dragging) {
        // Calculate translation values
        const deltaX = e.pageX - startX; // Change in X position
        const deltaY = e.pageY - startY; // Change in Y position

        // Update cumulative translations
        let newAdjustmentX = adjustmentX + deltaX;
        let newAdjustmentY = adjustmentY + deltaY;

        // Enforce boundaries
        newAdjustmentX = Math.max(m - k, Math.min(k - m, newAdjustmentX));
        newAdjustmentY = Math.max(m - j, Math.min(j - m, newAdjustmentY));

        adjustmentX = newAdjustmentX;
        adjustmentY = newAdjustmentY;

        // Apply translation to the image
        img.css({
          transform: `translate(-50%, -50%) translate(${adjustmentX}px, ${adjustmentY}px) scale(${adjustmentScale}) rotate(${rotationAngle}deg)`,
        });

        // Update starting positions for the next move
        startX = e.pageX;
        startY = e.pageY;
      }
    });

    $(document).on('mouseup', function () {
      dragging = false; // Disable dragging state

      // Hide the edit mask and set overflow back to hidden
      $('.edit-mask').css({
        visibility: 'hidden',
      }); // Hide the mask

      profilePicture.css({
        overflow: 'hidden'
      }); // Hide overflowing parts of the image

      $(document).off('mousemove mouseup'); // Remove event listeners
    });
  });

  // Handle scaling via slider
  imageScaleSlider.on('input', function () {
    const container = $(editableImageContainerId); // Container element
    const img = container.find('img'); // Image element

    const previousScale = adjustmentScale; // Previous scale value
    const imgWidth = img.width() * previousScale;
    const imgHeight = img.height() * previousScale;
    
    const ratioKonstantX = imgWidth / (4 * adjustmentX);
    const ratioKonstantY = imgHeight / (4 * adjustmentY);

    adjustmentScale = parseFloat($(this).val()) || 1; // New scale value

    const newImgWidth = img.width() * adjustmentScale;
    const newImgHeight = img.height() * adjustmentScale;

    adjustmentX = newImgWidth / (4 * ratioKonstantX);
    adjustmentY = newImgHeight / (4 * ratioKonstantY);

    // Enforce boundaries
    const containerWidth = container.width(); // Container width
    const containerHeight = container.height(); // Container height

    const minX = containerWidth / 2 - newImgWidth / 2;
    const maxX = containerWidth / 2 + newImgWidth / 2 - containerWidth;

    const minY = containerHeight / 2 - newImgHeight / 2;
    const maxY = containerHeight / 2 + newImgHeight / 2 - containerHeight;

    adjustmentX = Math.min(maxX, Math.max(minX, adjustmentX));
    adjustmentY = Math.min(maxY, Math.max(minY, adjustmentY));
    img.css({
      transform: `translate(-50%, -50%) translate(${adjustmentX}px, ${adjustmentY}px) scale(${adjustmentScale}) rotate(${rotationAngle}deg)`
    });
  });

  // Handle rotation
  $('#rotateImageButton').on('click', function () {
    rotationAngle = (rotationAngle + 90) % 360; // Increment angle by 90 degrees
    const img = $(editableImageContainerId).find('img');

    img.css({
      transform: `translate(-50%, -50%) translate(${adjustmentX}px, ${adjustmentY}px) scale(${adjustmentScale}) rotate(${rotationAngle}deg)`,
    });
  });

  // Initialize profile image preview
  renderImage(profileImageContainerId, true);

  // Fetch and populate user data
  $.ajax({
    url: 'fetch_profile_data.php',
    method: 'GET',
    dataType: 'json',
    success: function (response) {
      if (response.error) {
        alert(response.error);
      } else {

            // Decode safely
            const parser = new DOMParser();

        // Populate inputs
        $('#inputFirstName').val(response.first_name);
        $('#inputLastName').val(response.last_name);
        $('#inputCountryCode').val(response.country_code);
        $('#inputMobile').val(response.mobile);
        $('#inputStreet').val(response.street);
        $('#inputTown').val(response.town);
        $('#inputPostCode').val(response.post_code);
        $('#inputCountry').val(response.country);
        $('#inputAboutMe').val(response.about_me);

        // Populate display values
        $('#displayName').text(`${response.first_name} ${response.last_name}`);
        $('#displayMobile').text(`${response.country_code} ${response.mobile}`);
        $('#displayAddress').html(`${response.street}<br>${response.town}, ${response.post_code}<br>${response.country}`);
        $('#displayAbout').text(response.about_me);
      }
    },
    error: function () {
      alert('Failed to fetch user data');
    }
  });

  // Function to toggle between display and edit modes for a group
  function toggleEditMode(groupSelector, isEditing) {
    const group = $(groupSelector);

    if (isEditing) {
      // Enable editing mode
      group.find('.edit-group').removeClass('d-none');
      group.find('.display-group').addClass('d-none');
      group.find('.edit-btn').text('Cancel').addClass('cancel-btn');
    } else {
      // Cancel editing mode
      group.find('.edit-group').addClass('d-none');
      group.find('.display-group').removeClass('d-none');
      group.find('.edit-btn').text('Edit').removeClass('cancel-btn');
    }
  }

  // Toggle editing for a group when edit/cancel button is clicked
  $('.edit-btn').on('click', function () {
    const groupSelector = $(this).closest('.col-12');

    // Check if button is in cancel mode
    if ($(this).hasClass('cancel-btn')) {
      toggleEditMode(groupSelector, false); // Cancel editing
    } else {
      toggleEditMode(groupSelector, true); // Enable editing
    }
  });

  // On form submit, save the changes and switch back to display mode
  $('#profileForm').on('submit', function (e) {
    e.preventDefault();

    // Prepare data to save
    const data = {
      first_name: $('#inputFirstName').val(),
      last_name: $('#inputLastName').val(),
      country_code: $('#inputCountryCode').val(),
      mobile: $('#inputMobile').val(),
      street: $('#inputStreet').val(),
      town: $('#inputTown').val(),
      post_code: $('#inputPostCode').val(),
      country: $('#inputCountry').val(),
      about_me: $('#inputAboutMe').val(),
    };

    // Save the data to the database via AJAX
    $.ajax({
      url: 'update-profile.php',
      method: 'POST',
      data: data,
      success: function (response) {
        if (response.success) {
          // Update display values
          $('#displayName').text(`${data.first_name} ${data.last_name}`);
          $('#displayMobile').text(`${data.country_code} ${data.mobile}`);
          $('#displayAddress').html(`${data.street}<br>${data.town}, ${data.post_code}<br>${data.country}`);
          $('#displayAbout').text(data.about_me);

          // Switch back to display mode
          $('.col-12').each(function () {
            toggleEditMode(this, false);
          });

          // Show success message
          showMessage('Profile updated successfully!', true);
        } else {
          // Show error message
          showMessage(response.error || 'An error occurred while saving the profile.', false);
        }
      },
      error: function () {
        // Show error message
        showMessage('Failed to save profile data.', false);
      },
    });
  });

  // Function to show a floating message bubble
  function showMessage(message, isSuccess = true) {
    const messageBubble = $('<div>')
      .addClass('message-bubble')
      .text(message)
      .css({
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        padding: '10px 20px',
        borderRadius: '5px',
        backgroundColor: isSuccess ? '#4caf50' : '#f44336',
        color: '#fff',
        fontSize: '16px',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      });

    // Append the bubble to the body
    $('body').append(messageBubble);

    // Remove the bubble after 3 seconds
    setTimeout(() => {
      messageBubble.fadeOut(300, () => {
        messageBubble.remove();
      });
    }, 3000);
  }

  // Handle Upload option
  $('#uploadFileButton').on('click', function () {
    const fileInput = $('<input type="file" accept="image/*" style="display: none;">');
    $('body').append(fileInput);
    fileInput.trigger('click');
    fileInput.on('change', function () {
      const file = this.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        $.ajax({
          url: 'upload-image.php',
          type: 'POST',
          data: formData,
          processData: false,
          contentType: false,
          success: function (response) {
            const result = JSON.parse(response);
            if (result.status === 'success') {
				console.log("reseting modal");
              resetEditModal();
				console.log(`re-rendering image: ${response}`);
              // Re-render the editable image with the new image path
              renderImage(editableImageContainerId, false, result.filePath); // Reset adjustment values

            } else {
              alert('Failed to upload image: ' + result.message);
            }
          },
          error: function () {
            alert('Failed to upload the image.');
          },
        });
      }
      fileInput.remove();
    });
  });
});

function updateMaskSize() {
  const container = document.getElementById('editableImageContainer');
  const mask = document.querySelector('.edit-mask');
  
  if (container && mask) {
    const containerWidth = container.offsetWidth; // Get the container's width
    const maskSize = containerWidth / 2; // Adjust size to match radius of container

    // Update the mask size dynamically
    mask.style.maskImage = `radial-gradient(circle ${maskSize}px at center, transparent ${maskSize - 1}px, white ${maskSize + 1}px)`;
    mask.style.webkitMaskImage = `radial-gradient(circle ${maskSize}px at center, transparent ${maskSize - 1}px, white ${maskSize + 1}px)`;
  }
}

// Update the mask size when the modal is shown
document.getElementById('editImageModal').addEventListener('shown.bs.modal', updateMaskSize);

// Update the mask size on window resize
window.addEventListener('resize', updateMaskSize);