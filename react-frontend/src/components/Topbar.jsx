export default function Topbar() {
  return (
    <>
      <div id="top-bar" className="d-flex justify-content-between align-items-center px-5 py-3">
        {/* Language Selector */}
        <div className="d-flex align-items-center">
          <div id="translation-toolbar" className="d-flex align-items-center">
            <label htmlFor="userLanguageSelector" className="me-2">
              Language:
            </label>
            <select id="userLanguageSelector" className="form-select me-3">
              {/* Options will be dynamically loaded */}
            </select>

            {/* Hidden Add Language Input */}
            <div id="addLanguageContainer" className="align-items-center d-none">
              <div className="dropdown w-100">
                <input
                  type="text"
                  id="searchLanguageInput"
                  className="form-control dropdown-toggle"
                  data-bs-toggle="dropdown"
                  placeholder="Search for a language..."
                />
                <ul id="languagesDropdown" className="dropdown-menu w-100"></ul>
              </div>
              <button id="addLanguageBtn" className="btn btn-primary mt-3 w-100" disabled>
                Add Language
              </button>
              <button id="cancelAddLanguageBtn" className="btn btn-primary mt-3 w-100">
                Cancel
              </button>
            </div>

            {/* Translate Mode Toggle */}
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" id="translateModeSwitch" />
              <label className="form-check-label text-nowrap" htmlFor="translateModeSwitch">
                Translate Mode
              </label>
            </div>

            {/* Language slot buttons (shown in translate mode) */}
            <div id="languageSlotButtons" className="d-flex ms-3 gap-2"></div>
          </div>
        </div>

        {/* User Profile Dropdown */}
        <div className="dropdown">
          <button
            className="btn btn-outline-secondary dropdown-toggle"
            type="button"
            id="userMenu"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="bi bi-person-circle"></i> Profile
          </button>
          <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
            <li>
              <a className="dropdown-item" href="#">
                <i className="bi bi-gear"></i> Settings
              </a>
            </li>
            <li>
              <a className="dropdown-item text-danger" href="#">
                <i className="bi bi-box-arrow-right"></i> Logout
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Translation Sub-toolbar (shown only in Translate Mode) */}
      <div id="translate-subtoolbar" className="d-none px-5 py-2 bg-light border-top">
        <div className="d-flex align-items-center gap-3">
          <label htmlFor="refLanguageSelector">Ref:</label>
          <select id="refLanguageSelector" className="form-select me-2"></select>
        </div>
      </div>

      {/* Modal placeholder for editing all 4 language slots */}
      <div id="languageEditorModalPlaceholder"></div>
    </>
  );
}
