import { setupLanguageSearch, fetchGlobalLanguages } from "./languageSearch.js";
import { apiRequest } from "./apiUtils.js";

export const TranslationConfig = (function () {
    // Internal state
    let translateMode = false;
    let referenceLanguage = null;
    let targetLanguage = null;
    let selectedLangCode = null;
    let slotLanguages = [];
    let availableLanguages = [];

    let subscribers = [];

    function getConfig() {
        const selectedSlotIndex = slotLanguages.findIndex(code => code === selectedLangCode);
        const selectedLangKey = selectedSlotIndex !== -1 ? `lang_${selectedSlotIndex + 1}` : null;
        return {
            translateMode,
            referenceLanguage,
            targetLanguage,
            selectedLangCode,
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
        selectedLangCode = langCode;
        localStorage.setItem("selectedLangCode", langCode);
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

        $('#addLanguageModal').on('shown.bs.modal', function () {
            document.querySelector("#languageSearchInput")?.focus();
        });

        setupLanguageSearch({
            inputSelector: "#languageSearchInput",
            resultContainerSelector: "#languageSearchResults",
            availableLanguages,
            alreadyAdded: slotLanguages,
            onSelect: (lang) => {
                const input = document.getElementById("languageSearchInput");
                input.value = lang.translated_name_en;
                input.dataset.langCode = lang.language_code;
                const resultsList = document.getElementById("languageSearchResults");
                resultsList.innerHTML = "";
                resultsList.style.display = "none";
            }
        });

        document.getElementById("confirmAddLanguage").addEventListener("click", () => {
            const langCode = document.getElementById("languageSearchInput").dataset.langCode;
            if (langCode && !slotLanguages.includes(langCode)) {
                addSlotLanguage(langCode);
                modal.hide();
            } else {
                alert("Please select a valid language.");
            }
        });
    }

    function addSlotLanguage(langCode) {
        const updatedSlots = [...slotLanguages.filter(Boolean), langCode].slice(0, 4);
        setSlotLanguages(updatedSlots);
        apiRequest("user_languages", "fetch").then(res => {
            const payload = {
                lang_1: updatedSlots[0] || null,
                lang_2: updatedSlots[1] || null,
                lang_3: updatedSlots[2] || null,
                lang_4: updatedSlots[3] || null
            };
            if (res.success && res.data && res.data.length > 0) {
                apiRequest("user_languages", "update", payload);
            } else {
                apiRequest("user_languages", "insert", payload);
            }
        });
    }

    function renderSelectedLanguageUI() {
        const slotContainer = document.getElementById("languageSlotButtons");
        if (slotContainer) {
            slotContainer.innerHTML = "";
            slotLanguages.forEach(lang => {
                if (!lang) return;
                const btn = document.createElement("button");
                btn.className = `btn btn-sm ${lang === selectedLangCode ? "btn-primary" : "btn-outline-primary"}`;
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
                const langName = (availableLanguages.find(l => l.language_code === lang) || {}).translated_name_en || lang.toUpperCase();
                option.textContent = langName;
                if (lang === selectedLangCode) {
                    option.selected = true;
                }
                userLangSelector.appendChild(option);
            });
        }
    }

    function setSlotLanguages(newArray) {
        slotLanguages = [...newArray];
        if (!selectedLangCode || !slotLanguages.includes(selectedLangCode)) {
            selectedLangCode = slotLanguages[0];
        }
        renderSelectedLanguageUI();
    }

    function init() {
        console.log("✅ TranslationConfig initialized");
        fetchGlobalLanguages().then(langs => {
            availableLanguages = langs;
            renderSelectedLanguageUI(); // ensure this only runs after data is ready
        }).catch(err => {
            console.error("Language loading error:", err);
        });

        // Fetch user's saved slot languages from the database using global api() helper
        apiRequest("user_languages", "fetch").then(res => {
            if (res.success && res.data && res.data.length > 0) {
                const row = res.data[0];
                const langs = [
                    row.lang_1,
                    row.lang_2,
                    row.lang_3,
                    row.lang_4
                ];
                const storedLang = localStorage.getItem("selectedLangCode");
                if (storedLang && langs.includes(storedLang)) {
                    selectedLangCode = storedLang;
                }
                setSlotLanguages(langs);
            } else {
                // Insert an empty row if none exists
                apiRequest("user_languages", "insert", {
                    lang_1: null,
                    lang_2: null,
                    lang_3: null,
                    lang_4: null
                }).then(() => {
                    setSlotLanguages([]);
                });
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
