import { apiRequest } from "./apiUtils.js";

export async function fetchGlobalLanguages() {
    const [translationsRes, languagesRes] = await Promise.all([
        apiRequest("global_language_translations", "fetch", {}, {}, { user_scope: false }),
        apiRequest("global_languages", "fetch", {}, {}, { user_scope: false })
    ]);

    if (!translationsRes.success || !Array.isArray(translationsRes.data)) {
        console.error("Failed to fetch language translations:", translationsRes.message);
        return [];
    }

    if (!languagesRes.success || !Array.isArray(languagesRes.data)) {
        console.error("Failed to fetch languages:", languagesRes.message);
        return [];
    }

    const languageMap = {};
    languagesRes.data.forEach(lang => {
        languageMap[lang.id] = lang.code;
    });
    const grouped = {};
    translationsRes.data.forEach(row => {
        const langId = row.language_id;
        if (!grouped[langId]) {
            grouped[langId] = {
                language_id: langId,
                language_code: languageMap[langId] || null,
                translated_name_en: null,
                translations: {}
            };
        }
        grouped[langId].translations[row.translation_code] = row.translated_name;
        if (row.translation_code === "en") {
            grouped[langId].translated_name_en = row.translated_name;
        }
    });

    return Object.values(grouped).filter(l => l.translated_name_en);
}

let allLanguages = [];

export async function setupLanguageSearch({ inputSelector, resultContainerSelector, onSelect, alreadyAdded = [] }) {
    const input = document.querySelector(inputSelector);
    const resultsList = document.querySelector(resultContainerSelector);

    if (allLanguages.length === 0) {
        allLanguages = await fetchGlobalLanguages();
    }

    function updateSearchResults() {
        const query = input.value.toLowerCase().trim();
        resultsList.innerHTML = "";

        if (!query) {
            resultsList.style.display = "none";
            return;
        }

        const matches = allLanguages
            .filter(lang =>
                Object.entries(lang.translations).some(([code, name]) =>
                    typeof name === "string" && name.toLowerCase().includes(query)
                ) || (lang.language_code && lang.language_code.toLowerCase().includes(query))
            )
            .slice(0, 10);

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
            item.textContent = `${lang.translated_name_en} (${lang.language_code})`;
            const isUsed = alreadyAdded.includes(lang.language_code);
            if (isUsed) {
                item.classList.add("disabled", "text-muted");
                item.textContent += " (already added)";
            } else {
                item.addEventListener("click", () => onSelect(lang));
            }

            resultsList.appendChild(item);
        });

        resultsList.style.display = "block";
    }

    input.addEventListener("input", updateSearchResults);
}
