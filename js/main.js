const apiRequest = async (table, action, data = {}, conditions = {}, options = {}) => {
  try {
    const response = await fetch('../api.php', {
      method: 'POST',
      body: JSON.stringify({
        table,
        action,
        data,
        conditions,
        ...options
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await response.json();
    if (!result.success) {
      console.error("API Error:", result.message);
    }
    return result;
  } catch (error) {
    console.error("API Request Failed:", error);
    return { success: false, message: "Network error." };
  }
};

document.addEventListener("DOMContentLoaded", function () {

  // Initial page load based on URL
  const urlParams = new URLSearchParams(window.location.search);
  const initialPage = urlParams.get("page") || "resumes.php";
  const initialType = urlParams.get("type") || null;
  NavigationManager.loadPage(initialPage, initialType); // Load the initial page

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

  // Global handler: Pressing Enter triggers related button click via data-trigger-button
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      const target = e.target;
      const triggerSelector = target.getAttribute('data-trigger-button');
      if (triggerSelector) {
        const button = document.querySelector(triggerSelector);
        if (button) {
          e.preventDefault();
          button.click();
        }
      }
    }
  });

  // Initialize TranslationConfig
  TranslationConfig.init();

  // Global handler: Save translation input
  $(document).on("click", ".save-translation", function () {
    const $button = $(this);
    const $input = $button.siblings(".translate-input");
    const newText = $input.val().trim();

    const id = $button.data("id");
    const call = $button.data("call");
    const column = $button.data("column");
    const lang = $button.data("lang");

    if (!newText) {
      alert("Please enter a valid translation.");
      return;
    }

    $.ajax({
      url: "update-translation.php",
      method: "POST",
      data: {
        id,
        call,
        column,
        value: newText,
        lang,
      },
      success: function (response) {
        if (response.status === "success") {
          alert("Translation saved!");
        } else {
          alert("Error saving translation: " + response.message);
        }
      },
      error: function () {
        alert("An error occurred. Please try again.");
      }
    });
  });
});
