import { apiRequest } from './apiUtils.js';
import { TranslationConfig } from './TranslationConfig.js';
import { fetchGlobalLanguages } from "./languageSearch.js";

// Global Resumes namespace
export const Resumes = {
  currentNav: 'nav-new', // Tracks active navigation (default is 'new')

  currentTab: 'details',

  init: function () {
    this.currentNav = 'nav-new';
    this.currentTab = 'details';
    TranslationConfig.onReady(() => {
      Resumes.fetchResumes();
      Resumes.addEventListeners();
    });

    // Register translation update callback to re-render resume cards
    TranslationConfig.onUpdate(() => {
      Resumes.reRenderAll();
    });
  },

  resumeDraft: {
    id: null,
    title: "",
    grad_color_1: "",
    grad_color_2: "",
    bubble_color: "",
    background_color: "",
    skills: {
      hard_skills: [],
      soft_skills: [],
      languages: [],
      licenses: []
    },
    work_experience: {
      selected_employers: [],
      skills: []
    },
    education: {
      selected_courses: [],
      skills: []
    }
  },

  isEditMode: function () {
    return Resumes.currentNav === 'nav-edit';
  },

  addEventListeners: function () {
    // Delegate modal tab clicks to Resumes.switchTab
    $(document).on('click', '#modal_resume .nav-link', function () {
      const tab = $(this).data('current');
      if (tab) {
        Resumes.switchTab(tab);
      }
    });
    // Delegate dynamic actions
    $('.resumes-grid').on('click', '.edit-resume-btn', function () {
      const resumeId = $(this).data('id');
      console.log("Edit button clicked for resume ID:", resumeId);
      if (!resumeId) {
        console.error('Missing or invalid data-id attribute on edit button.');
        return;
      }
      Resumes.openModal('edit', resumeId);
    });

    $('.resumes-grid').on('click', '.delete-resume-btn', function () {
      Resumes.handleDelete($(this).data('id'));
    });

    $(document).on('click', '#btn-add-resume', () => Resumes.openModal('new'));
    $(document).on('click', '#cancelBtn, #closeBtn, .btn-close', Resumes.closeModal);
    $(document).on('click', '#submitBtn', () => Resumes.handleAjax('update_session.php', $('#modal_resume form').serialize(), 'POST', Resumes.nextTab));
    $(document).on('click', '#updateBtn', () => Resumes.handleAjax('update_session.php', $('#modal_resume form').serialize(), 'POST', Resumes.handleUpdateResume));

    // Toggle the collapsible content
    $(document).off('click', '.toggle-container').on('click', '.toggle-container', function (event) {
      event.stopPropagation();
      const content = $(this).closest('.experience_card').find('.collapsible-content');
      if (content.length) {
        content.slideToggle(300);
        $(this).find('.toggle-icon').toggleClass('bi-chevron-down bi-chevron-up');
      }
    });

    $(document).off('click', '.experience-header, .experience-checkbox').on('click', '.experience-header, .experience-checkbox', function (event) {
      if ($(event.target).closest('.toggle-container, .toggle-icon').length) return;
      const checkbox = $(this).closest('.experience-header').find('.experience-checkbox');
      checkbox.prop('checked', !checkbox.prop('checked')).trigger('change');
    });

    $(document).off('change', '.experience-checkbox').on('change', '.experience-checkbox', function () {
      $(this).closest('.experience_card').toggleClass('selected', this.checked);
    });
  },

  openModal: function (mode, id = null) {
    const isEdit = mode === 'edit';
    Resumes.currentNav = isEdit ? 'nav-edit' : 'nav-new'; // Set active navigation based on mode
    Resumes.currentTab = 'details';
    Resumes.configureModal(isEdit);

    console.log(`Opening modal in ${isEdit ? 'edit' : 'new'} mode with ID:`, id);
    setTimeout(() => {
      const modalEl = document.getElementById('modal_resume');
      if (modalEl) {
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
        modalInstance.show();
      }
    }, 0);

    if (isEdit) {
      apiRequest("resumes", "fetch", {}, { id }
      ).then(response => {
        if (response.success && response.data.length > 0) {
          const data = response.data[0];
          console.log("Fetched resume data:", response);
          Resumes.resumeDraft = {
            id: data.id,
            title: data.title, // multi-language object
            grad_color_1: data.grad_color_1 || "#ffffff",
            grad_color_2: data.grad_color_2 || "#ffffff",
            bubble_color: data.bubble_color || "#ffffff",
            background_color: data.background_color || "#ffffff",
            skills: {
              hard_skills: (data.hard_skills || "").split(",").filter(Boolean),
              soft_skills: (data.soft_skills || "").split(",").filter(Boolean),
              languages: (data.languages || "").split(",").filter(Boolean),
              licenses: (data.licenses || "").split(",").filter(Boolean),
            },
            work_experience: {
              selected_employers: (data.employers || "").split(",").filter(Boolean),
              skills: (data.work_experience || "").split(",").filter(Boolean)
            },
            education: {
              selected_courses: (data.courses || "").split(",").filter(Boolean),
              skills: (data.education || "").split(",").filter(Boolean)
            }
          };
          console.log("Resume data loaded:", Resumes.resumeDraft);
          Resumes.activateTab('details');
        } else {
          console.error("Resume not found or failed to fetch.");
          alert("Failed to load resume data.");
          Resumes.closeModal();
        }
      }).catch(error => {
        console.error("Error fetching resume:", error);
        alert("Failed to load resume.");
        Resumes.closeModal();
      });
    } else {
      // Reset resumeDraft for new resume creation
      Resumes.resetResumeDraft();
      // Load the details tab content for new resume
      Resumes.activateTab('details');
    }
  },

  configureModal: function (isEdit) {
    // Show or hide buttons based on the mode
    $('#cancelBtn').toggle(!isEdit); // Cancel button only for new mode
    $('#closeBtn, #updateBtn').toggle(isEdit); // Close and update buttons only for edit mode
    $('#submitBtn, #nav-new').toggle(!isEdit); // Submit button and new navigation only for new mode
    $('#nav-edit').toggle(isEdit); // Edit navigation only for edit mode
  },

  activateTab: function (tabName) {
    $(`#modal_resume .nav-link`).removeClass('active');
    $(`#modal_resume .nav-link[data-current="${tabName}"]`)
      .addClass('active')
      .removeAttr('disabled');

    Resumes.loadTabContent('#modal-content', `_${tabName}.html`);

    // Change the "Next" button to "Create" on the last tab
    const isLastTab = Resumes.getNextTabName(tabName) === null;
    $('#submitBtn')
      .text(isLastTab ? 'Create' : 'Next')
  },

  loadTabContent: function (tabId, phpFile) {
    const langKey = TranslationConfig.getConfig().selectedLangKey;
    $(tabId).html('<div class="loading-spinner">Loading...</div>'); // Show loader
    $.get(phpFile)
      .done((data) => {
        $(tabId).html(data); // Replace with the new tab content
        if (phpFile.includes('details')) {
          setTimeout(() => {
            $('#title').val(Resumes.resumeDraft.title?.[langKey]);
            $('#grad_color_1').val(Resumes.resumeDraft.grad_color_1 || '#FF1C1C');
            $('#grad_color_2').val(Resumes.resumeDraft.grad_color_2 || '#750D64');
            $('#bubble_color').val(Resumes.resumeDraft.bubble_color || '#FCE8E8');
            $('#background_color').val(Resumes.resumeDraft.background_color || '#E69BA8');

            // Update CSS theme live
            document.documentElement.style.setProperty('--c1', Resumes.resumeDraft.grad_color_1 || '#FF1C1C');
            document.documentElement.style.setProperty('--c2', Resumes.resumeDraft.grad_color_2 || '#750D64');
            document.documentElement.style.setProperty('--bgc', Resumes.resumeDraft.background_color || '#FCE8E8');
            document.documentElement.style.setProperty('--bc', Resumes.resumeDraft.bubble_color || '#E69BA8');

            document.querySelector('#grad_color_1').setAttribute('color', Resumes.resumeDraft.grad_color_1 || '#FF1C1C');
            document.querySelector('#grad_color_2').setAttribute('color', Resumes.resumeDraft.grad_color_2 || '#750D64');
            document.querySelector('#background_color').setAttribute('color', Resumes.resumeDraft.background_color || '#FCE8E8');
            document.querySelector('#bubble_color').setAttribute('color', Resumes.resumeDraft.bubble_color || '#E69BA8');

            document.querySelector('#grad_color_1_hidden').setAttribute('value', Resumes.resumeDraft.grad_color_1 || '#FF1C1C');
            document.querySelector('#grad_color_2_hidden').setAttribute('value', Resumes.resumeDraft.grad_color_2 || '#750D64');
            document.querySelector('#background_color_hidden').setAttribute('value', Resumes.resumeDraft.background_color || '#FCE8E8');
            document.querySelector('#bubble_color_hidden').setAttribute('value', Resumes.resumeDraft.bubble_color || '#E69BA8');

            document.querySelector('#colorPicker1').setAttribute('color', Resumes.resumeDraft.grad_color_1 || '#FF1C1C');
            document.querySelector('#colorPicker2').setAttribute('color', Resumes.resumeDraft.grad_color_2 || '#750D64');
            document.querySelector('#colorPickerBackground').setAttribute('color', Resumes.resumeDraft.background_color || '#FCE8E8');
            document.querySelector('#colorPickerBubble').setAttribute('color', Resumes.resumeDraft.bubble_color || '#E69BA8');
          }, 50);
          return;
        }

        // Determine the tab type
        const tabType = phpFile.includes('skills')
          ? ['hard_skills', 'soft_skills', 'languages', 'licenses']
          : [phpFile.replace('_', '').replace('.html', '')];

        Resumes.fetchAndGenerateList(tabType);
      })
      .fail((xhr) => {
        console.error(`Failed to load content from ${phpFile}:`, xhr.responseText);
        $(tabId).html('<div class="error-message">Failed to load content. Please try again.</div>');
      });
  },

  // Fetch and generate skills and experience for adding or editing a resume
  fetchAndGenerateList: async function (types) {
    const languageNameMap = {};
    const langKey = TranslationConfig.getConfig().selectedLangKey;
    const langCode = TranslationConfig.getConfig().selectedLangCode;

    // Load language map only once if 'languages' is one of the requested types
    if (types.includes('languages')) {
      const languages = await fetchGlobalLanguages();
      languages.forEach(lang => {
        languageNameMap[lang.language_code] = lang.translations?.[langCode];
      });
    }

    types.forEach((type) => {
      const tableName = type === 'work_experience' ? 'employers' : type === 'education' ? 'courses' : type;
      apiRequest(tableName, "fetch").then(response => {
        const items = response.data || [];
        const container = $(`#fetched-${type}`);
        container.empty();

        if (['work_experience', 'education'].includes(type)) {
          const isWork = type === 'work_experience';
          const headerKey = isWork ? 'selected_employers' : 'selected_courses';
          const selectedHeaderIds = Resumes.resumeDraft[type]?.[headerKey] || [];
          const selectedSkillIds = Resumes.resumeDraft[type]?.skills || [];

          items.forEach(item => {
            const isChecked = selectedHeaderIds.includes(String(item.id)) ? 'checked' : '';
            let skillsHtml = '';

            if (Array.isArray(item.skills) && item.skills.length > 0) {
              skillsHtml = item.skills
                .map(i => `
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="${type}_${i.id}" value="${i.id}" name="${type}[]" ${selectedSkillIds.includes(String(i.id)) ? 'checked' : ''}>
                    <label class="form-check-label" for="${type}_${i.id}">${i.skill?.[langKey]}</label>
                  </div>
                `)
                .join('');
            } else {
              skillsHtml = `<p>No skill points to select. You can add skill points in the Skills tab</p>`;
            }

            const title = item.title?.[langKey] || item.title?.lang_1 || '-';
            const org = item.organisation || '-';
            const dates = `${item.start_date || '_'} - ${item.end_date || '_'}`;

            container.append(`
              <div class="experience_card card card-colored mb-3 ${isChecked ? 'selected' : ''}">
                <div class="experience-header card-body">
                  <h5 class="card-title">${title}</h5>
                  <p class="">${org}</p>
                  <div class="checkbox-container">
                    <p style="margin: 0px;">
                      <small class="text-muted">${dates}</small>
                    </p>
                    <input class="form-check-input experience-checkbox" type="checkbox" id="checkbox_${item.id}" value="${item.id}" name="${headerKey}[]" ${isChecked}>
                  </div>
                  <div class="toggle-container">
                    <i class="bi bi-chevron-down toggle-icon"></i>
                  </div>
                </div>
                <div class="collapsible-content">${skillsHtml}</div>
              </div>
            `);
          });

          return;
        }

        // Handle skill categories (unchanged from working code)
        const selected = Resumes.resumeDraft.skills[type] || [];

        items.forEach(item => {
          let label = "-";

          if (type === "languages") {
            const code = item.language_code;
            label = languageNameMap[code];
          } else if (item.skill && typeof item.skill === 'object') {
            label = item.skill[langKey];
          } else if (item.license && typeof item.license === 'object') {
            label = item.license[langKey];
          } else {
            label = item.skill || item.language || item.license || "-";
          }

          const isChecked = selected.includes(String(item.id));

          container.append(`
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="${type}_${item.id}" value="${item.id}" name="${type}[]" ${isChecked ? 'checked' : ''}>
              <label class="form-check-label" for="${type}_${item.id}">${label}</label>
            </div>
          `);
        });
      }).catch(err => {
        console.error(`Error fetching ${type}:`, err);
      });
    });
  },

  switchTab: function (nextTab) {
    if (!Resumes.currentTab) {
      console.error("Failed to identify the current tab.");
      return;
    }

    if (Resumes.currentTab === nextTab) {
      return; // Do nothing if the current tab is clicked again
    }

    Resumes.updateResumeDraft(Resumes.currentTab, () => {
      Resumes.activateTab(nextTab);
    });

    Resumes.currentTab = nextTab;
  },

  updateResumeDraft: function (tabName, callback) {
    if (tabName === 'details') {
      const form = document.querySelector('#details-form');
      if (!form) return callback();

      const formData = new FormData(form);

      const langKey = TranslationConfig.getConfig().selectedLangKey;
      Resumes.resumeDraft.title = {
        ...Resumes.resumeDraft.title,
        [langKey]: formData.get('title')
      };
      Resumes.resumeDraft.grad_color_1 = formData.get('grad_color_1_hidden');
      Resumes.resumeDraft.grad_color_2 = formData.get('grad_color_2_hidden');
      Resumes.resumeDraft.bubble_color = formData.get('bubble_color_hidden');
      Resumes.resumeDraft.background_color = formData.get('background_color_hidden');

    } else if (tabName === 'skills') {
      const form = document.querySelector('#skills-form');
      if (!form) return callback();

      const formData = new FormData(form);
      ['hard_skills', 'soft_skills', 'languages', 'licenses'].forEach(type => {
        Resumes.resumeDraft.skills[type] = formData.getAll(`${type}[]`);
      });
    } else if (tabName === 'work_experience') {
      const form = document.querySelector('#work_experience-form');
      if (!form) return callback();

      const formData = new FormData(form);
      Resumes.resumeDraft.work_experience.selected_employers = formData.getAll('selected_employers[]');
      Resumes.resumeDraft.work_experience.skills = formData.getAll('work_experience[]');
    }
    else if (tabName === 'education') {
      const form = document.querySelector('#education-form');
      if (!form) return callback();

      const formData = new FormData(form);
      Resumes.resumeDraft.education.selected_courses = formData.getAll('selected_courses[]');
      Resumes.resumeDraft.education.skills = formData.getAll('education[]');
    }
    console.log("Updated resumeDraft:", Resumes.resumeDraft);
    callback();
  },

  closeModal: function () {
    $('#modal_resume').modal('hide');
    $('#modal-content').html('');
    Resumes.resetResumeDraft(); // Clear the draft after closing the modal
  },

  handleAjax: function (url, data, method, onSuccess, isFormData = false) {
    $.ajax({
      url,
      type: method,
      data,
      processData: !isFormData,
      contentType: !isFormData ? 'application/x-www-form-urlencoded; charset=UTF-8' : false,
      success: onSuccess,
      error: (xhr) => console.error(`Error with AJAX call to ${url}:`, xhr.responseText),
    });
  },

  handleDelete: function (id) {
    if (!id || !confirm("Are you sure you want to delete this resume?")) return;

    apiRequest("resumes", "delete", {}, { id }).then(response => {
      if (response.success) {
        Resumes.fetchResumes(); // Refresh the UI
      } else {
        alert("Failed to delete resume.");
        console.error(response.message || response);
      }
    }).catch(err => {
      console.error("Delete failed:", err);
      alert("An error occurred while deleting the resume.");
    });
  },

  nextTab: function () {
    if (!Resumes.currentTab) {
      console.error("Failed to identify the current tab.");
      return;
    }

    const nextTabName = Resumes.getNextTabName(Resumes.currentTab);

    if (!nextTabName) {
      // If no next tab exists, it means we are on the last tab
      Resumes.createResume(); // Trigger the create functionality
      return;
    }

    // Update session with current tab's data
    Resumes.updateResumeDraft(Resumes.currentTab, () => {
      Resumes.activateTab(nextTabName); // Switch to the next tab
      Resumes.currentTab = nextTabName; // Update Resumes.currentTab
    });
  },

  getNextTabName: function (currentTab) {
    const tabsOrder = ['details', 'skills', 'work_experience', 'education'];
    const currentIndex = tabsOrder.indexOf(currentTab);
    return currentIndex !== -1 && currentIndex < tabsOrder.length - 1
      ? tabsOrder[currentIndex + 1]
      : null;
  },

  createResume: function () {

    Resumes.updateResumeDraft(Resumes.currentTab, () => {
      const data = Resumes.convertDataForApi(); // Convert resumeDraft to API format

      apiRequest("resumes", "insert", data).then(response => {
        if (response.success) {
          console.log("Resume created successfully:", response.data);
          Resumes.fetchResumes(); // Refresh the resumes list after creation
          Resumes.closeModal(); // Close the modal after creation
        } else {
          console.error("Failed to create resume:", response.message);
          alert(`Error: ${response.message}`);
        }
      }).catch(error => {
        console.error("Error creating resume:", error);
        alert("An error occurred while creating the resume. Please try again.");
      });
    });
  },

  handleUpdateResume: function () {

    Resumes.updateResumeDraft(Resumes.currentTab, () => {
      const id = Resumes.resumeDraft.id;
      const data = Resumes.convertDataForApi(); // Convert resumeDraft to API format

      apiRequest("resumes", "update", data, { id }).then(response => {
        if (response.success) {
          Resumes.fetchResumes(); // Refresh the resumes list after update
          Resumes.closeModal(); // Close the modal after update
        } else {
          console.error("Failed to update resume:", response.message);
          alert(`Error: ${response.message}`);
        }
      }).catch(error => {
        console.error("Error updating resume:", error);
        alert("An error occurred while updating the resume. Please try again.");
      });
    });
  },

  fetchResumes: function () {
    apiRequest("resumes", "fetch").then(response => {
      console.log("Fetched resumes:", response);
      const resumesGrid = $(".resumes-grid");
      resumesGrid.empty();

      // Add the "Create new resume" card first
      resumesGrid.append(`
        <div class="col text-center">
          <div class="card-resumes card-add" id="card-new_resume">
            <div class="card-body my-auto">
              <button type="button" class="btn btn-link btn-icon" id="btn-add-resume"><i class="bi bi-plus-circle-fill" style="font-size: 6rem"></i></button>
              <p class="card-subtitle mb-4 text-muted">Create new resume</p>
            </div>
          </div>
        </div>
      `);

      response.data.forEach(resume => {
        const card = Resumes.renderCard(resume);
        resumesGrid.append(card);
      });
    }).catch(error => {
      console.error("Failed to fetch resumes:", error);
    });
  },

  renderCard: function (resume) {
    // Extract all used resume properties into constants
    const {
      id,
      title,
      ref_title,
      grad_color_1,
      grad_color_2,
      last_updated
    } = resume;

    const { selectedLangKey, isTranslateMode, selectedLangCode } = TranslationConfig.getConfig();
    const displayTitle = isTranslateMode ? ref_title : title?.[selectedLangKey] || ref_title || "-";
    const titleClass = !title?.[selectedLangKey] || isTranslateMode ? "null_message" : "";

    // Format date as "Last updated X" or "just now"
    let lastUpdatedText = "just now";
    if (last_updated) {
      const updatedDate = new Date(last_updated);
      const now = new Date();
      const diffMs = now - updatedDate;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      const diffMonths = Math.floor(diffDays / 30);
      const diffYears = Math.floor(diffDays / 365);

      if (diffMins < 1) {
        lastUpdatedText = "just now";
      } else if (diffMins < 60) {
        lastUpdatedText = `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
      } else if (diffDays < 31) {
        lastUpdatedText = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      } else if (diffYears < 1) {
        lastUpdatedText = `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
      } else {
        lastUpdatedText = updatedDate.toLocaleDateString();
      }
    }

    const cardElement = $(`
      <div class="col">
        <div class="card card-resumes" id="resume_${id}" data-id="${id}">
          <div class="color-gradient" style="background-image: linear-gradient(to right, ${grad_color_1 || 'white'}, ${grad_color_2 || 'white'})"></div>
          <div style="position: relative;">
            <div class="card-body" style="display: flex; justify-content: space-between;">
              <div>
                <h3 class="card-text ${titleClass}" data-title-json='${JSON.stringify(title || {})}'>${displayTitle}</h3>
                ${isTranslateMode ? `
                  <div class="d-flex align-items-center mt-2">
                    <input type="text" class="form-control translate-input" placeholder="Enter translation"
                           value="${title?.[selectedLangKey] || ''}"
                           data-id="${id}" data-call="resumes" data-column="title">
                    <button class="btn btn-success btn-sm ms-2 save-translation"
                            data-id="${id}" data-call="resumes" data-column="title">
                      Save
                    </button>
                  </div>
                ` : `
                  <p class="card-subtitle mb-4 text-muted">${lastUpdatedText}</p>
                `}
              </div>
              ${!isTranslateMode ? `
                <div class="btn-icon menu-btn edit-resume-btn" data-id="${id}">
                  <i class="fas fa-pencil"></i>
                </div>
              ` : ''}
            </div>
            <div class="card-body" style="align-content: end;">
              <div class="buttons">
                <form action="build-resume.php" method="post">
                  <input type="hidden" name="card_id" value="${id}">
                  <input type="hidden" name="sel_lang" value="${selectedLangKey}">
                  <input type="hidden" name="sel_lang_code" value="${selectedLangCode}">
                  <button class="btn btn-primary main-btn btn-lg" name="submit">View</button>
                </form>
                <div class="btn-icon menu-btn delete-resume-btn" data-id="${id}">
                  <i class="fas fa-trash-arrow-up me-3"></i>Delete
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);

    cardElement.find('.card-resumes').data("resume", resume);
    return cardElement;
  },

  reRenderAll: function () {
    $(".card-resumes").each(function () {
      const card = $(this);
      const id = card.data("id");

      if (id === "card-new_resume") return;

      const resume = card.data("resume");
      if (!resume) return;

      const newCard = Resumes.renderCard(resume);
      card.closest(".col").replaceWith(newCard);
    });
  },

  resetResumeDraft: function () {
    Resumes.resumeDraft = {
      id: null,
      title: "",
      grad_color_1: "",
      grad_color_2: "",
      bubble_color: "",
      background_color: "",
      skills: {
        hard_skills: [],
        soft_skills: [],
        languages: [],
        licenses: []
      },
      work_experience: {
        selected_employers: [],
        skills: []
      },
      education: {
        selected_courses: [],
        skills: []
      }
    };
    console.log("Resume draft reset to initial state:", Resumes.resumeDraft);
  },

  convertDataForApi: function () {
    const langKey = TranslationConfig.getConfig().selectedLangKey;
    return {
      [`title_${langKey}`]: Resumes.resumeDraft.title?.[langKey],
      grad_color_1: Resumes.resumeDraft.grad_color_1,
      grad_color_2: Resumes.resumeDraft.grad_color_2,
      bubble_color: Resumes.resumeDraft.bubble_color,
      background_color: Resumes.resumeDraft.background_color,

      hard_skills: Resumes.resumeDraft.skills.hard_skills.join(','),
      soft_skills: Resumes.resumeDraft.skills.soft_skills.join(','),
      languages: Resumes.resumeDraft.skills.languages.join(','),
      licenses: Resumes.resumeDraft.skills.licenses.join(','),

      employers: Resumes.resumeDraft.work_experience.selected_employers.join(','),
      work_experience: Resumes.resumeDraft.work_experience.skills.join(','),

      courses: Resumes.resumeDraft.education.selected_courses.join(','),
      education: Resumes.resumeDraft.education.skills.join(','),
    };
  }
};

