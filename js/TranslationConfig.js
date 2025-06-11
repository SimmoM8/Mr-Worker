const TranslationConfig = {
    selectedLang: "lang_1",     // Current display language
    isTranslateMode: false,     // Whether we're in translation mode
    referenceLang: "lang_1",    // Shown as reference string in translate mode
    targetLang: "lang_2",       // Target language user is translating into

    /**
     * Set current view language
     */
    setSelectedLang(langKey) {
        this.selectedLang = langKey;
        this.triggerRerender();
    },

    /**
     * Toggle translate mode
     */
    setTranslateMode(state) {
        this.isTranslateMode = state;
        this.triggerRerender();
    },

    /**
     * Set reference language for translation mode
     */
    setReferenceLang(langKey) {
        this.referenceLang = langKey;
        if (this.isTranslateMode) this.triggerRerender();
    },

    /**
     * Set target translation language
     */
    setTargetLang(langKey) {
        this.targetLang = langKey;
        if (this.isTranslateMode) this.triggerRerender();
    },

    /**
     * Register re-render callback (called when config changes)
     */
    onUpdate(callback) {
        this._callback = callback;
    },

    /**
     * Call the re-render callback
     */
    triggerRerender() {
        if (typeof this._callback === "function") {
            this._callback();
        }
    },

    createTranslationInput({ id, call, column, refText, value, lang }) {
        return $(`
            <div class="translation-block">
                <div class="ref-text small text-muted">${refText}</div>
                <input type="text" class="form-control form-control-sm translate-input mt-1"
                       value="${value || ''}"
                       data-id="${id}" data-call="${call}" data-column="${column}" data-lang="${lang}">
                <button class="btn btn-success btn-sm mt-1 save-translation"
                        data-id="${id}" data-call="${call}" data-column="${column}" data-lang="${lang}">
                    Save
                </button>
            </div>
        `);
    }
};