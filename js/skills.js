// Global Skills namespace
const Skills = {
  translateMode: false,

  init: function () {
    const skillCategories = ["hard_skills", "soft_skills", "languages", "licenses"];
    this.fetchSkills(skillCategories);
    this.setupEventListeners();
  },

  ajaxRequest: function (url, method, data, onSuccess) {
    $.ajax({
      url,
      type: method,
      data,
      success: onSuccess,
      error: function () {
        console.error(`Error in ${url}`);
      },
    });
  },

  fetchSkills: function (categories) {

    categories.forEach(category => {
      this.ajaxRequest('fetch.php', 'GET', { call: category }, response => {
        const selectedLanguage = response.selected_language;
        const nullMessage = response.null_message;
        const skillList = response.data;
        const skillContainer = $(`#${category}`);

        skillContainer.empty();

        skillList.forEach(skill => {
          skillContainer.append(
            category === "licenses"
              ? this.createLicenseItem(skill, category)
              : category === "languages"
                ? this.createLanguageSkill(skill, category)
                : this.createSkillItem(skill, category)
          );
        });
      });
    });
  },

  createSkillItem: function (skill, call) {
    return `
      <li class="skill-item list-group-item list-group-item-action" style="align-items: center;" data-id="${skill.id}">
        <div class="d-flex">
          <button class="menu-btn shrink btn-outline-danger delete-point" data-id="${skill.id}">
            <i class="fas fa-square-minus"></i>
          </button>
          <span class="point-text ${!skill.skill || Skills.translateMode ? 'null_message' : ''}">${Skills.translateMode ? skill.ref_skill : skill.skill || skill.ref_skill}</span>
        </div>
        ${this.renderTranslationInput(skill.id, "skill", skill.skill, call)}
      </li>
    `;
  },

  createLanguageSkill: function (skill, call) {
    return `
      <li class="skill-item list-group-item" data-id="${skill.id}" data-percentage="${skill.percentage}">
        <button class="menu-btn shrink btn-outline-danger delete-point" data-id="${skill.id}">
          <i class="fas fa-square-minus"></i>
        </button>
        <span class="${!skill.language || Skills.translateMode ? 'null_message' : ''}">${Skills.translateMode ? skill.ref_language : skill.language || skill.ref_language} - <span class="percentage-display">${skill.percentage}</span>%</span>
        ${this.renderTranslationInput(skill.id, "language", skill.language, call)}
        <div class="progress mt-2 position-relative">
          <div class="progress-bar" role="progressbar" style="width: ${skill.percentage}%;"></div>
          <input type="range" class="form-range language-slider position-absolute w-100" min="0" max="100" value="${skill.percentage}" style="opacity: 0; transition: opacity 0.2s;">
        </div>
      </li>
    `;
  },

  createLicenseItem: function (license, call) {
    return `
      <li class="skill-item list-group-item" data-id="${license.id}">
        <button class="menu-btn btn-outline-danger delete-point" data-id="${license.id}">
          <i class="fas fa-trash-alt"></i>
        </button>
        <span class="license-name ${!license.license || Skills.translateMode ? 'null_message' : ''}">${Skills.translateMode ? license.ref_license : license.license || license.ref_license}</span>
        ${this.renderTranslationInput(license.id, "license", license.license, call)}
        <p class="license-description ${!license.description || Skills.translateMode ? 'null_message' : ''}">${Skills.translateMode ? license.ref_description : license.description || license.ref_description}</p>
        ${this.renderTranslationInput(license.id, "description", license.description, call)}
      </li>
    `;
  },

  renderTranslationInput: function (id, column, value, call) {
    if (this.translateMode) {
      return `
        <div class="d-flex align-items-center mt-2">
          <input type="text" class="form-control translate-input" placeholder="Enter translation" value="${value || ''}" data-id="${id}" data-column="${column}" data-call="${call}">
          <button class="btn btn-success btn-sm ms-2 save-translation" data-id="${id}" data-column="${column}" data-call="${call}">Save</button>
        </div>
      `;
    }
    return '';
  },

  setupEventListeners: function () {
    $(document)
      .on('click', '.delete-point', this.handleSkillDelete.bind(this))
      .on('click', '.save-translation', this.handleTranslationSave.bind(this))
      .on('mouseover', '.progress', this.handleSliderHover)
      .on('mouseout', '.progress', this.handleSliderLeave)
      .on('input', '.language-slider', this.handleSliderChange.bind(this))
      .on('click', '.skill-item', this.handleSkillEdit.bind(this))
      .on('click', '.edit-license', this.handleLicenseEdit.bind(this));
  },

  handleSliderHover: function () {
    const slider = $(this).find('.language-slider');
    slider.css('opacity', 1);
  },

  handleSliderLeave: function () {
    const slider = $(this).find('.language-slider');
    slider.css('opacity', 0);
  },

  handleSliderChange: function () {
    const slider = $(this);
    const skillItem = slider.closest('.skill-item');
    const newPercentage = slider.val();
    const skillId = skillItem.data('id');

    skillItem.find('.percentage-display').text(newPercentage);
    skillItem.find('.progress-bar').css('width', `${newPercentage}%`);

    this.ajaxRequest(
      'update-point.php',
      'POST',
      {
        pointId: skillId,
        call: 'languages',
        percentage: newPercentage,
      }
    );
  },

  addSkill: function (category) {
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

    if (category === "languages") {
      postData.input_2 = 50; // Default percentage
    }

    this.ajaxRequest(
      'add-skill.php',
      'POST',
      postData,
      () => {
        this.fetchSkills([category]);
        $(inputSelector).val('');
      }
    );
  },

  handleSkillEdit: function (event) {
    if ($(event.target).is('input, .delete-point') || Skills.translateMode) return;

    const skillItem = $(event.currentTarget);
    const pointText = skillItem.find('.point-text');
    const originalValue = pointText.text().trim();

    pointText.html(`<input type="text" class="skill-item-input form-control" value="${originalValue}">`);
    const inputField = pointText.find('.skill-item-input');
    inputField.focus();

    inputField.on('blur keypress', (e) => {
      if (e.type === 'blur' || (e.type === 'keypress' && e.which === 13)) {
        const newValue = inputField.val().trim();

        if (newValue && newValue !== originalValue) {
          this.ajaxRequest(
            'update-point.php',
            'POST',
            {
              pointId: skillItem.data('id'),
              call: skillItem.closest('ul').attr('id'),
              editedPoint: newValue,
            },
            () => this.fetchSkills([skillItem.closest('ul').attr('id')])
          );
        } else {
          pointText.text(originalValue);
        }
      }
    });
  },

  handleSkillDelete: function (event) {
    const skillId = $(event.currentTarget).data('id');
    const category = $(event.currentTarget).closest('ul').attr('id');
    if (confirm('Are you sure you want to delete this skill?')) {
      this.ajaxRequest(
        'delete-point.php',
        'POST',
        { pointId: skillId, call: category },
        () => this.fetchSkills([category])
      );
    }
  },

  addLicense: function () {
    const licenseName = $('#input_license').val().trim();
    const licenseDescription = $('#input_license_description').val().trim();

    if (!licenseName || !licenseDescription) {
      alert("Please enter both a license name and description!");
      return;
    }

    this.ajaxRequest(
      'add-skill.php',
      'POST',
      {
        call: 'licenses',
        input: licenseName,
        input_2: licenseDescription,
      },
      () => {
        this.fetchSkills(['licenses']);
        $('#input_license').val('');
        $('#input_license_description').val('');
      }
    );
  },

  handleTranslationSave: function (event) {
    const input = $(event.currentTarget).siblings('.translate-input');
    const column = input.data("column");
    const call = input.data("call");
    const id = input.data('id');
    const inputValue = input.val().trim();

    if (inputValue) {
      this.ajaxRequest(
        'update-translation.php',
        'POST',
        {
          id,
          call,
          column,
          inputValue
        },
        () => alert('Translation saved!')
      );
    }
  },
  handleLicenseEdit: function (event) {
    const licenseItem = $(event.currentTarget).closest('.skill-item');
    const licenseName = licenseItem.find('.license-name').text().trim();
    const licenseDescription = licenseItem.find('.license-description').text().trim();

    licenseItem.find('.license-name').html(`<input type="text" class="form-control license-name-input" value="${licenseName}">`);
    licenseItem.find('.license-description').html(`<input type="text" class="form-control license-description-input" value="${licenseDescription}">`);

    $('.license-name-input, .license-description-input').on('blur keypress', function (e) {
      if (e.type === 'blur' || (e.type === 'keypress' && e.which === 13)) {
        const newName = licenseItem.find('.license-name-input').val().trim();
        const newDescription = licenseItem.find('.license-description-input').val().trim();

        if (newName && newDescription) {
          Skills.ajaxRequest(
            'update-point.php',
            'POST',
            {
              pointId: licenseItem.data('id'),
              call: 'licenses',
              license: newName,
              description: newDescription,
            },
            () => Skills.fetchSkills(['licenses'])
          );
        }
      }
    });
  }
};

$(document).ready(function () {
  Skills.init();
});
