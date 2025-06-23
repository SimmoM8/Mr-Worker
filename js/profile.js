import { apiRequest } from "./apiUtils.js";
import { TranslationConfig } from "./TranslationConfig.js";

export const Profile = {
  userData: null,
  adjustmentX: 0,
  adjustmentY: 0,
  adjustmentScale: 1,
  rotationAngle: 0,
  dragging: false,
  startX: 0,
  startY: 0,

  profileImagePreview: null,
  editableImageContainer: null,
  overlayHTML: `
    <div class="overlay position-absolute w-100 h-100 d-flex justify-content-center align-items-center"
        style="background-color: rgba(0, 0, 0, 0.5); color: white; opacity: 0; transition: opacity 0.3s; cursor: pointer;">
        <span>Edit</span>
    </div>
  `,
  imageScaleSlider: null,
  profileImageContainerId: '#profileImagePreview',
  editableImageContainerId: '#editableImageContainer',

  // Initialize the profile module
  init: function () {
    this.profileImagePreview = $('#profileImagePreview');
    this.editableImageContainer = $('#editableImageContainer');
    this.imageScaleSlider = $('#imageScaleSlider');

    this.bindEvents();
    this.renderImage(this.profileImageContainerId, true);
    this.fetchProfileData();
    TranslationConfig.onUpdate(() => {
      Profile.renderProfileView();
    });
  },

  bindEvents: function () {
    this.profileImagePreview.on('mouseenter', function () {
      $(this).find('.overlay').css('opacity', 1);
    });

    this.profileImagePreview.on('mouseleave', function () {
      $(this).find('.overlay').css('opacity', 0);
    });

    this.profileImagePreview.on('click', '.overlay', function () {
      Profile.openEditModal();
    });
    $('#saveProfilePictureButton').off().on('click', () => this.saveProfilePicture());

    $(this.editableImageContainerId).on('mousedown', 'img', function (e) {
      Profile.handleDragStart(e);
    });

    this.imageScaleSlider.on('input', function () {
      Profile.handleScaleChange();
    });

    $('#rotateImageButton').on('click', function () {
      Profile.rotateImage();
    });

    $('#uploadFileButton').off().on('click', () => this.uploadImage());
    $('#profileForm').off().on('submit', (e) => this.saveProfileData(e));

    $('.edit-btn').off().on('click', function () {
      const groupSelector = $(this).closest('.col-12');
      Profile.toggleEditMode(groupSelector, !$(this).hasClass('cancel-btn'));
    });

    $(document).off('click', '.save-translation').on('click', '.save-translation', () => this.saveTranslation());

    document.getElementById('editImageModal').addEventListener('shown.bs.modal', Profile.updateMaskSize);
    window.addEventListener('resize', Profile.updateMaskSize);
  },

  renderImage: function (containerSelector, addOverlay = false, altPath) {
    renderProfilePicture(containerSelector, function () {
      const container = $(containerSelector);

      if (addOverlay && !container.find('.overlay').length) {
        container.append(Profile.overlayHTML);
      }

      const img = container.find('img');
      Profile.adjustmentScale = parseFloat(img.attr('data-scale')) || 1;
      Profile.imageScaleSlider.val(Profile.adjustmentScale);
      Profile.adjustmentX = parseFloat(img.attr('data-x')) || 0;
      Profile.adjustmentY = parseFloat(img.attr('data-y')) || 0;
    }, altPath);
  },

  openEditModal: function () {
    Profile.resetEditModal();
    const modal = new bootstrap.Modal(document.getElementById('editImageModal'));
    modal.show();

    $('#editImageModal').off('shown.bs.modal').on('shown.bs.modal', function () {
      const container = $(Profile.editableImageContainerId);
      const containerWidth = container.width();

      Profile.renderImage(Profile.editableImageContainerId, false);

      const img = container.find('img');
      Profile.adjustmentScale = parseFloat(img.attr('data-scale')) || 1;
      Profile.adjustmentX = (parseFloat(img.attr('data-x')) / containerWidth || 0) * containerWidth;
      Profile.adjustmentY = (parseFloat(img.attr('data-y')) / containerWidth || 0) * containerWidth;

      Profile.imageScaleSlider.val(Profile.adjustmentScale);
      img.css({
        transform: `translate(-50%, -50%) translate(${Profile.adjustmentX}px, ${Profile.adjustmentY}px) scale(${Profile.adjustmentScale})`
      });
    });
  },

  resetEditModal: function () {
    Profile.adjustmentX = 0;
    Profile.adjustmentY = 0;
    Profile.adjustmentScale = 1;

    const scaleSlider = document.getElementById('imageScaleSlider');
    if (scaleSlider) scaleSlider.value = 1;

    $('#editableImageContainer').html('');
    $('.edit-mask').css('visibility', 'hidden');
  },

  saveProfilePicture: function () {
    const container = $(Profile.editableImageContainerId);
    const containerWidth = container.width();

    const imgPosXRatio = Profile.adjustmentX / containerWidth;
    const imgPosYRatio = Profile.adjustmentY / containerWidth;

    $.ajax({
      url: 'save_image.php',
      type: 'POST',
      data: {
        img_scale: Profile.adjustmentScale,
        img_pos_x: imgPosXRatio,
        img_pos_y: imgPosYRatio
      },
      success: function (response) {
        if (response.success) {
          Profile.renderImage(Profile.profileImageContainerId, true);
          renderProfilePicture('#sidebarProfileContainer');
          Profile.resetEditModal();
          $('#editImageModal').modal('hide');
        } else {
          alert(response.error || 'An error occurred while saving the image.');
        }
      },
      error: function () {
        alert('Failed to save profile picture.');
      }
    });
  },

  handleDragStart: function (e) {
    e.preventDefault();
    Profile.dragging = true;
    const img = $(e.target);

    Profile.startX = e.pageX;
    Profile.startY = e.pageY;

    const imgWidth = img.width();
    const imgHeight = img.height();

    const container = $(Profile.editableImageContainerId);
    const profilePicture = container.find('.profile-picture');
    const containerWidth = container.width();
    const profileWidth = profilePicture.width();

    const scale = Profile.adjustmentScale;


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
      if (Profile.dragging) {

        // Calculate translation values
        const deltaX = e.pageX - Profile.startX;
        const deltaY = e.pageY - Profile.startY;
        // Update cumulative translations
        let newAdjustmentX = Profile.adjustmentX + deltaX;
        let newAdjustmentY = Profile.adjustmentY + deltaY;


        // Enforce boundaries
        newAdjustmentX = Math.max(m - k, Math.min(k - m, newAdjustmentX));
        newAdjustmentY = Math.max(m - j, Math.min(j - m, newAdjustmentY));

        Profile.adjustmentX = newAdjustmentX;
        Profile.adjustmentY = newAdjustmentY;

        // Apply translation to the image
        img.css({
          transform: `translate(-50%, -50%) translate(${Profile.adjustmentX}px, ${Profile.adjustmentY}px) scale(${Profile.adjustmentScale}) rotate(${Profile.rotationAngle}deg)`
        });

        Profile.startX = e.pageX;
        Profile.startY = e.pageY;
      }
    });

    $(document).on('mouseup', function () {
      Profile.dragging = false; // Disable dragging state

      // Hide the edit mask and set overflow back to hidden
      $('.edit-mask').css({
        visibility: 'hidden',
      }); // Hide the mask

      profilePicture.css({
        overflow: 'hidden'
      }); // Hide overflowing parts of the image
      $(document).off('mousemove mouseup');
    });
  },

  handleScaleChange: function () {
    const container = $(Profile.editableImageContainerId);
    const img = container.find('img');

    const previousScale = Profile.adjustmentScale;
    const imgWidth = img.width() * previousScale;
    const imgHeight = img.height() * previousScale;

    const ratioKonstantX = imgWidth / (4 * Profile.adjustmentX);
    const ratioKonstantY = imgHeight / (4 * Profile.adjustmentY);

    Profile.adjustmentScale = parseFloat(Profile.imageScaleSlider.val()) || 1;

    const newImgWidth = img.width() * Profile.adjustmentScale;
    const newImgHeight = img.height() * Profile.adjustmentScale;

    Profile.adjustmentX = newImgWidth / (4 * ratioKonstantX);
    Profile.adjustmentY = newImgHeight / (4 * ratioKonstantY);

    // Enforce boundaries
    const containerWidth = container.width(); // Container width
    const containerHeight = container.height(); // Container height

    const minX = containerWidth / 2 - newImgWidth / 2;
    const maxX = containerWidth / 2 + newImgWidth / 2 - containerWidth;

    const minY = containerHeight / 2 - newImgHeight / 2;
    const maxY = containerHeight / 2 + newImgHeight / 2 - containerHeight;

    Profile.adjustmentX = Math.min(maxX, Math.max(minX, Profile.adjustmentX));
    Profile.adjustmentY = Math.min(maxY, Math.max(minY, Profile.adjustmentY));
    img.css({
      transform: `translate(-50%, -50%) translate(${Profile.adjustmentX}px, ${Profile.adjustmentY}px) scale(${Profile.adjustmentScale}) rotate(${Profile.rotationAngle}deg)`
    });
  },

  rotateImage: function () {
    Profile.rotationAngle = (Profile.rotationAngle + 90) % 360;
    const img = $(Profile.editableImageContainerId).find('img');

    img.css({
      transform: `translate(-50%, -50%) translate(${Profile.adjustmentX}px, ${Profile.adjustmentY}px) scale(${Profile.adjustmentScale}) rotate(${Profile.rotationAngle}deg)`
    });
  },

  fetchProfileData: function () {
    const { selectedLangKey } = TranslationConfig.getConfig();

    apiRequest("users", "fetch").then((response) => {
      if (response.success && response.data.length > 0) {
        console.log("Profile data fetched successfully:", response.data);
        Profile.userData = response.data[0];
        Profile.renderProfileView();
      } else {
        alert(response.message || "Failed to fetch user data.");
      }
    });
  },

  renderProfileView: function () {
    if (!this.userData) return;

    const response = this.userData;
    const { translateMode, selectedLangKey } = TranslationConfig.getConfig();

    $('#inputFirstName').val(response.first_name);
    $('#inputLastName').val(response.last_name);
    $('#inputCountryCode').val(response.country_code);
    $('#inputMobile').val(response.mobile);
    $('#inputStreet').val(response.street);
    $('#inputTown').val(response.town);
    $('#inputPostCode').val(response.post_code);
    $('#inputCountry').val(response.country);
    $('#inputAboutMe').val(response.about_me[selectedLangKey]);

    $('#displayName').text(`${response.first_name} ${response.last_name}`);
    $('#displayMobile').text(`${response.country_code} ${response.mobile}`);
    $('#displayAddress').html(`${response.street}<br>${response.town}, ${response.post_code}<br>${response.country[selectedLangKey]}`);

    $('#displayAbout').text(response.about_me[selectedLangKey] || 'No information provided.');

    $('#displayAbout').next('.d-flex.align-items-center').remove(); // remove old translation input

    if (translateMode) {
      this.addTranslationInput(
        response[`about_me_translation_${selectedLangKey}`],
        'about_me',
        'users'
      );
    }
  },

  addTranslationInput: function (value, column, call) {
    $('#displayAbout').after(`
        <div class="d-flex align-items-center mt-2">
          <input type="text" class="form-control translate-input" placeholder="Enter translation" value="${value || ''}" data-column="${column}" data-call="${call}">
          <button class="btn btn-success btn-sm ms-2 save-translation" data-column="${column}" data-call="${call}">Save</button>
        </div>
      `);
  },

  saveTranslation: function () {
    const input = $('.translate-input');
    const column = input.data("column");
    const call = input.data("call");
    const id = input.data('id');
    const inputValue = input.val().trim();

    if (!inputValue) {
      alert('Please enter a valid translation.');
      return;
    }

    $.ajax({
      url: 'update-translation.php',
      method: 'POST',
      data: { id, call, column, inputValue },
      success: function (response) {
        if (response.success) {
          alert('Translation saved successfully.');
          Profile.fetchProfileData(); // Refresh the profile data
        } else {
          alert(response.error || 'An error occurred while saving the translation.');
        }
      },
      error: function () {
        alert('Failed to save translation.');
      }
    });
  },

  toggleEditMode: function (groupSelector, isEditing) {
    const group = $(groupSelector);

    if (isEditing) {
      group.find('.edit-group').removeClass('d-none');
      group.find('.display-group').addClass('d-none');
      group.find('.edit-btn').text('Cancel').addClass('cancel-btn');
    } else {
      group.find('.edit-group').addClass('d-none');
      group.find('.display-group').removeClass('d-none');
      group.find('.edit-btn').text('Edit').removeClass('cancel-btn');
    }
  },

  saveProfileData: function (e) {
    e.preventDefault();

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

    $.ajax({
      url: 'update-profile.php',
      method: 'POST',
      data: data,
      success: function (response) {
        if (response.success) {
          Profile.renderProfileView(data);
        } else {
          alert(response.error || 'An error occurred while saving the profile.');
        }
      },
      error: function () {
        // Show error message
        showMessage('Failed to save profile data.', false);
      }
    });
  },

  showMessage: function (message, isSuccess = true) {
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

    $('body').append(messageBubble);

    setTimeout(() => {
      messageBubble.fadeOut(300, () => {
        messageBubble.remove();
      });
    }, 3000);
  },

  uploadImage: function () {
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
              Profile.resetEditModal();
              Profile.renderImage(Profile.editableImageContainerId, false, result.filePath);
            } else {
              alert('Failed to upload image: ' + result.message);
            }
          },
          error: function () {
            alert('Failed to upload the image.');
          }
        });
      }
      fileInput.remove();
    });
  },

  updateMaskSize: function () {
    const container = document.getElementById('editableImageContainer');
    const mask = document.querySelector('.edit-mask');

    if (container && mask) {
      const containerWidth = container.offsetWidth;
      const maskSize = containerWidth / 2;
      mask.style.maskImage = `radial-gradient(circle ${maskSize}px at center, transparent ${maskSize - 1}px, white ${maskSize + 1}px)`;
      mask.style.webkitMaskImage = `radial-gradient(circle ${maskSize}px at center, transparent ${maskSize - 1}px, white ${maskSize + 1}px)`;
    }
  },
};