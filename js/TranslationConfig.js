const TranslationConfig = (function () {
    // Internal state
    let translateMode = false;
    let referenceLanguage = null;
    let targetLanguage = null;
    let selectedLanguage = null;
    let slotLanguages = [];
    let availableLanguages = [];

    let subscribers = [];

    function getConfig() {
        const selectedSlotIndex = slotLanguages.findIndex(code => code === selectedLanguage);
        const selectedLangKey = selectedSlotIndex !== -1 ? `lang_${selectedSlotIndex + 1}` : null;
        return {
            translateMode,
            referenceLanguage,
            targetLanguage,
            selectedLanguage,
            selectedSlotIndex,
            selectedLangKey
        };
    }

    function toggleTranslateMode() {
        translateMode = !translateMode;
        const subToolbar = document.getElementById("translate-subtoolbar");
        if (subToolbar) {
            subToolbar.classList.toggle("d-none", !translateMode);
        }
    }

    function setReferenceLanguage(langCode) {
        referenceLanguage = langCode;
    }

    function setSelectedLanguage(langCode) {
        console.log("Setting selected language to:", langCode);
        selectedLanguage = langCode;
        renderSelectedLanguageUI();
        notifySubscribers();
    }

    function notifySubscribers() {
        const config = getConfig();
        subscribers.forEach(fn => {
            if (typeof fn === "function") fn(config);
        });
    }

    function onUpdate(callback) {
        if (typeof callback === "function") {
            subscribers.push(callback);
        }
    }

    function handleAddSlotLanguage() {
        const placeholder = document.getElementById("languageEditorModalPlaceholder");
        if (!placeholder) return;

        placeholder.innerHTML = `
            <div class="modal fade" id="addLanguageModal" tabindex="-1">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Add a Translation Language</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body">
                    <input type="text" id="languageSearchInput" class="form-control" placeholder="Search for a language..." autocomplete="off">
                    <ul id="languageSearchResults" class="list-group mt-2" style="max-height: 200px; overflow-y: auto;"></ul>
                  </div>
                  <div class="modal-footer">
                    <button id="confirmAddLanguage" class="btn btn-primary">Add</button>
                  </div>
                </div>
              </div>
            </div>`;

        const modal = new bootstrap.Modal(document.getElementById("addLanguageModal"));
        modal.show();

        const searchInput = document.getElementById("languageSearchInput");
        const resultsList = document.getElementById("languageSearchResults");
        // Focus input after modal fully opens (shown.bs.modal event)
        document.getElementById("addLanguageModal").addEventListener("shown.bs.modal", () => {
            searchInput.focus();
        });

        function updateSearchResults() {
            const query = searchInput.value.toLowerCase().trim();
            const usedCodes = new Set(slotLanguages);
            resultsList.innerHTML = "";

            if (!query) {
                resultsList.style.display = "none";
                return;
            }

            const matches = availableLanguages.filter(lang =>
                lang &&
                typeof lang.language_name === "string" &&
                typeof lang.language_code === "string" &&
                !usedCodes.has(lang.language_code) &&
                (lang.language_name.toLowerCase().includes(query) || lang.language_code.toLowerCase().includes(query))
            );

            if (matches.length === 0) {
                const emptyItem = document.createElement("li");
                emptyItem.className = "list-group-item text-muted";
                emptyItem.textContent = "No matches found";
                resultsList.appendChild(emptyItem);
                resultsList.style.display = "block";
                return;
            }

            matches.forEach(lang => {
                const item = document.createElement("li");
                item.className = "list-group-item list-group-item-action";
                item.textContent = `${lang.language_name}`;
                item.addEventListener("click", () => {
                    searchInput.value = `${lang.language_name}`;
                    searchInput.dataset.langCode = lang.language_code;
                    resultsList.innerHTML = "";
                    resultsList.style.display = "none";
                });
                resultsList.appendChild(item);
            });

            resultsList.style.display = "block";
        }

        searchInput.addEventListener("input", updateSearchResults);
        updateSearchResults();

        document.getElementById("confirmAddLanguage").addEventListener("click", () => {
            const langCode = searchInput.dataset.langCode;
            console.log("langCode selected:", langCode);
            if (langCode && !slotLanguages.includes(langCode)) {
                addSlotLanguage(langCode);
                modal.hide();
            } else {
                alert("Please select a valid language.");
            }
        });
    }

    function addSlotLanguage(langCode) {
        console.log("Adding langCode to slot:", langCode);
        const updatedSlots = [...slotLanguages.filter(Boolean), langCode].slice(0, 4);
        console.log("Updated slots to save:", updatedSlots);
        setSlotLanguages(updatedSlots);
        apiRequest("user_languages", "update", {
            lang_1: updatedSlots[0] || null,
            lang_2: updatedSlots[1] || null,
            lang_3: updatedSlots[2] || null,
            lang_4: updatedSlots[3] || null
        });
    }

    function renderSelectedLanguageUI() {
        const slotContainer = document.getElementById("languageSlotButtons");
        if (slotContainer) {
            slotContainer.innerHTML = "";
            slotLanguages.forEach(lang => {
                if (!lang) return;
                const btn = document.createElement("button");
                btn.className = `btn btn-sm ${lang === selectedLanguage ? "btn-primary" : "btn-outline-primary"}`;
                btn.textContent = lang.toUpperCase();
                btn.addEventListener("click", () => {
                    setSelectedLanguage(lang);
                });
                slotContainer.appendChild(btn);
            });
            if (slotLanguages.filter(Boolean).length < 4) {
                const addBtn = document.createElement("button");
                addBtn.className = "btn btn-sm btn-outline-success";
                addBtn.textContent = "+";
                addBtn.addEventListener("click", handleAddSlotLanguage);
                slotContainer.appendChild(addBtn);
            }
        }

        const userLangSelector = document.getElementById("userLanguageSelector");
        if (userLangSelector) {
            userLangSelector.innerHTML = "";
            slotLanguages.forEach(lang => {
                if (!lang) return;
                const option = document.createElement("option");
                option.value = lang;
                const langName = (availableLanguages.find(l => l.language_code === lang) || {}).language_name || lang.toUpperCase();
                option.textContent = langName;
                if (lang === selectedLanguage) {
                    option.selected = true;
                }
                userLangSelector.appendChild(option);
            });
        }
    }

    function setSlotLanguages(newArray) {
        slotLanguages = [...newArray];
        if (!selectedLanguage && slotLanguages.length > 0) {
            selectedLanguage = slotLanguages[0];
        }
        renderSelectedLanguageUI();
    }

    function init() {
        apiRequest("global_languages", "fetch", {}, {}, { user_scope: false }).then(res => {
            if (res.success && Array.isArray(res.data)) {
                availableLanguages = res.data;
                console.log("Available languages:", availableLanguages);
            }
        });

        // Fetch user's saved slot languages from the database using global api() helper
        apiRequest("user_languages", "fetch").then(res => {
            if (res.success && res.data) {
                console.log("Fetched user languages:", res.data);
                const row = res.data[0];
                const langs = [
                    row.lang_1,
                    row.lang_2,
                    row.lang_3,
                    row.lang_4
                ];
                console.log("slot languages:", langs);
                setSlotLanguages(langs);
            }
        });

        const toggleSwitch = document.getElementById("translateModeSwitch");
        if (toggleSwitch) {
            toggleSwitch.addEventListener("change", () => {
                toggleTranslateMode();
            });
        }

        const refSelector = document.getElementById("refLanguageSelector");
        if (refSelector) {
            refSelector.addEventListener("change", () => {
                setReferenceLanguage(refSelector.value);
            });
        }

        renderSelectedLanguageUI();

        const displaySelector = document.getElementById("userLanguageSelector");
        if (displaySelector) {
            displaySelector.addEventListener("change", () => {
                setSelectedLanguage(displaySelector.value);
            });
        }
    }

    return {
        init,
        getConfig,
        toggleTranslateMode,
        setReferenceLanguage,
        setSelectedLanguage,
        setSlotLanguages,
        onUpdate
    };
})();