// Global Experience namespace
const Experience = {
  // Variable to determine if modal is being used to edit or add
  isEditMode: false,
  currentEditId: null,
  // Flag to keep track of dragging state
  isDragging: false,

  init: function () {
    this.isEditMode = false;
    this.currentEditId = null;
    this.isDragging = false;

    // Detect page and initialize the correct logic
    if (!!document.querySelector("#employers")) {
      Experience.initWorkExperience();
    } else if (!!document.querySelector("#courses")) {
      Experience.initEducation();
    } else {
      console.warn("No matching page detected for Experience.js");
    }
  },

  initWorkExperience: function () {
    Experience.fetchData("work_experience");
    Experience.initializeSortable("employers", "work_experience");
    Experience.addEventListeners();
  },

  initEducation: function () {
    console.log("Initializing Education Page");

    Experience.fetchData("education");
    Experience.initializeSortable("courses", "education");
    Experience.addEventListeners();
  },
  // Generic AJAX request handler to reduce code repetition
  ajaxRequest: function (
    url,
    type,
    data = {},
    onSuccess = () => { },
    onError = () => { }
  ) {
    $.ajax({
      url: url,
      type: type,
      data: data,
      dataType: "json", // Automatically parse JSON
    })
      .done(onSuccess)
      .fail(function (xhr, status, error) {
        console.error(`AJAX Error: ${url}`, status, error, xhr.responseText);
        onError(xhr, status, error);
      });
  },
  // Fetch work experience or education data and populate the container
  fetchData: function (call) {
    const containerId = call === "work_experience" ? "#employers" : "#courses";
    const table = call === "work_experience" ? "employers" : "courses";
    apiRequest(table, "fetch", {
      columns: ["*"]
    }).then(response => {
      if (!response.success) {
        console.error("Failed to fetch data:", response.message);
        return;
      }

      const container = $(containerId).empty();
      // Re-inject the "Add Experience" button
      const addExperienceHTML = `
        <div class="experience_card-container row" id="card-new_work_experience">
          <div class="time-plot">
          </div>
          <div class="col text-center experience_card col">
              <div class="card-body card-placeholder">
                <button type="button" class="btn btn-link btn-icon" id="btn-add-experience" style="width: 100%;" data-bs-toggle="modal" data-bs-target="#modal-experience" data-entry-type="${call}">
                  <i class="bi bi-plus-circle-fill" style="font-size: 4rem"></i>
                </button>
              </div>
          </div>
          <div class="col-1"></div>
        </div>
      `;
      container.append(addExperienceHTML);

      const experiences = Array.isArray(response.data) ? response.data : [];

      experiences.forEach(experience => {
        // Append the main card structure
        container.append(Experience.renderExperienceCard(experience, call, response.sel_language, response.ref_language));

        // Append each skill point individually as jQuery elements
        const skillList = $(`#skills_list_${experience.id}`);
        const skills = Array.isArray(experience.skills) ? experience.skills : [];

        if (skills.length > 0) {
          skills.forEach(skill => {
            const skillElement = SkillPointManager.render({
              id: skill.id,
              column: "skill",
              valueObj: skill,
              refLang: response.sel_language,
              selLang: response.ref_language,
              call: call,
              parentId: experience.id,
              isTranslateMode: Experience.translateMode
            });
            skillList.append(skillElement);
          });
        }
        SkillPointManager.updatePlaceholder(skillList, skills.length > 0);
      });
    });
  },

  // Render the experience card HTML
  renderExperienceCard: function (experience, call, sel_language, ref_language) {
    // Only produce the shell (no skill points here, they'll be appended later)
    let columnName = "";
    if (call == 'work_experience') {
      columnName = 'job_position';
    } else if (call == 'education') {
      columnName = 'course';
    }

    // Add input field if translate mode is enabled
    const renderTranslationInput = (id, column, value, type) => {
      if (Experience.translateMode) {
        return `
      <div class="d-flex align-items-center mt-2">
        <input type="text" class="form-control translate-input" 
               placeholder="Enter translation" value="${value || ""}" 
               data-id="${id}" data-column="${column}" data-call="${call}" data-type="${type}">
        <button class="btn btn-success btn-sm ms-2 save-translation" 
                data-id="${id}" data-column="${column}" data-call="${call}" data-type="${type}">Save</button>
      </div>`;
      }
      return "";
    };

    return `
    <div class="experience_card-container row" id="experience_card_${experience.id}">
      <div class="time-plot">
        <p class="time">${experience.end_date}<br> 
        <i class="fas fa-arrow-up"></i><br>${experience.start_date}</p>
      </div>
      <div class="card experience_card col">
        <div class="experience-header card-colored" id="experience_header_${experience.id}">
          <h3 class="${!experience.title[sel_language] || Experience.translateMode ? 'null_message' : ''}">${Experience.translateMode ? experience.ref_title : experience.title[sel_language] || experience.ref_title}</h3>
          ${renderTranslationInput(experience.id, columnName, experience.title[sel_language], "entry")
      }

    ${!Experience.translateMode ? '<p class= "sub-heading">' + experience.organisation + '●' + experience.country[sel_language] + ', ' + experience.area + '</p>' : ''}
          <div class="menu-icon-container" id="menu_container_${experience.id}">
            <div class="action-buttons slide-in" id="action_buttons_${experience.id
      }">
              <button class="menu-btn btn-outline-primary edit-experience" data-id="${experience.id
      }" data-call="${call}">
                <i class="fas fa-pencil-alt"></i> Edit
              </button>
              <button class="menu-btn btn-outline-danger delete-experience" data-id="${experience.id
      }" data-call="${call}">
                <i class="fas fa-trash-alt"></i> Delete
              </button>
            </div>
            <button class="menu-btn btn-link menu-toggle" style="" type="button" id="menu_${experience.id
      }">
              <i class="fas fa-ellipsis-h"></i>
            </button>
          </div>
        </div >
  <div class="collapsible-content" id="content_${experience.id}" style="display: none;">
    <h4>Demonstrated Skills</h4>
    <div class="skills-list-wrapper">
      <ul class="skills-list list-group list-group-flush" id="skills_list_${experience.id}">
        <!-- Skill points will be appended here dynamically -->
      </ul>
    </div>
          <div class="input-group mb-3">
      <input type="text" class="form-control" id="input_experience_${experience.id
      }" placeholder="Type your skill here" data-trigger-button="#add_work_experience_${experience.id}">
            <button class="btn btn-outline-secondary" type="button" id="add_work_experience_${experience.id
      }" onClick="Experience.addPoint('${call}', '${experience.id
      }')"><i class="fas fa-square-plus"></i></button>
          </div>
  </div>
      </div >
  <div class="drag-handle menu-btn col-1" data-id="${experience.id}">
    <i class="fas fa-grip-lines"></i> <!-- Drag handle -->
  </div>
    </div >
  `;
  },

  // Handle reordering of items and send updated order to the server
  reorderItems: function (evt, section) {
    const containerId =
      section === "work_experience" ? "#employers" : "#courses";
    const updatedOrder = [
      ...document.querySelectorAll(`${containerId} .experience_card-container`),
    ].map((item, index) => ({
      id: item.getAttribute("id").split("_")[2],
      order: index + 1,
    }));

    Experience.ajaxRequest(
      "update-order.php",
      "POST",
      {
        section,
        order: JSON.stringify(updatedOrder),
      },
      () => console.log("Order updated successfully"),
      (xhr, status, error) => {
        console.error("Error updating order:", error);
        alert("Error updating order. Please try again.");
      }
    );
  },

  // Function to handle collapsing/expanding the experience dot point list
  toggleList: function (contentId) {
    if (Experience.isDragging) return; // Ignore toggle action during dragging
    const content = $("#" + contentId);
    content.is(":visible") ? content.slideUp(300) : content.slideDown(300); // Toggle with animation
  },

  // Populate month and year dropdowns with accessibility improvements
  populateDateDropdowns: function (isEdit, experience = null) {
    const months = [
      {
        value: "01",
        text: "January",
      },
      {
        value: "02",
        text: "February",
      },
      {
        value: "03",
        text: "March",
      },
      {
        value: "04",
        text: "April",
      },
      {
        value: "05",
        text: "May",
      },
      {
        value: "06",
        text: "June",
      },
      {
        value: "07",
        text: "July",
      },
      {
        value: "08",
        text: "August",
      },
      {
        value: "09",
        text: "September",
      },
      {
        value: "10",
        text: "October",
      },
      {
        value: "11",
        text: "November",
      },
      {
        value: "12",
        text: "December",
      },
    ];

    // Populate months for start and end dates
    $("#start_month, #end_month")
      .empty()
      .append('<option value="">Select Month</option>');
    months.forEach((month) => {
      $("#start_month, #end_month").append(
        $("<option>", {
          value: month.value,
          text: month.text,
        })
      );
    });

    const currentYear = new Date().getFullYear();
    // Populate years for start and end dates (last 50 years)
    $("#start_year, #end_year")
      .empty()
      .append('<option value="">Select Year</option>');
    for (let year = currentYear; year >= currentYear - 50; year--) {
      $("#start_year, #end_year").append(
        $("<option>", {
          value: year,
          text: year,
        })
      );
    }

    // If editing an experience, populate the start and end dates with retrieved values
    if (isEdit) {
      // Define an array of full month names in order.
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      if (experience.start_date) {
        // Convert the full month name to a two-digit number.
        const startMonthNum = (monthNames.indexOf(experience.start_month) + 1)
          .toString()
          .padStart(2, "0");
        $("#start_month").val(startMonthNum);
        $("#start_year").val(experience.start_year);
      }

      if (experience.end_date) {
        // Convert the full month name to a two-digit number.
        const endMonthNum = (monthNames.indexOf(experience.end_month) + 1)
          .toString()
          .padStart(2, "0");
        $("#end_month").val(endMonthNum);
        $("#end_year").val(experience.end_year);

        if (experience.is_current) {
          // If the experience is still ongoing, disable the fields
          $("#current_job").prop("checked", true);
          $("#end-date-container").hide();
        } else {
          // If the experience has ended, set the end date fields accordingly
          $("#current_job").prop("checked", false);
          $("#end-date-container").show();
        }
      }
    } else {
      $("#current_job").prop("checked", false);
      $("#end-date-container").show();
    }

    // Handle "Currently working here" checkbox functionality
    $("#current_job")
      .off("change")
      .on("change", function () {
        if ($(this).is(":checked")) {
          $("#end-date-container").hide();
        } else {
          $("#end_month, #end_year").prop("disabled", false);
          $("#end-date-container").show();
        }
      });

    // Initialize checkbox value based on its initial state
    $("#current_job").trigger("change");
  },

  // Open the add/edit experience modal when a button is clicked
  openExperienceModal: function (
    isEdit = false,
    experience = null,
    call = null
  ) {
    $("#modal-experience").data("entry-type", call);
    let positionField = "";
    let organisationField = "";

    // Toggle visibility of fields
    if (call === "work_experience") {
      const modalTitle = isEdit
        ? "Edit Work Experience"
        : "Add Work Experience";

      positionField = isEdit ? experience.job_position_lang_1 : "";
      organisationField = isEdit ? experience.employer : "";

      $("#modalTitleExperience").text(modalTitle);
      // Show and enable
      $("#organisation-field-work, #position-field-work").show();
      $("#organisation-field-work input")
        .val(organisationField)
        .prop("disabled", false);
      $("#position-field-work input")
        .val(positionField)
        .prop("disabled", false);
      // Hide and disable
      $("#organisation-field-education, #position-field-education").hide();
      $(
        "#organisation-field-education input, #position-field-education input"
      ).prop("disabled", true);
    } else if (call === "education") {
      const modalTitle = isEdit ? "Edit Education" : "Add Education";

      positionField = isEdit ? experience.course_lang_1 : "";
      organisationField = isEdit ? experience.school : "";

      $("#modalTitleExperience").text(modalTitle);
      // Show and enable
      $("#organisation-field-education, #position-field-education").show();
      $("#organisation-field-education input")
        .val(organisationField)
        .prop("disabled", false);
      $("#position-field-education input")
        .val(positionField)
        .prop("disabled", false);
      // Hide and disable
      $("#organisation-field-work, #position-field-work").hide();
      $("#organisation-field-work input, #position-field-work input").prop(
        "disabled",
        true
      );
    }

    // Reset form fields for a new entry
    if (!isEdit) {
      Experience.currentEditId = null; // Reset for adding
      $("#form-experience")[0].reset();
      $("#addEntryBtn").prop("disabled", false).show();
      $("#updateEntryBtn").prop("disabled", true).hide();
      Experience.populateDateDropdowns(false);
    } else {
      Experience.currentEditId = experience.id; // Track the ID being edited
      $("#city").val(experience.city);
      $("#country").val(experience.country_lang_1);
      $("#updateEntryBtn").prop("disabled", false).show();
      $("#addEntryBtn").prop("disabled", true).hide();
      Experience.populateDateDropdowns(true, experience);
    }

    // Show the modal
    $("#modal-experience").modal("show");
  },

  // Reset all fields in the modal
  resetModalFields: function () {
    $("#form-experience")[0].reset();
    $("#organisation-field").empty();
    $("#position-field").empty();
    $("#end-date-container").show();
    $(".form-control").removeClass("is-invalid");
  },

  // Initialize Sortable for the specified container
  initializeSortable: function (containerId, call) {
    const container = document.getElementById(containerId);
    if (!container) return;

    new Sortable(container, {
      handle: ".drag-handle", // Restrict dragging to the handle
      animation: 150,
      ghostClass: "sortable-ghost", // Class applied to the "ghost" of the item being dragged
      chosenClass: "sortable-chosen", // Class applied to the item while being dragged
      dragClass: "sortable-drag", // Optional: Add a class while dragging for further customization
      forceFallback: true, // This helps to use the fallback if HTML5 dnd is not working well
      fallbackClass: "sortable-placeholder", // Class applied to the placeholder
      onStart: function (evt) {
        Experience.isDragging = true;

        const item = evt.item;
        const header = item.querySelector(".experience-header");

        // Hide the text inside the header and apply a border and remove background color
        if (header) {
          header.style.border = "2px dashed #ccc";
          header.style.backgroundColor = "transparent";

          // Hide all text elements within the header
          const textElements = header.querySelectorAll("h3, .sub-heading");
          textElements.forEach((element) => {
            element.style.visibility = "hidden";
          });
        }

        const content = evt.item.querySelector(".drag-handle");
        const timePlot = evt.item.querySelector(".time");
        if (content) content.style.display = "none";
        if (timePlot) timePlot.style.display = "none";
      },
      onEnd: function (evt) {
        Experience.isDragging = false;

        const item = evt.item;
        const header = item.querySelector(".experience-header");

        // Revert the header styles and show text again
        if (header) {
          header.style.border = "none";
          header.style.backgroundColor = ""; // Revert to default or prior background color

          // Show all text elements within the header
          const textElements = header.querySelectorAll("h3, .sub-heading");
          textElements.forEach((element) => {
            element.style.visibility = "visible";
          });
        }

        const content = evt.item.querySelector(".drag-handle");
        const timePlot = evt.item.querySelector(".time");
        if (content) content.style.display = "";
        if (timePlot) timePlot.style.display = "";
        Experience.reorderItems(evt, call);
      },
    });
  },

  // Function to add a skill to an experience or education entry
  addPoint: function (call, parentId) {
    const inputId = `#input_experience_${parentId}`;
    const inputElement = $(inputId);
    const value = inputElement.val().trim();

    if (!value) {
      alert("Please enter a skill before adding.");
      return;
    }

    SkillPointManager.add({
      category: call,
      parentId,
      input: value,
      selLang: selectedLanguage,
      column: "skill",
      onSuccess: (newLi) => {
        const container = $(`#skills_list_${parentId}`);
        const placeholder = container.find(".text-muted");
        if (placeholder.length) placeholder.remove();
        container.append(newLi);
        inputElement.val("");
      }
    });
  },

  // Helper function to get month abbreviation
  getMonthAbbreviation: function (monthValue) {
    const months = {
      "01": "Jan",
      "02": "Feb",
      "03": "Mar",
      "04": "Apr",
      "05": "May",
      "06": "Jun",
      "07": "Jul",
      "08": "Aug",
      "09": "Sep",
      10: "Oct",
      11: "Nov",
      12: "Dec",
    };
    return months[monthValue] || "";
  },

  // Function to add a new experience entry
  addExperience: function (call) {
    let isValid = true;

    // Required fields for validation
    const requiredFields = ["city", "country", "start_month", "start_year"];
    if (call === "work_experience") {
      requiredFields.push("employer", "job_position");
    } else if (call === "education") {
      requiredFields.push("school", "course");
    }

    // Add end date fields to required if "Currently working here" is unchecked
    const isCurrent = $("#current_job").is(":checked");
    if (!isCurrent) {
      requiredFields.push("end_month", "end_year");
    }

    // Validate each required field
    requiredFields.forEach((fieldId) => {
      const field = $(`#${fieldId} `);
      if (field.val().trim() === "") {
        field.addClass("is-invalid"); // Highlight the empty field
        isValid = false;
      } else {
        field.removeClass("is-invalid"); // Remove highlight if valid
      }
    });

    if (!isValid) {
      alert("Please fill out all required fields.");
      return; // Stop submission if validation fails
    }

    const formData = {
      city: $("#city").val().trim(),
      country: $("#country").val().trim(),
      start_month: $("#start_month").val().trim(),
      start_year: $("#start_year").val().trim(),
      is_current: isCurrent ? 1 : 0,
      call: call,
    };

    // Add specific fields for work experience or education
    if (formData.call === "work_experience") {
      formData.employer = $("#employer").val().trim();
      formData.job_position = $("#job_position").val().trim();
    } else {
      formData.school = $("#school").val().trim();
      formData.course = $("#course").val().trim();
    }

    // Add end date fields if "Currently working here" is unchecked
    if (!formData.is_current) {
      formData.end_month = $("#end_month").val().trim();
      formData.end_year = $("#end_year").val().trim();
      formData.end_date = `${Experience.getMonthAbbreviation(
        formData.end_month
      )
        } ${formData.end_year} `;
    } else {
      // Set end date to current date when "Currently working here" is checked
      const today = new Date();
      formData.end_date = `${Experience.getMonthAbbreviation(
        `0${today.getMonth() + 1}`.slice(-2)
      )
        } ${today.getFullYear()} `;
    }

    // Create the formatted start date using month abbreviations
    formData.start_date = `${Experience.getMonthAbbreviation(
      formData.start_month
    )
      } ${formData.start_year} `;

    Experience.ajaxRequest(
      "add-entry.php",
      "POST",
      formData,
      function (response) {
        if (response.status === "success") {
          console.log("Entry added successfully");
          $("#modal-experience").modal("hide");
          Experience.fetchData(call); // Refresh the list with new entry
        } else {
          console.error("Unexpected response:", response);
          alert("Error adding entry. Please try again.");
        }
      },
      function (xhr, status, error) {
        console.error("Error adding entry:", error);
        alert("Error adding entry. Please try again.");
      }
    );
  },

  // Function to update an experience entry
  updateExperience: function (experienceId, call) {
    let isValid = true;

    // Required fields for both work experience and education
    const requiredFields = ["city", "country", "start_month", "start_year"];

    // Determine which specific fields to use for work experience or education
    if (call === "work_experience") {
      requiredFields.push("employer", "job_position");
    } else if (call === "education") {
      requiredFields.push("school", "course");
    }

    // Add end date fields to required if "Currently working here" is unchecked
    const isCurrent = $("#current_job").is(":checked");
    if (!isCurrent) {
      requiredFields.push("end_month", "end_year");
    }

    // Validate each required field
    requiredFields.forEach((fieldId) => {
      const field = $(`#${fieldId} `);
      if (field.val().trim() === "") {
        field.addClass("is-invalid"); // Highlight the empty field
        isValid = false;
      } else {
        field.removeClass("is-invalid"); // Remove highlight if valid
      }
    });

    if (!isValid) {
      alert("Please fill out all required fields.");
      return; // Stop submission if validation fails
    }

    const formData = {
      id: experienceId,
      city: $("#city").val().trim(),
      country: $("#country").val().trim(),
      start_month: $("#start_month").val().trim(),
      start_year: $("#start_year").val().trim(),
      is_current: isCurrent ? 1 : 0,
      call: call,
    };

    // Add specific fields for work experience or education
    if (formData.call === "work_experience") {
      formData.employer = $("#employer").val().trim();
      formData.job_position = $("#job_position").val().trim();
    } else {
      formData.school = $("#school").val().trim();
      formData.course = $("#course").val().trim();
    }

    // Add end date fields if "Currently working here" is unchecked
    if (!formData.is_current) {
      formData.end_month = $("#end_month").val().trim();
      formData.end_year = $("#end_year").val().trim();
      formData.end_date = `${Experience.getMonthAbbreviation(
        formData.end_month
      )
        } ${formData.end_year} `;
    } else {
      // Set end date to current date when "Currently working here" is checked
      const today = new Date();
      formData.end_date = `${Experience.getMonthAbbreviation(
        `0${today.getMonth() + 1}`.slice(-2)
      )
        } ${today.getFullYear()} `;
    }

    // Create the formatted start date using month abbreviations
    formData.start_date = `${Experience.getMonthAbbreviation(
      formData.start_month
    )
      } ${formData.start_year} `;

    console.log("Updating entry:", formData.call);

    // AJAX request to update the experience in the database
    Experience.ajaxRequest(
      "update-entry.php",
      "POST",
      formData,
      function () {
        console.log("Entry updated successfully");
        $("#modal-experience").modal("hide");
        Experience.fetchData(formData.call); // Refresh the list with updated entry
      },
      function (xhr, status, error) {
        console.error("Error updating entry:", error);
        alert("Error updating entry. Please try again.");
      }
    );
  },

  // Attach event listeners for various actions
  addEventListeners: function () {
    // Add event listener to toggle the visibility of the edit/delete buttons
    $(document)
      .off("click", ".menu-toggle")
      .on("click", ".menu-toggle", function (e) {
        e.stopPropagation(); // Prevent click event from affecting other elements
        const experienceId = $(this).attr("id").split("_")[1];
        const actionButtons = $(`#action_buttons_${experienceId} `);
        const menuIcon = $(`#menu_${experienceId} i`);

        // Toggle visibility of action buttons and change icon
        if (actionButtons.hasClass("visible")) {
          actionButtons.removeClass("visible");
          menuIcon.removeClass("fa-times").addClass("fa-ellipsis-h");
        } else {
          actionButtons.addClass("visible");
          menuIcon.removeClass("fa-ellipsis-h").addClass("fa-times");
        }
      });

    // Add event listener to handle clicking on edit and delete buttons
    $(document)
      .off("click", ".edit-experience")
      .on("click", ".edit-experience", function (e) {
        e.stopPropagation(); // Prevent click event from affecting other elements
        e.preventDefault();
        const experienceId = $(this).data("id");
        const call = $(this).data("call");
        console.log("Id:");
        console.log(experienceId);
        console.log("Call:");
        console.log(call);
        Experience.ajaxRequest(
          "fetch-single-experience.php",
          "GET",
          {
            id: experienceId,
            call,
          },
          (experience) => Experience.openExperienceModal(true, experience, call)
        );
      });

    $(document)
      .off("click", ".delete-experience")
      .on("click", ".delete-experience", function (e) {
        e.stopPropagation(); // Prevent click event from affecting other elements
        e.preventDefault();
        if (!confirm("Are you sure you want to delete this entry?")) return;
        const experienceId = $(this).data("id");
        const call = $(this).data("call");
        Experience.ajaxRequest(
          "delete-entry.php",
          "POST",
          {
            id: experienceId,
            call,
          },
          () => Experience.fetchData(call)
        );
      });

    // Handle the Add button click
    $(document)
      .off("click", "#addEntryBtn")
      .on("click", "#addEntryBtn", function () {
        const call = $("#modal-experience").data("entry-type"); // Get the entry type from the modal's data attribute
        Experience.addExperience(call);
      });

    // Handle the Save button click
    $(document)
      .off("click", "#updateEntryBtn")
      .on("click", "#updateEntryBtn", function () {
        const experienceId = Experience.currentEditId; // Use the global variable to track the editing entry
        const call = $("#modal-experience").data("entry-type"); // Get the entry type from the modal's data attribute
        Experience.updateExperience(experienceId, call);
      });

    $(document)
      .off("click", "#btn-add-experience")
      .on("click", "#btn-add-experience", function () {
        const call = $(this).data("entry-type");
        Experience.openExperienceModal(false, null, call);
        console.log("opening add modal " + call);
      });

    // Reset modal fields on modal close
    $("#modal-experience").on("hidden.bs.modal", function () {
      Experience.resetModalFields();
      Experience.isEditMode = false;
      Experience.currentEditId = null; // Reset edit mode
    });

    $("#current_job").on("change", function () {
      $("#end-date-container").toggle(!$(this).is(":checked"));
    });

    $(document)
      .off("click", ".experience-header")
      .on("click", ".experience-header", function (e) {
        if (!Experience.isDragging) {
          const experienceId = $(this).attr("id").split("_")[2];
          const contentId = `content_${experienceId} `;
          Experience.toggleList(contentId);
        }
      });

    // Handle saving translations
    $(document).on("click", ".save-translation", function () {
      const id = $(this).data("id");
      const column = $(this).data("column");
      const call = $(this).data("call");
      const type = $(this).data("type"); // entry or point
      const inputValue = $(this).prev(".translate-input").val().trim();

      if (!inputValue) {
        alert("Please enter a valid translation.");
        return;
      }

      // Update entry translation using update-entry.php
      Experience.ajaxRequest(
        "update-translation.php",
        "POST",
        {
          id,
          call,
          column,
          inputValue,
          type
        },
        function (response) {
          if (response.status === "success") {
            alert("Translation saved successfully.");
            //Experience.fetchData(call); // Reload experiences
          } else {
            console.error("Error saving translation:", response.message);
          }
        },
        function (xhr, status, error) {
          console.error("Error saving entry translation:", error);
        }
      );
    });
  }
};
