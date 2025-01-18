// Global Resumes namespace
const Resumes = {
  currentNav: 'nav-new', // Tracks active navigation (default is 'new')

  currentTab: 'details',

  init: function () {
    this.currentNav = 'nav-new';
    this.currentTab = 'details';
    Resumes.fetchResumes();
    Resumes.addEventListeners();
  },

  addEventListeners: function () {
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
    console.log(`Activating tab: ${tabName}`);
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

  fetchAndGenerateList: function (types) {
    console.log(`Fetching data for types: ${types}`); // Debugging

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

              const container = $(`#fetched-${t}`);
              container.empty();

              // Ensure session[t] is a string or fallback to an empty string
              const selectedIds = (session[t] || '').toString().split(',');

              data.forEach((item) => {
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
                  // Ensure session[p] is a string or fallback to an empty string
                  const selectedHeaderIds = (session[p] || '').toString().split(',');
                  // Render for Work Experience / Education Tabs
                  const isChecked = selectedHeaderIds.includes(String(item.id)) ? 'checked' : '';
                  let skillsHtml = '';

                  if (item.skills && item.skills.length > 0) {
                    // Generate HTML for each skill within work experience or education
                    skillsHtml = item.skills
                      .map(
                        (i) => `
                        <div class="form-check">
                          <input class="form-check-input" type="checkbox" id="${t}_${i.skill_id}" value="${i.skill_id}" name="${t}[]" ${
                        selectedIds.includes(String(i.skill_id)) ? 'checked' : ''
                      }>
                          <label class="form-check-label" for="${t}_${i.skill_id}">${i.skill_name}</label>
                        </div>
                      `
                      )
                      .join('');
                  } else {
                    skillsHtml = `<p>No skill points to select</p>`;
                  }

                  container.append(`
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="${p}_${item.id}" value="${item.id}" name="${p}[]" ${isChecked}>
                    <label class="form-check-label" for="${p}_${item.id}">Include this item</label>
                  </div>
                  <div class="card mb-3">
                    <div class="card-body">
                      <h5 class="card-title">${item.title}</h5>
                      <p class="card-text">${item.organization}</p>
                      <p class="card-text">
                        <small class="text-muted">${item.start_date} - ${item.end_date}</small>
                      </p>
                      ${skillsHtml}
                    </div>
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
    console.log(`form DATA: ${formData}`);
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

    console.log(`Switching from ${Resumes.currentTab} to ${nextTabName}`);

    // Update session with current tab's data
    Resumes.updateSession(Resumes.currentTab, () => {
      Resumes.activateTab(nextTabName); // Switch to the next tab
      Resumes.currentTab = nextTabName; // Update Resumes.currentTab
    });
  },

  getNextTabName: function (currentTab) {
    const tabsOrder = ['details', 'skills', 'work_experience', 'education'];
    const currentIndex = tabsOrder.indexOf(currentTab);
    console.log(`current index: ${currentIndex}`);
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
    Resumes.handleAjax('fetch-resumes.php', null, 'GET', (data) => {
      const resumesGrid = $('.resumes-grid');
      resumesGrid.html(data); // Inject pre-rendered HTML
    });
  },
};
