import { apiRequest } from "./apiUtils.js";
import { SkillPointManager } from "./SkillPointManager.js";
import { TranslationConfig } from "./TranslationConfig.js";
import { setupLanguageSearch, fetchGlobalLanguages } from "./languageSearch.js";

export const Skills = {
  translateMode: false,

  // Initialization
  init: function () {
    console.log("✅ Skills module initialized");
    const skillCategories = ["hard_skills", "soft_skills", "languages", "licenses"];
    this.fetchSkills(skillCategories);
    this.setupEventListeners();
    this.initLanguageSearchInput();
    TranslationConfig.onUpdate(() => {
      SkillPointManager.reRenderAll();
      this.reRenderAllLanguages();
      this.reRenderAllLicenses();
    });
  },

  initLanguageSearchInput: function () {
    const inputSelector = "#input_languages";
    const resultContainerSelector = ".language-search-results";

    const input = $(inputSelector);
    const container = input.parent();
    let resultsList = container.find(resultContainerSelector);

    if (resultsList.length === 0) {
      resultsList = $("<ul class='language-search-results list-group mt-1 position-absolute bg-white border rounded shadow-sm'></ul>").css({
        maxHeight: "200px",
        overflowY: "auto",
        zIndex: 1000,
        left: 0,
        top: input.outerHeight(),
        width: "100%"
      });
      container.append(resultsList);
    }

    const alreadyAddedCodes = $("#languages .skill-item[data-language-code]")
      .map((_, el) => $(el).dataset.languageCode || $(el).getAttribute("data-language-code"))
      .get();

    fetchGlobalLanguages().then(allLanguages => {
      setupLanguageSearch({
        inputSelector,
        resultContainerSelector,
        availableLanguages: allLanguages,
        alreadyAdded: alreadyAddedCodes,
        onSelect: (lang) => {
          input.val(lang.translated_name_en);
          input.data("langCode", lang.language_code);
          input.data("langName", lang.translated_name_en);
          resultsList.hide();
        }
      });
    });
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
              selLang: TranslationConfig.getConfig().selectedLangKey,
              column: "skill",
              onSuccess: (newLi) => {
                $(`#${category}`).append(newLi);
                $(`#input_${category}`).val(""); // clear input
              }
            });
            break;
          }
          case "languages": {
            const input = $("#input_languages");
            const selectedLangName = input.data("langName");
            const selectedLangCode = input.data("langCode");

            if (!selectedLangName || !selectedLangCode || input.val().trim() !== selectedLangName) {
              alert("Please select a valid language from the list.");
              return;
            }

            Skills.addItem("languages", {
              language_code: selectedLangCode,
              percentage: 50
            }, ["#input_languages"]);
            input.removeData("langCode").removeData("langName");
            break;
          }
          case "licenses": {
            const selectedLang = TranslationConfig.getConfig().selectedLangKey;
            const licenseKey = `license_${selectedLang}`;
            const descriptionKey = `description_${selectedLang}`;
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

    // Ensure previous listeners for .delete-point are cleared before attaching new ones for languages and licenses
    ["languages", "licenses"].forEach(category => {
      doc.off('click', `#${category} .delete-point`);
    });
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
            console.log(`Fetched ${category} successfully:`, response.data);
            const skillContainer = $(`#${category}`);
            skillContainer.empty();

            const skillList = response.data || [];
            const renderItems = async () => {
              const renderedItems = await Promise.all(skillList.map(skill => {
                switch (category) {
                  case "licenses":
                    return Promise.resolve(
                      Skills.renderLicenseItem(skill, category, response.ref_language, response.sel_language)
                    );
                  case "languages":
                    return Skills.renderLanguageSkill(skill, category, response.ref_language);
                  default:
                    return Promise.resolve(
                      SkillPointManager.render({
                        id: skill.id,
                        column: "skill",
                        valueObj: skill,
                        call: category,
                        isTranslateMode: Skills.translateMode
                      })
                    );
                }
              }));

              renderedItems.forEach(item => skillContainer.append(item));
              SkillPointManager.updatePlaceholder(skillContainer, skillList.length > 0);
            };

            renderItems();
          } else {
            console.error(`Error fetching skills for ${category}: `, response.message);
          }
        }).catch(error => console.error(`Failed to fetch for ${category}: `, error));
    });
  },

  reRenderAllLanguages: async function () {
    const items = $('.language-skill-item');

    const rendered = await Promise.all(items.map(function (_, el) {
      const item = $(el);
      const id = item.data('id');
      const language_code = item.data('language-code');
      const percentage = item.find('.language-slider').val();

      return Skills.renderLanguageSkill({ id, language_code, percentage }, "languages", TranslationConfig.getConfig().referenceLanguage)
        .then(newHtml => ({ newHtml, oldEl: item }));
    }).get());

    rendered.forEach(({ newHtml, oldEl }) => {
      oldEl.replaceWith(newHtml);
    });
  },

  // Rendering functions
  renderLanguageSkill: async function (language, call, ref) {

    const { isTranslateMode, selectedLangCode, referenceLanguage } = TranslationConfig.getConfig();
    const ref_language = language[`language_${ref}`]; // Reference language
    const language_code = language.language_code; // Translated language
    let languageValue = ref_language; // Default to reference language

    try {
      const allLanguages = await fetchGlobalLanguages();
      const match = allLanguages.find(lang => lang.language_code === language_code);
      languageValue = match.translations[selectedLangCode];
    } catch (error) {
      console.error("Error retrieving translated name for language skill:", error);
    }


    console.log("Translated language value:", language);

    return `
      <li class="language-skill-item list-group-item" data-id="${language.id}" data-call="${call}" data-language-code="${language.language_code}">
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

  reRenderAllLicenses: async function () {
    const items = $('.licenses-skill-item');

    const rendered = await Promise.all(items.map(function (_, el) {
      const item = $(el);
      // Parse the license JSON from attribute
      const license = JSON.parse(item.attr("data-license-json") || "{}");

      return Promise.resolve(
        Skills.renderLicenseItem(license, "licenses", TranslationConfig.getConfig().referenceLanguage)
      ).then(newHtml => ({ newHtml, oldEl: item }));
    }).get());

    rendered.forEach(({ newHtml, oldEl }) => {
      oldEl.replaceWith(newHtml);
    });
  },

  renderLicenseItem: function (license, call, ref) {

    console.log("Rendering license item:", license);
    const { isTranslateMode, selectedLangKey, referenceLanguage } = TranslationConfig.getConfig();

    const ref_license = license[`license_${ref}`];
    const licenseValue = license.license[selectedLangKey] || ref_license;
    const ref_description = license[`description_${ref}`];
    const descriptionValue = license.description[selectedLangKey] || ref_description;
    // Encode the full license object as JSON for data-license-json attribute
    const licenseJson = JSON.stringify(license).replace(/"/g, '&quot;');

    return `
      <li class="licenses-skill-item list-group-item" data-id="${license.id}" data-call="${call}" data-license-json="${licenseJson}">
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
    const skillItem = slider.closest('.language-skill-item');
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
    const licenseItem = $(event.currentTarget).closest('.licenses-skill-item');
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
    const selectedLang = TranslationConfig.getConfig().selectedLangKey;
    const licenseId = $('#licenseModal').data('id');
    const newName = $('#licenseModalName').val().trim();
    const newDescription = $('#licenseModalDescription').val().trim();

    if (!newName || !newDescription) {
      alert("Please fill in both fields.");
      return;
    }

    apiRequest("licenses", "update", {
      [`license_${selectedLang}`]: newName,
      [`description_${selectedLang}`]: newDescription
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