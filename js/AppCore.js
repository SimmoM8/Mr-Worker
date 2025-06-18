import { NavigationManager } from "./navigation.js";
import { TranslationConfig } from "./TranslationConfig.js";

export const AppCore = {
    init: function () {
        console.log("✅ AppCore initialized");
        NavigationManager.init();
        TranslationConfig.init();
        this.loadInitialPage();
        this.setupReportForm();
        this.setupEnterKeyBinding();
        this.setupTranslationSaveListener();
    },

    loadInitialPage: function () {
        const urlParams = new URLSearchParams(window.location.search);
        const initialPage = urlParams.get("page") || "skills";
        const initialType = urlParams.get("type") || null;
        NavigationManager.loadPage(initialPage, initialType);
    },

    setupReportForm: function () {
        const form = document.getElementById("reportForm");
        const reportButton = document.getElementById("reportButton");

        document.addEventListener("click", (event) => {
            if (event.target === reportButton) return this.toggleFormVisibility(form);
            if (form.contains(event.target)) return;
            if (form.classList.contains("visible")) this.toggleFormVisibility(form);
        });

        const submitBtn = document.getElementById("submitReport");
        if (submitBtn) {
            submitBtn.addEventListener("click", (event) => {
                event.preventDefault();
                const message = document.getElementById("reportMessage").value.trim();
                if (message === "") {
                    this.showMessage("Please enter a message before submitting.", "error");
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
                            this.showMessage(data.message, "success");
                            this.toggleFormVisibility(form);
                            document.getElementById("reportMessage").value = "";
                        } else {
                            this.showMessage(data.message, "error");
                        }
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                        this.showMessage("An error occurred. Please try again.", "error");
                    });
            });
        }
    },

    setupEnterKeyBinding: function () {
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
    },

    setupTranslationSaveListener: function () {
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
    },

    toggleFormVisibility: function (form) {
        if (form.classList.contains("visible")) {
            form.classList.remove("visible");
            form.classList.add("hidden");
        } else {
            form.classList.remove("hidden");
            form.classList.add("visible");
        }
    },

    showMessage: function (message, type) {
        const bubble = document.createElement("div");
        bubble.className = `message-bubble ${type}`;
        bubble.textContent = message;

        document.body.appendChild(bubble);
        setTimeout(() => bubble.remove(), 3000);
    }
};
console.log("✅ AppCore.js loaded");