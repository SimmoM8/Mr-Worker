document.addEventListener("DOMContentLoaded", function () {
  const navButtons = document.querySelectorAll(".sidebar-nav .nav-link"); // Select all sidebar buttons
  const mainContent = document.getElementById("main-content"); // The main content area

  // Initial page load based on URL
  const urlParams = new URLSearchParams(window.location.search);
  const initialPage = urlParams.get("page") || "resumes.php"; // Default to resumes.php
  loadPage(initialPage); // Load the initial page

  // Function to dynamically load content
  function loadPage(page) {
    mainContent.innerHTML = "<p>Loading...</p>"; // Show loading message

    // AJAX request to fetch the page content
    const xhr = new XMLHttpRequest();
    xhr.open("GET", page, true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        // Inject the fetched content into the main-content div
        mainContent.innerHTML = xhr.responseText;

        // Re-execute scripts in the loaded content
        executeScripts(mainContent);

        // Update the active button
        updateActiveButton(page);
      } else {
        mainContent.innerHTML = `<p>Error loading page: ${xhr.status}</p>`;
      }
    };
    xhr.onerror = function () {
      mainContent.innerHTML =
        "<p>An error occurred while loading the page.</p>";
    };
    xhr.send();
  }

  /** LANGUAGE SELECTION **/
  const userLanguageSelector = document.getElementById("userLanguageSelector");
  const addLanguageContainer = document.getElementById("addLanguageContainer");
  const searchLanguageInput = document.getElementById("searchLanguageInput");
  const languagesDropdown = document.getElementById("languagesDropdown");
  const addLanguageBtn = document.getElementById("addLanguageBtn");
  const cancelAddLanguageBtn = document.getElementById("cancelAddLanguageBtn");

  // Initial load: Fetch user languages
  fetchUserLanguages();

  /** Fetch user languages from DB and populate selector **/
  async function fetchUserLanguages() {
    try {
      const response = await fetch("fetch_user_languages.php");
      const data = await response.json();

      if (data.no_languages) {
        showMissingDefaultLanguagePopup();
      } else {
        updateLanguageOptions(data.languages, data.selected_language);
      }
    } catch (error) {
      console.error("Error fetching user languages:", error);
    }
  }

  /** Show the popup if no default language is set **/
  function showMissingDefaultLanguagePopup() {
    const popup = document.createElement("div");
    popup.id = "languagePopup";
    popup.classList.add("modal", "fade", "show");
    popup.setAttribute("tabindex", "-1");
    popup.innerHTML = `
      <div class="modal-dialog" role="document">
        <div class="modal-content p-3">
          <h5 class="modal-title">Set Default Language</h5>
          <p><small>Please choose a default language for your profile.</small></p>
          <div class="dropdown w-100">
            <input type="text" id="popupLanguageInput" class="form-control dropdown-toggle"
              placeholder="Search for a language..." autocomplete="off">
            <ul id="popupLanguagesDropdown" class="dropdown-menu w-100"></ul>
          </div>
          <button id="confirmDefaultLanguageBtn" class="btn btn-primary mt-3 w-100" disabled>Set Default</button>
        </div>
      </div>`;

    document.body.appendChild(popup);
    const popupLanguageInput = document.getElementById("popupLanguageInput");
    const popupLanguagesDropdown = document.getElementById("popupLanguagesDropdown");
    const confirmBtn = document.getElementById("confirmDefaultLanguageBtn");

    new bootstrap.Modal(popup).show();

    popupLanguageInput.addEventListener("input", async () => {
      const query = popupLanguageInput.value.trim();
      if (query.length > 0) {
        const languages = await fetchLanguages(query);
        populateDropdown(languages, popupLanguagesDropdown, (languageCode, languageName) => {
          popupLanguageInput.value = languageName;
          confirmBtn.dataset.langCode = languageCode;
          confirmBtn.disabled = false;
        });
      } else {
        clearDropdown(popupLanguagesDropdown);
      }
    });

    confirmBtn.addEventListener("click", async () => {
      const selectedLangCode = confirmBtn.dataset.langCode;
      if (selectedLangCode) {
        await updateUserLanguage(selectedLangCode, "insert", "lang_1");
        bootstrap.Modal.getInstance(popup).hide();
      }
    });
  }

  /** Fetch languages based on search input **/
  async function fetchLanguages(query) {
    try {
      const response = await fetch(`fetch_languages.php?q=${encodeURIComponent(query)}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching languages:", error);
      return [];
    }
  }

  /** Populate the language dropdown list **/
  function populateDropdown(languages, dropdownContainer, onSelect) {
    clearDropdown(dropdownContainer);
    if (languages.length === 0) {
      const noResultItem = createDropdownItem("No results found", true);
      dropdownContainer.appendChild(noResultItem);
      showDropdown(dropdownContainer);
      return;
    }

    languages.forEach(({ language_name, language_code }) => {
      const langItem = createDropdownItem(language_name);
      langItem.addEventListener("click", () => {
        onSelect(language_code, language_name);
        hideDropdown(dropdownContainer);
      });
      dropdownContainer.appendChild(langItem);
    });
    showDropdown(dropdownContainer);
  }

  /** Create a dropdown item **/
  function createDropdownItem(text, disabled = false) {
    const item = document.createElement("li");
    item.classList.add("dropdown-item");
    item.textContent = text;
    if (disabled) item.classList.add("text-muted");
    return item;
  }

  /** Update language options in the selector **/
  function updateLanguageOptions(languages, selectedLanguage) {
    userLanguageSelector.innerHTML = "";

    Object.entries(languages).forEach(([column, languageName]) => {
      const option = document.createElement("option");
      option.value = column;
      option.textContent = languageName;
      if (column === selectedLanguage) {
        option.selected = true;
      }
      userLanguageSelector.appendChild(option);
    });

    // Add "Add Language" option if less than 4 languages exist
    if (Object.keys(languages).length < 4) {
      const addOption = document.createElement("option");
      addOption.textContent = "+ Add Language";
      addOption.value = "add_language";
      userLanguageSelector.appendChild(addOption);
    }
  }

  /** Update or insert a language **/
  async function updateUserLanguage(languageCode, action, column = null) {
    try {
      const response = await fetch("update_user_languages.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language_code: languageCode, action, column }),
      });

      const data = await response.json();
      if (data.success) {
        fetchUserLanguages();
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error updating user language:", error);
    }
  }

  /** Change selected language and reload content **/
  userLanguageSelector.addEventListener("change", async () => {
    if (userLanguageSelector.value === "add_language") {
      showAddLanguageInput();
    } else {
      await updateSessionLanguage(userLanguageSelector.value);
      reloadCurrentPage(); // 🔄 Reload the dynamic content based on selected language
    }
  });

  /** Reload the current page content dynamically **/
  function reloadCurrentPage() {
    const currentPage = new URLSearchParams(window.location.search).get("page") || "resumes.php";
    console.log("Reloading current page...:", currentPage);
    loadPage(currentPage);
  }

  /** Update session language **/
  async function updateSessionLanguage(languageCode) {
    try {
      await fetch("update_language_session.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selected_language: languageCode }),
      });
    } catch (error) {
      console.error("Error updating session language:", error);
    }
  }

  /** Show input to add a new language **/
  function showAddLanguageInput() {
    userLanguageSelector.style.display = "none";
    addLanguageContainer.style.display = "flex";
    searchLanguageInput.focus();

    searchLanguageInput.addEventListener("input", async () => {
      const query = searchLanguageInput.value.trim();
      if (query.length > 0) {
        const languages = await fetchLanguages(query);
        populateDropdown(languages, languagesDropdown, async (languageCode, languageName) => {
          searchLanguageInput.value = languageName;
          addLanguageBtn.dataset.langCode = languageCode;
          addLanguageBtn.disabled = false;
        });
      } else {
        clearDropdown(languagesDropdown);
      }
    });

    addLanguageBtn.addEventListener("click", async () => {
      const langCode = addLanguageBtn.dataset.langCode;
      if (langCode) {
        await updateUserLanguage(langCode, "add");
        hideAddLanguageInput();
      }
    });

    cancelAddLanguageBtn.addEventListener("click", hideAddLanguageInput);
  }

  /** Clear existing dropdown items **/
  function clearDropdown(dropdownContainer) {
    dropdownContainer.innerHTML = "";
  }

  // Show the dropdown
  function showDropdown(dropdownContainer) {
    dropdownContainer.classList.add("show");
    dropdownContainer.style.display = "block"
  }

  // Hide the dropdown
  function hideDropdown(dropdownContainer) {
    dropdownContainer.classList.remove("show");
    dropdownContainer.style.display = "none";
  }

  /**  Hide add language input **/
  function hideAddLanguageInput() {
    addLanguageContainer.style.display = "none";
    userLanguageSelector.style.display = "block";
  }

  /** REPORTING FEATURE **/
  document.addEventListener("click", (event) => {
    const form = document.getElementById("reportForm");
    const reportButton = document.getElementById("reportButton");

    // Toggle form when clicking the report button
    if (event.target === reportButton) {
      return toggleFormVisibility(form);
    }

    // Do nothing if clicking inside the form (including the input field)
    if (form.contains(event.target)) return;

    // Hide the form if clicking outside
    if (form.classList.contains("visible")) {
      toggleFormVisibility(form);
    }
  });

  document.getElementById("submitReport").addEventListener("click", (event) => {
    event.preventDefault(); // Prevent page reload

    const form = document.getElementById("reportForm");
    const message = document.getElementById("reportMessage").value.trim();
    if (message === "") {
      showMessage("Please enter a message before submitting.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("reportMessage", message);
    formData.append("submitReport", true);

    fetch("save_report.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showMessage(data.message, "success");
          toggleFormVisibility(form);
          document.getElementById("reportMessage").value = ""; // Clear input field
        } else {
          showMessage(data.message, "error");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        showMessage("An error occurred. Please try again.", "error");
      });
  });

  // Function to show and hide report form with animation
  function toggleFormVisibility(form) {
    if (form.classList.contains("visible")) {
      form.classList.remove("visible");
      form.classList.add("hidden");
    } else {
      form.classList.remove("hidden");
      form.classList.add("visible");
    }
  }

  // Function to show message bubbles
  function showMessage(message, type) {
    const bubble = document.createElement("div");
    bubble.className = `message-bubble ${type}`;
    bubble.textContent = message;

    document.body.appendChild(bubble);

    setTimeout(() => {
      bubble.remove();
    }, 3000);
  }

  // Function to re-execute scripts within loaded content
  function executeScripts(container) {
    const scripts = container.querySelectorAll("script");
    scripts.forEach((script) => {
      const newScript = document.createElement("script");
      if (script.src) {
        // For external scripts, copy the src attribute and load asynchronously
        newScript.src = script.src;
        newScript.async = false; // Ensure execution order is maintained
      } else {
        // For inline scripts, copy the script content
        newScript.textContent = script.textContent;
      }
      document.body.appendChild(newScript); // Append and execute the script
    });
  }

  // Function to update active button
  function updateActiveButton(page) {
    navButtons.forEach((button) => {
      if (button.getAttribute("data-page") === page) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });
  }

  // Function to initialize dynamically loaded content
  function initializeContent() {
    // Check if Experience.js is loaded and call init
    if (typeof Experience !== "undefined" && Experience.init) {
      Experience.init(); // Call the init function from experience.js
    }
  }

  // Add click event listeners to sidebar buttons
  navButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const page = this.getAttribute("data-page");

      // Update the browser URL
      window.history.pushState(
        {
          page: page,
        },
        "",
        `?page=${page}`
      );

      // Load the selected page
      loadPage(page);
    });
  });

  // Handle browser back/forward navigation
  window.addEventListener("popstate", function (event) {
    if (event.state && event.state.page) {
      loadPage(event.state.page); // Load the page from history state
    }
  });

  // Event Listener for Translate Mode Toggle
  document.getElementById("translateModeToggle").addEventListener("click", function () {
    Experience.translateMode = !Experience.translateMode; // Toggle the mode
    this.textContent = Experience.translateMode ? "Disable Translate Mode" : "Enable Translate Mode";

    // Refresh the content to add/remove translation fields dynamically
    reloadCurrentPage();
  });

});
