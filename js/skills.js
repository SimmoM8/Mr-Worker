$(document).ready(function () {
  const skillCategories = ["hard_skills", "soft_skills", "languages", "licenses"];
  fetchSkills(skillCategories);
  setupEventListeners();
});

/**
 * Fetch and populate skills for the given categories.
 * @param {Array} categories - Array of skill categories to fetch.
 */
function fetchSkills(categories) {
  categories.forEach(category => {
    ajaxRequest('fetch.php', 'GET', { call: category }, data => {
      const skillList = data;
      const skillContainer = $(`#${category}`);

      skillContainer.empty(); // Clear existing content

      skillList.forEach(skill => {
        skillContainer.append(
          category === "licenses"
            ? createLicenseItem(skill)
          : category === "languages"
            ? createLanguageSkill(skill)
            : createSkillItem(skill)
        );
      });
    });
  });
}

/**
 * General AJAX request handler.
 * @param {string} url - Request URL.
 * @param {string} method - Request method (GET, POST).
 * @param {object} data - Data to send with the request.
 * @param {function} onSuccess - Callback for successful request.
 */
function ajaxRequest(url, method, data, onSuccess) {
  $.ajax({
    url,
    type: method,
    data,
    success: onSuccess,
    error: function () {
      console.error(`Error in ${url}`);
    },
  });
}

/**
 * Create a language skill item.
 * @param {object} skill - Skill data.
 * @returns {string} HTML string for a language skill item.
 */
function createLanguageSkill(skill) {
  return `
    <li class="skill-item list-group-item" data-id="${skill.id}" data-percentage="${skill.percentage}">
      <button class="menu-btn btn-outline-danger delete-point" data-id="${skill.id}">
        <i class="fas fa-trash-alt"></i>
      </button>
      <span>${skill.language} - <span class="percentage-display">${skill.percentage}</span>%</span>
      <div class="progress mt-2 position-relative">
        <div class="progress-bar" role="progressbar" style="width: ${skill.percentage}%;" aria-valuenow="${skill.percentage}" aria-valuemin="0" aria-valuemax="100"></div>
        <input type="range" class="form-range language-slider position-absolute w-100" min="0" max="100" value="${skill.percentage}" style="opacity: 0; transition: opacity 0.2s;">
      </div>
    </li>
  `;
}

/**
 * Create a regular skill item.
 * @param {object} skill - Skill data.
 * @returns {string} HTML string for a skill item.
 */
function createSkillItem(skill) {
  return `
    <li class="skill-item d-flex list-group-item list-group-item-action" style="align-items: center;" data-id="${skill.id}">
      <button class="menu-btn btn-outline-danger delete-point" data-id="${skill.id}">
        <i class="fas fa-trash-alt"></i>
      </button>
      <span class="point-text">${skill.skill}</span>
    </li>
  `;
}

/**
 * Set up event listeners for skill interaction.
 */
function setupEventListeners() {
  $(document)
    .on('mouseover', '.progress', handleSliderHover)
    .on('mouseout', '.progress', handleSliderLeave)
    .on('input', '.language-slider', handleSliderChange)
    .on('click', '.skill-item', handleSkillEdit)
    .on('click', '.delete-point', handleSkillDelete)
    .on('click', '.edit-license', handleLicenseEdit);
}

/**
 * Show the slider on hover.
 */
function handleSliderHover() {
  const slider = $(this).find('.language-slider');
  slider.css('opacity', 1); // Reveal the slider
}

/**
 * Hide the slider when the mouse leaves the progress bar.
 */
function handleSliderLeave() {
  const slider = $(this).find('.language-slider');
  slider.css('opacity', 0); // Hide the slider
}

/**
 * Update the percentage in real time when the slider is dragged.
 */
function handleSliderChange() {
  const slider = $(this);
  const skillItem = slider.closest('.skill-item');
  const newPercentage = slider.val();
  const skillId = skillItem.data('id');

  skillItem.find('.percentage-display').text(newPercentage);
  skillItem.find('.progress-bar').css('width', `${newPercentage}%`);

  ajaxRequest(
    'update-point.php',
    'POST',
    {
      pointId: skillId,
      call: 'languages',
      percentage: newPercentage,
    },
    () => console.log(`Updated language percentage to ${newPercentage}%`)
  );
}

/**
 * Add a new skill to the specified category.
 * @param {string} category - Skill category to add to.
 */
function addSkill(category) {
  const inputSelector = `#input_${category}`;
  const inputValue = $(inputSelector).val().trim();
  if (!inputValue) {
    alert("Please enter a value!");
    return;
  }

  const postData = {
    call: category,
    input: inputValue
  };

  // For languages, add a default percentage of 50%
  if (category === "languages") {
    postData.input_2 = 50;
  }

  ajaxRequest(
    'add-skill.php',
    'POST',
    postData,
    () => {
      fetchSkills([category]); // Refresh the skill list
      $(inputSelector).val(''); // Clear the input field
    }
  );
}

/**
 * Handle editing a regular skill.
 */
function handleSkillEdit(event) {
  if ($(event.target).is('input, .delete-point')) return;

  const skillItem = $(this);
  const pointText = skillItem.find('.point-text');
  const originalValue = pointText.text().trim();

  pointText.html(`<input type="text" class="skill-item-input form-control" value="${originalValue}">`);
  const inputField = pointText.find('.skill-item-input');
  inputField.focus();

  inputField.on('blur keypress', function (e) {
    if (e.type === 'blur' || (e.type === 'keypress' && e.which === 13)) {
      const newValue = $(this).val().trim();

      if (newValue && newValue !== originalValue) {
        ajaxRequest(
          'update-point.php',
          'POST',
          {
            pointId: skillItem.data('id'),
            call: skillItem.closest('ul').attr('id'),
            editedPoint: newValue,
          },
          () => fetchSkills([skillItem.closest('ul').attr('id')])
        );
      } else {
        pointText.text(originalValue);
      }
    }
  });
}

/**
 * Handle deleting a skill.
 */
function handleSkillDelete(event) {
  event.stopPropagation();

  const skillItem = $(this).closest('.skill-item');
  const skillId = skillItem.data('id');
  const category = skillItem.closest('ul').attr('id'); // Determine skill category

  if (confirm('Are you sure you want to delete this skill?')) {
    ajaxRequest(
      'delete-point.php',
      'POST',
      {
        pointId: skillId,
        call: category,
      },
      () => fetchSkills([category]) // Refresh the list on success
    );
  }
}

/**
 * Create a license item with edit and delete options.
 * @param {object} license - License data.
 * @returns {string} HTML string for a license item.
 */
function createLicenseItem(license) {
  return `
    <li class="skill-item list-group-item" data-id="${license.id}">
      <button class="menu-btn btn-outline-danger delete-point" data-id="${license.id}">
        <i class="fas fa-trash-alt"></i>
      </button>
      <span class="license-name">${license.license}</span>
      <p class="license-description">${license.description}</p>
      <button class="btn btn-sm btn-secondary edit-license">Edit</button>
    </li>
  `;
}

/**
 * Add a new license to the database.
 */
function addLicense() {
  const licenseName = $('#input_license').val().trim();
  const licenseDescription = $('#input_license_description').val().trim();

  if (!licenseName || !licenseDescription) {
    alert("Please enter both a license name and description!");
    return;
  }

  ajaxRequest(
    'add-skill.php',
    'POST',
    {
      call: 'licenses',
      input: licenseName,
      input_2: licenseDescription,
    },
    () => {
      fetchSkills(['licenses']); // Refresh the licenses list
      $('#input_license').val('');
      $('#input_license_description').val('');
    }
  );
}

/**
 * Handle editing a license.
 */
function handleLicenseEdit() {
  const licenseItem = $(this).closest('.skill-item');
  const licenseName = licenseItem.find('.license-name').text().trim();
  const licenseDescription = licenseItem.find('.license-description').text().trim();

  const nameInput = `<input type="text" class="form-control license-name-input" value="${licenseName}">`;
  const descInput = `<input type="text" class="form-control license-description-input" value="${licenseDescription}">`;

  licenseItem.find('.license-name').html(nameInput);
  licenseItem.find('.license-description').html(descInput);

  // Save changes on blur or Enter key
  $('.license-name-input, .license-description-input').on('blur keypress', function (e) {
    if (e.type === 'blur' || (e.type === 'keypress' && e.which === 13)) {
      const newName = licenseItem.find('.license-name-input').val().trim();
      const newDescription = licenseItem.find('.license-description-input').val().trim();
		
      if (newName && newDescription) {
        ajaxRequest(
          'update-point.php',
          'POST',
          {
            pointId: licenseItem.data('id'),
            call: 'licenses',
            license: newName,
            description: newDescription,
          },
          () => fetchSkills(['licenses'])
        );
      }
    }
  });
}