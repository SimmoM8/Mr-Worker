// Global Skills namespace
const Skills = {
  translateMode: false,

  // Initialization
  init: function () {
    const skillCategories = ["hard_skills", "soft_skills", "languages", "licenses"];
    this.fetchSkills(skillCategories);
    this.setupEventListeners();
  },

  // Event bindings
  setupEventListeners: function () {
    const doc = $(document);

    doc.off('click', '.save-translation')
      .off('mouseover', '.progress')
      .off('mouseout', '.progress')
      .off('change', '.language-slider')
      .off('click', '.edit-license')
      .off('click', '.add-item-btn');

    doc.on('click', '.save-translation', this.handleTranslationSave.bind(this))
      .on('mouseover', '.progress', this.handleSliderHover)
      .on('mouseout', '.progress', this.handleSliderLeave)
      .on('change', '.language-slider', function (e) {
        Skills.handleSliderChange.call(this, e);
      })
      .on('click', '.edit-license', this.handleLicenseEdit.bind(this))
      .on("click", ".add-item-btn", function () {
        const category = $(this).data("category");

        switch (category) {
          case "hard_skills":
          case "soft_skills": {
            SkillPointManager.add({
              category,
              input: $(`#input_${category}`).val().trim(),
              selLang: selectedLanguage,
              column: "skill",
              onSuccess: (newLi) => {
                $(`#${category}`).append(newLi);
                $(`#input_${category}`).val(""); // clear input
              }
            });
            break;
          }
          case "languages": {
            const languageKey = `language_${selectedLanguage}`;
            Skills.addItem("languages", {
              [languageKey]: $("#input_languages").val().trim(),
              percentage: 50
            }, ["#input_languages"]);
            break;
          }
          case "licenses": {
            const licenseKey = `license_${selectedLanguage}`;
            const descriptionKey = `description_${selectedLanguage}`;
            Skills.addItem("licenses", {
              [licenseKey]: $("#input_license").val().trim(),
              [descriptionKey]: $("#input_license_description").val().trim()
            }, ["#input_license", "#input_license_description"]);
            break;
          }
          default:
            console.warn(`Unknown category: ${category}`);
        }
      });

    $('#licenseModalSave').off('click').on('click', Skills.submitLicenseModal);

    // Combined delete handlers for languages and licenses
    ["languages", "licenses"].forEach(category => {
      doc.on('click', `#${category} .delete-point`, function () {
        const id = $(this).data('id');
        if (!id) return;
        if (!confirm(`Are you sure you want to delete this ${category.slice(0, -1)}?`)) return;
        apiRequest(category, "delete", {}, { id })
          .then(response => {
            if (response.success) {
              Skills.fetchSkills([category]);
            } else {
              console.error(`Failed to delete ${category.slice(0, -1)}:`, response.message);
            }
          })
          .catch(err => {
            console.error(`Error deleting ${category.slice(0, -1)}:`, err);
          });
      });
    });
  },

  // Fetch skills data for given categories
  fetchSkills: function (categories) {
    categories.forEach(category => {
      apiRequest(category, "fetch")
        .then(response => {
          if (response.success) {
            const skillContainer = $(`#${category}`);
            skillContainer.empty();

            const skillList = response.data || [];
            skillList.forEach(skill => {
              skillContainer.append(
                category === "licenses" ? Skills.renderLicenseItem(skill, category, response.sel_language, response.ref_language)
                  : category === "languages" ? Skills.renderLanguageSkill(skill, category, response.sel_language, response.ref_language)
                    : SkillPointManager.render({
                      id: skill.id,
                      column: "skill",
                      valueObj: skill,
                      call: category,
                      isTranslateMode: Skills.translateMode
                    })
              );
            });
            SkillPointManager.updatePlaceholder(skillContainer, skillList.length > 0);
          } else {
            console.error(`Error fetching skills for ${category}: `, response.message);
          }
        }).catch(error => console.error(`Failed to fetch for ${category}: `, error));
    });
  },

  // Rendering functions
  renderLanguageSkill: function (language, call, sel, ref) {
    const ref_language = language[`language_${ref}`]; // Reference language
    const languageValue = language.language[sel] || ref_language; // Translated language
    return `
      <li class="skill-item list-group-item" data-id="${language.id}" data-call="${call}">
        <button class="menu-btn shrink btn-outline-danger delete-point" data-id="${language.id}">
          <i class="fas fa-square-minus"></i>
        </button>
        <span class="${!languageValue || Skills.translateMode ? 'null_message' : ''} point-text">${Skills.translateMode ? ref_language : languageValue || ref_language} - <span class="percentage-display">${language.percentage}</span>%</span>
        ${this.renderTranslationInput(language.id, "language", languageValue, call)}
        <div class="progress mt-2 position-relative">
          <div class="progress-bar" role="progressbar" style="width: ${language.percentage}%;"></div>
          <input type="range" class="form-range language-slider position-absolute w-100" min="0" max="100" value="${language.percentage}" data-category="languages" data-id="${language.id}" data-percentage="${language.percentage}" style="opacity: 0; transition: opacity 0.2s;">
        </div>
      </li>
    `;
  },

  renderLicenseItem: function (license, call, ref, sel) {
    const ref_license = license[`license_${ref}`];
    const licenseValue = license.license[sel] || ref_license;
    const ref_description = license[`description_${ref}`];
    const descriptionValue = license.description[sel] || ref_description;

    return `
      <li class="skill-item list-group-item" data-id="${license.id}" data-call="${call}">
        <button class="menu-btn btn-outline-danger delete-point" data-id="${license.id}">
          <i class="fas fa-trash-alt"></i>
        </button>
        <span class="license-name ${!licenseValue || Skills.translateMode ? 'null_message' : ''} point-text">${Skills.translateMode ? ref_license : licenseValue || ref_license}</span>
        ${this.renderTranslationInput(license.id, "license", licenseValue, call)}
        <p class="license-description ${!descriptionValue || Skills.translateMode ? 'null_message' : ''}">${Skills.translateMode ? ref_description : descriptionValue || ref_description}</p>
        ${this.renderTranslationInput(license.id, "description", descriptionValue, call)}
        <button class="btn btn-primary btn-sm edit-license">Edit</button>
      </li>
    `;
  },

  // Add new skill item
  addItem: function (category, inputs, clearSelectors) {
    const missing = Object.values(inputs).some(input => !input || input === '');
    if (missing) {
      alert("Please fill in all fields!");
      return;
    }

    apiRequest(category, "insert", inputs)
      .then(response => {
        if (response.success) {
          this.fetchSkills([category]);
          clearSelectors.forEach(sel => $(sel).val("")); // Clear input fields
        } else {
          console.error(`Error adding item to ${category}: `, response.message);
        }
      }).catch(error => console.error(`Failed to add item to ${category}: `, error));
  },

  // Slider hover handlers
  handleSliderHover: function () {
    const slider = $(this).find('.language-slider');
    slider.css('opacity', 1);
  },

  handleSliderLeave: function () {
    const slider = $(this).find('.language-slider');
    slider.css('opacity', 0);
  },

  // Slider change handler
  handleSliderChange: async function () {
    const slider = $(this);
    const skillItem = slider.closest('.skill-item');
    const newPercentage = slider.val();
    const skillId = slider.data('id');
    const category = slider.data('category');

    skillItem.find('.percentage-display').text(newPercentage);
    skillItem.find('.progress-bar').css('width', `${newPercentage}%`);

    if (!skillId || !category) return;

    try {
      const response = await apiRequest(category, "update", {
        percentage: newPercentage
      }, { id: skillId });

      if (!response.success) {
        console.error("Failed to update percentage:", response.message);
      }
    } catch (error) {
      console.error("Slider change failed:", error);
    }
  },

  // Edit license modal
  handleLicenseEdit: function (event) {
    const licenseItem = $(event.currentTarget).closest('.skill-item');
    const licenseId = licenseItem.data('id');
    const licenseName = licenseItem.find('.license-name').text().trim();
    const licenseDescription = licenseItem.find('.license-description').text().trim();

    // Populate modal fields
    $('#licenseModalLabel').text('Edit License');
    $('#licenseModal').data('id', licenseId);
    $('#licenseModalName').val(licenseName);
    $('#licenseModalDescription').val(licenseDescription);

    // Show modal
    const licenseModal = new bootstrap.Modal(document.getElementById('licenseModal'));
    licenseModal.show();
  },

  // Submit license modal changes
  submitLicenseModal: function () {
    const licenseId = $('#licenseModal').data('id');
    const newName = $('#licenseModalName').val().trim();
    const newDescription = $('#licenseModalDescription').val().trim();

    if (!newName || !newDescription) {
      alert("Please fill in both fields.");
      return;
    }

    apiRequest("licenses", "update", {
      [`license_${selectedLanguage}`]: newName,
      [`description_${selectedLanguage}`]: newDescription
    }, { id: licenseId }).then(response => {
      if (response.success) {
        $('#licenseModal').modal('hide');
        Skills.fetchSkills(['licenses']);
      } else {
        alert("Failed to update license: " + response.message);
      }
    }).catch(err => {
      console.error("Error updating license:", err);
    });
  },

  // Render translation input if in translate mode
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
  }
};

$(document).ready(function () {
  Skills.init();
});
