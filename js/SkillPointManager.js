import { apiRequest } from "./apiUtils.js";
import { TranslationConfig } from "./TranslationConfig.js";

export const SkillPointManager = {
    /**
     * Render a single skill point <li> DOM element.
     * @param {Object} config
     * @returns {HTMLElement} skill point <li>
     */
    render(config) {
        const {
            id,
            valueObj,
            column = "skill",
            call,
            parentId = null
        } = config;

        const { isTranslateMode, selectedLangKey, referenceLanguage } = TranslationConfig.getConfig();

        const referenceValue = valueObj?.[column]?.[referenceLanguage] ?? "-";
        const targetValue = valueObj?.[column]?.[selectedLangKey] ?? "-";

        const li = $(`
            <li class="skill-item list-group-item list-group-item-action"
                data-id="${id}"
                data-column="${column}"
                data-call="${call}"
                data-parent-id="${parentId}">
            </li>
        `);

        if (isTranslateMode) {
            const translationEl = TranslationConfig.createTranslationInput({
                id,
                call,
                column,
                refText: referenceValue,
                value: targetValue,
                lang: selectedLangKey
            });
            li.append(translationEl);
        } else {
            li.append(`
                <div class="d-flex">
                    <button class="menu-btn shrink btn-outline-danger delete-point">
                        <i class="fas fa-square-minus"></i>
                    </button>
                    <span class="point-text" spellcheck="true">${targetValue}</span>
                </div>
            `);
            this.attachListeners(li, {
                id,
                column,
                call,
                parentId,
                selLang: selectedLangKey
            });
        }

        li.data("valueObj", valueObj);

        return li;
    },

    /**
     * Attach necessary listeners to a rendered skill point item.
     * @param {HTMLElement} li - The <li> element containing the skill point
     * @param {Object} context - Metadata needed for actions (id, column, category, etc.)
     */
    attachListeners(li, context) {
        const { id, column = "skill", call, parentId = null, selLang } = context;

        const pointText = li.find('.point-text');
        li.off('click', '.point-text').on('click', '.point-text', function () {
            // Listener for editing a skill point inline
            const currentValue = $(this).text().trim();
            const span = $(this);
            const inputField = $(`<input type="text" class="form-control form-control-sm skill-item-input" value="${currentValue}">`);
            span.replaceWith(inputField);
            inputField.focus();
            inputField[0].setSelectionRange(currentValue.length, currentValue.length);

            const saveValue = async () => {
                const newValue = inputField.val().trim();
                const finalValue = newValue || currentValue;

                if (newValue !== currentValue) {
                    const updateData = {
                        [column + "_" + selLang]: finalValue
                    };

                    if (parentId) {
                        const parentKey = call === "work_experience" ? "employerId" :
                            call === "education" ? "courseId" : null;
                        if (parentKey) updateData[parentKey] = parentId;
                    }

                    await SkillPointManager.edit({
                        id,
                        data: updateData,
                        category: call
                    });
                }

                const updatedSpan = $(`<span class="point-text" spellcheck="true">${finalValue}</span>`);
                inputField.replaceWith(updatedSpan);
                SkillPointManager.attachListeners(li, context); // Reattach for new span
            };

            inputField.off('blur').on('blur', saveValue);

            inputField.off('keydown').on('keydown', function (e) {
                if (e.key === 'Enter' || e.key === 'Tab') {
                    e.preventDefault();
                    inputField.blur();
                }
            });
        });

        li.find('.delete-point').off('click').on('click', async function () {
            // Listener for deleting a skill point
            const confirmed = confirm("Are you sure you want to delete this skill point?");
            if (!confirmed) return;

            const result = await SkillPointManager.delete({ id, category: call });
            if (result.success) {
                const container = li.closest("ul");
                li.remove();
                // After removing, check if the parent container has no other skill items
                const remaining = container.find("li.skill-item").length;
                if (remaining === 0) {
                    SkillPointManager.updatePlaceholder(container, false);
                }
            } else {
                alert("An error occurred while deleting. Please try again.");
            }
        });
    },

    /**
     * Handle adding a new skill point.
     * @param {Object} options - Contains category, parentId, input, selLang, column, onSuccess
     */
    add: async function ({ category, parentId, input, selLang, column = "skill", onSuccess }) {
        if (!input || !selLang || !category) {
            console.error("SkillPointManager.add: Missing required parameters");
            return;
        }

        const data = {
            [column + "_" + selLang]: input
        };

        if (parentId) {
            const parentKey = category === "work_experience" ? "employerId"
                : category === "education" ? "courseId"
                    : null;
            if (parentKey) data[parentKey] = parentId;
        }

        try {
            const res = await apiRequest(category, "insert", data);
            if (res.success && res.data?.id) {
                const newLi = SkillPointManager.render({
                    id: res.data.id,
                    valueObj: { [column]: { [selLang]: input } },
                    column,
                    selLang,
                    call: category,
                    parentId
                });
                if (typeof onSuccess === "function") onSuccess(newLi);
            } else {
                console.error("Add failed:", res.message);
            }
        } catch (err) {
            console.error("SkillPointManager.add request failed:", err);
        }
    },

    /**
     * Handle editing an existing skill point.
     * @param {Object} options - Contains id, data, category
     * @returns {Promise<Object>} API response object
     */
    edit: async function ({ id, data, category }) {
        if (!id || !data || !category) {
            console.error("SkillPointManager.edit: Missing required parameters");
            return { success: false, message: "Invalid edit parameters." };
        }

        try {
            const response = await apiRequest(category, "update", data, { id });
            if (!response.success) {
                console.error("SkillPointManager.edit API error:", response.message);
            }
            return response;
        } catch (error) {
            console.error("SkillPointManager.edit request failed:", error);
            return { success: false, message: "Network or server error." };
        }
    },

    /**
     * Handle deleting a skill point.
     * @param {Object} options - Contains id and category
     */
    delete: async function ({ id, category }) {
        if (!id || !category) {
            console.error("SkillPointManager.delete: Missing required parameters");
            return { success: false, message: "Invalid delete parameters." };
        }

        try {
            const response = await apiRequest(category, "delete", {}, { id });
            if (!response.success) {
                console.error("SkillPointManager.delete API error:", response.message);
            }
            return response;
        } catch (error) {
            console.error("SkillPointManager.delete request failed:", error);
            return { success: false, message: "Network or server error." };
        }
    },

    /**
     * Update the placeholder in a skill list container.
     * @param {jQuery} container - The container (ul) to update.
     * @param {boolean} hasItems - Whether the list has items.
     */
    updatePlaceholder: function (container, hasItems) {
        container.find(".placeholder").remove();
        if (!hasItems) {
            container.append(
                $('<li class="placeholder text-muted fst-italic small" style ="background-color: transparent;">No skills added yet</li>')
            );
        }
    },

    reRenderAll: function () {
        $(".skill-item").each(function () {
            const li = $(this);
            const id = li.data("id");
            const column = li.data("column");
            const call = li.data("call");
            const parentId = li.data("parent-id");
            const valueObj = li.data("valueObj");

            const newLi = SkillPointManager.render({
                id,
                valueObj,
                column,
                call,
                parentId
            });

            li.replaceWith(newLi);
        });
    }
};