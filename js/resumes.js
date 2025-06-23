import { apiRequest } from './apiUtils.js';
import { TranslationConfig } from './TranslationConfig.js';

// Global Resumes namespace
export const Resumes = {
  currentNav: 'nav-new', // Tracks active navigation (default is 'new')

  currentTab: 'details',

  init: function () {
    this.currentNav = 'nav-new';
    this.currentTab = 'details';
    Resumes.fetchResumes();
    Resumes.addEventListeners();

    // Register translation update callback to re-render resume cards
    TranslationConfig.onUpdate(() => {
      Resumes.reRenderAll();
    });
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
    $(document).on('click', '#cancelBtn, .close-button', Resumes.closeModal);
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

    $('#modal_resume').modal('show');

    if (isEdit) {
      Resumes.handleAjax('set_session.php', {
        mode: 'clear'
      }, 'POST', () => {
        Resumes.handleAjax('set_session.php', {
          id,
          mode
        }, 'POST', (response) => {
          if (response.error) {
            console.error(response.error);
            alert('Failed to load resume data.');
            Resumes.closeModal();
            return;
          }
          Resumes.activateTab('details');
        });
      });
    } else {
      Resumes.handleAjax('set_session.php', {
        mode
      }, 'POST', () => Resumes.activateTab('details'));
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

    Resumes.loadTabContent('#modal-content', `_${tabName}.php`);

    // Change the "Next" button to "Create" on the last tab
    const isLastTab = Resumes.getNextTabName(tabName) === null;
    $('#submitBtn')
      .text(isLastTab ? 'Create' : 'Next')
  },

  loadTabContent: function (tabId, phpFile) {
    $(tabId).html('<div class="loading-spinner">Loading...</div>'); // Show loader
    $.get(phpFile)
      .done((data) => {
        $(tabId).html(data); // Replace with the new tab content
        if (phpFile.includes('details')) return; // Skip AJAX fetch for _details.php

        // Determine the tab type
        const tabType = phpFile.includes('skills')
          ? ['hard_skills', 'soft_skills', 'languages', 'licenses']
          : [phpFile.replace('_', '').replace('.php', '')];

        Resumes.fetchAndGenerateList(tabType);
      })
      .fail((xhr) => {
        console.error(`Failed to load content from ${phpFile}:`, xhr.responseText);
        $(tabId).html('<div class="error-message">Failed to load content. Please try again.</div>');
      });
  },

  // Fetch and generate skills and experience for adding or editing a resume
  fetchAndGenerateList: function (types) {
    console.log("types: ", types);
    // First, fetch session data for selected IDs
    $.ajax({
      url: 'get_session.php',
      type: 'GET',
      success: (sessionData) => {
        let session;
        try {
          session = JSON.parse(sessionData); // Parse session data from the server
        } catch (e) {
          console.error("Failed to parse session data:", sessionData);
          return;
        }

        types.forEach((t) => {
          $.ajax({
            url: 'fetch.php',
            type: 'GET',
            data: {
              call: t,
            },
            success: (data) => {
              let parsedData;
              try {
                parsedData = typeof data === 'string' ? JSON.parse(data) : data;
              } catch (e) {
                console.error(`Failed to parse JSON for ${t}:`, data);
                return;
              }

              // Extract the actual array if it's wrapped inside a 'data' object
              const dataArray = Array.isArray(parsedData.data) ? parsedData.data : parsedData;

              if (!Array.isArray(dataArray)) {
                console.error(`Expected an array but received for ${t}:`, parsedData);
                return;
              }

              console.log(`Fetched ${t} data:`, dataArray);

              const container = $(`#fetched-${t}`);
              container.empty();

              // Ensure session[t] is a string or fallback to an empty string
              const selectedIds = (session[t] || '').toString().split(',');

              dataArray.forEach((item) => {
                if (['hard_skills', 'soft_skills', 'languages', 'licenses'].includes(t)) {
                  // Render for Skills Tab
                  const isChecked = selectedIds.includes(String(item.id)) ? 'checked' : '';

                  container.append(`
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="${t}_${item.id}" value="${item.id}" name="${t}[]" ${isChecked}>
          <label class="form-check-label" for="${t}_${item.id}">${item.language || item.license || item.skill}</label>
        </div>
      `);
                } else if (['work_experience', 'education'].includes(t)) {
                  const p = t === 'education' ? 'courses' : 'employers';
                  const selectedHeaderIds = (session[p] || '').toString().split(',');
                  const isChecked = selectedHeaderIds.includes(String(item.id)) ? 'checked' : '';
                  let skillsHtml = '';

                  if (item.skills && Array.isArray(item.skills)) {
                    skillsHtml = item.skills
                      .map(
                        (i) => `
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="${t}_${i.skill_id}" value="${i.skill_id}" name="${t}[]" ${selectedIds.includes(String(i.skill_id)) ? 'checked' : ''}>
                <label class="form-check-label" for="${t}_${i.skill_id}">${i.skill_name}</label>
              </div>
            `
                      )
                      .join('');
                  } else {
                    skillsHtml = `<p>No skill points to select. You can add skill points in the Skills tab</p>`;
                  }

                  container.append(`
        <div class="experience_card card card-colored mb-3 ${isChecked ? 'selected' : ''}">
          <div class="experience-header card-body">
            <h5 class="card-title">${item.title}</h5>
            <p class="">${item.organization}</p>
            <div class="checkbox-container">
              <p style="margin: 0px;">
                <small class="text-muted">${item.start_date} - ${item.end_date}</small>
              </p>
              <input class="form-check-input experience-checkbox" type="checkbox" id="checkbox_${item.id}" value="${item.id}" name="${p}[]" ${isChecked}>
            </div>
            <div class="toggle-container">
              <i class="bi bi-chevron-down toggle-icon"></i>
            </div>
          </div>
          <div class="collapsible-content">${skillsHtml}</div>
        </div>
      `);
                }
              });
            },

            error: (xhr) => console.error(`Error fetching ${t} data:`, xhr.responseText),
          });
        });
      },
      error: (xhr) => console.error("Failed to fetch session data:", xhr.responseText),
    });
  },

  switchTab: function (nextTab) {
    if (!Resumes.currentTab) {
      console.error("Failed to identify the current tab.");
      return;
    }

    if (Resumes.currentTab === nextTab) {
      console.log("Current tab is the same as the next tab. No action needed.");
      return; // Do nothing if the current tab is clicked again
    }

    Resumes.updateSession(Resumes.currentTab, () => {
      Resumes.activateTab(nextTab);
    });

    Resumes.currentTab = nextTab;
  },

  updateSession: function (tabName, callback) {
    const formData = $(`#${tabName}-form`).serialize();
    Resumes.handleAjax('update_session.php', formData, 'POST', callback);
  },

  closeModal: function () {
    $('#modal_resume').modal('hide');
    $('#modal-content').html('');
    Resumes.handleAjax('set_session.php', {
      mode: 'clear'
    }, 'POST'); // Clear session on close
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
    if (confirm('Are you sure you want to delete this resume?')) {
      Resumes.handleAjax('delete-resume.php', {
        id
      }, 'POST', Resumes.fetchResumes);
    }
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
    Resumes.updateSession(Resumes.currentTab, () => {
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
    // Finalize the resume creation process
    Resumes.handleAjax('create-resume.php', null, 'POST', (response) => {
      // Append the new resume to the list (assume response contains new resume HTML)
      if (response.status === 'success') {
        const grid = document.querySelector('.resumes-grid');
        const template = document.createElement('div');
        template.innerHTML = response.card.trim(); // Parse the returned HTML

        // Validate the parsed content
        const newCard = template.firstChild;

        // Find the parent `.col` containing #card-new_resume
        const addResumeCard = document.querySelector('.col #card-new_resume');
        const addResumeCol = addResumeCard ? addResumeCard.parentNode : null;

        // Insert the new card right after the "Add Resume" card's parent `.col`
        if (addResumeCol.nextSibling) {
          grid.insertBefore(newCard, addResumeCol.nextSibling);
        } else {
          grid.appendChild(newCard); // Append to the end if no next sibling
        }

      } else {
        console.error('Failed to create resume:', response);
        if (response.message) {
          alert(`Error: ${response.message}`);
        }
      }

      // Close the modal and clear the session
      Resumes.closeModal();
    });
  },

  handleUpdateResume: function () {

    Resumes.updateSession(Resumes.currentTab, () => {

      Resumes.handleAjax('update-resume.php', new FormData($('#modal_resume form')[0]), 'POST', () => {
        Resumes.fetchResumes();
        Resumes.closeModal();
      }, true)
    });
  },

  fetchResumes: function () {
    apiRequest("resumes", "fetch").then(response => {
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
      job_position: title,
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
                           data-id="${id}" data-call="resumes" data-column="job_position">
                    <button class="btn btn-success btn-sm ms-2 save-translation"
                            data-id="${id}" data-call="resumes" data-column="job_position">
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
};

