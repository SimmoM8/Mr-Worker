document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".sidebar-nav .nav-link"); // Select all sidebar buttons
  const mainContent = document.getElementById("main-content"); // The main content area

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

  document.addEventListener("click", (event) => {
    const form = document.getElementById("reportForm");
    const reportButton = document.getElementById("reportButton");

    toggleFormVisibility(form);

    // Hide the form if clicking outside of it and not on the button
    if (!form.contains(event.target) && !reportButton.contains(event.target)) {
      if (form.classList.contains("visible")) {
        toggleFormVisibility(form);
      }
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

  // Function to show and hide form with animation
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
    buttons.forEach((button) => {
      if (button.getAttribute("data-page") === page) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });
  }

  // Function to initialize dynamically loaded content
  function initializeContent() {
    console.log("Initializing dynamically loaded content...");

    // Check if Experience.js is loaded and call init
    if (typeof Experience !== "undefined" && Experience.init) {
      Experience.init(); // Call the init function from experience.js
    }
  }

  // Add click event listeners to sidebar buttons
  buttons.forEach((button) => {
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

  // Initial page load based on URL
  const urlParams = new URLSearchParams(window.location.search);
  const initialPage = urlParams.get("page") || "resumes.php"; // Default to resumes.php
  loadPage(initialPage); // Load the initial page
});
