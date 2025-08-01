export const useTranslation = () => {
    // TEMP: Mock config — will later be hooked into global state or settings
    return {
        selectedLangKey: 'lang_1',          // The current translation slot selected
        referenceLanguage: 'en',        // The original/default language
        isTranslateMode: false          // Whether we're in translate mode or not
    };
};