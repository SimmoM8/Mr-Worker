import { apiRequest } from '../api/apiRequest';

/**
 * SkillManager handles all skill-related API interactions
 * Used by both the Skills page and Experience page.
 */
export const SkillManager = {
    /**
     * Fetch a list of skill items for a given category.
     * @param {string} category - e.g. "hard_skills", "soft_skills", "languages", "licenses"
     * @returns {Promise<Array>} skill item array
     */
    async fetch(category) {
        try {
            const res = await apiRequest(category, 'fetch');
            if (res.success) {
                return res.data || [];
            } else {
                console.error(`SkillManager.fetch: ${res.message}`);
                return [];
            }
        } catch (err) {
            console.error(`SkillManager.fetch error:`, err);
            return [];
        }
    },

    /**
     * Add a new skill item.
     * @param {string} category
     * @param {string|object} input - skill text or full object
     * @param {object} options - optional: parentId, lang, column
     * @returns {Promise<Object>} inserted item
     */
    async add(category, input, options = {}) {
        const { lang, column = 'skill', parentId } = options;

        const data =
            typeof input === 'string'
                ? { [`${column}_${lang}`]: input }
                : input;

        if (parentId) {
            const key =
                category === 'work_experience'
                    ? 'employerId'
                    : category === 'education'
                        ? 'courseId'
                        : null;
            if (key) data[key] = parentId;
        }

        try {
            const res = await apiRequest(category, 'insert', data);
            if (res.success) {
                return res.data;
            } else {
                console.error(`SkillManager.add: ${res.message}`);
                return null;
            }
        } catch (err) {
            console.error(`SkillManager.add error:`, err);
            return null;
        }
    },

    /**
     * Update an existing skill.
     * @param {string} id
     * @param {string} category
     * @param {object} data
     * @returns {Promise<boolean>}
     */
    async update(id, category, data) {
        try {
            const res = await apiRequest(category, 'update', data, { id });
            if (!res.success) {
                console.error(`SkillManager.update: ${res.message}`);
            }
            return res.success;
        } catch (err) {
            console.error(`SkillManager.update error:`, err);
            return false;
        }
    },

    /**
     * Delete a skill item by ID.
     * @param {string} id
     * @param {string} category
     * @returns {Promise<boolean>}
     */
    async delete(id, category) {
        try {
            const res = await apiRequest(category, 'delete', {}, { id });
            if (!res.success) {
                console.error(`SkillManager.delete: ${res.message}`);
            }
            return res.success;
        } catch (err) {
            console.error(`SkillManager.delete error:`, err);
            return false;
        }
    }
};