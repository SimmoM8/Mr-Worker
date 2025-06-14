<div id="top-bar" class="d-flex justify-content-between align-items-center px-5 py-3">
    <!-- Language Selector -->
    <div class="d-flex align-items-center">
        <div id="translation-toolbar" class="d-flex align-items-center">
            <label for="userLanguageSelector" class="me-2">Language:</label>
            <select id="userLanguageSelector" class="form-select me-3">
            </select>

            <!-- Hidden Add Language Input -->
            <div id="addLanguageContainer" class="align-items-center d-none">
                <div class="dropdown w-100">
                    <input type="text" id="searchLanguageInput" class="form-control dropdown-toggle"
                        data-bs-toggle="dropdown" placeholder="Search for a language...">
                    <ul id="languagesDropdown" class="dropdown-menu w-100"></ul>
                </div>
                <button id="addLanguageBtn" class="btn btn-primary mt-3 w-100" disabled>Add Language</button>
                <button id="cancelAddLanguageBtn" class="btn btn-primary mt-3 w-100">Cancel</button>
            </div>

            <!-- Translate Mode Button -->
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="translateModeSwitch">
                <label class="form-check-label text-nowrap" for="translateModeSwitch">Translate Mode</label>
            </div>

            <!-- Language slot buttons (shown in translate mode) -->
            <div id="languageSlotButtons" class="d-flex ms-3 gap-2"></div>
        </div>
    </div>

    <!-- User Profile Dropdown -->
    <div class="dropdown">
        <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="userMenu" data-bs-toggle="dropdown"
            aria-expanded="false">
            <i class="bi bi-person-circle"></i> Profile
        </button>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
            <li><a class="dropdown-item" href="settings.php"><i class="bi bi-gear"></i> Settings</a></li>
            <li><a class="dropdown-item text-danger" href="logout.php"><i class="bi bi-box-arrow-right"></i> Logout</a>
            </li>
        </ul>
    </div>
</div>

<!-- Translation Sub-toolbar (shown only in Translate Mode) -->
<div id="translate-subtoolbar" class="d-none px-5 py-2 bg-light border-top">
    <div class="d-flex align-items-center gap-3">
        <label for="refLanguageSelector">Ref:</label>
        <select id="refLanguageSelector" class="form-select me-2"></select>
    </div>
</div>

<!-- Modal placeholder for editing all 4 language slots -->
<div id="languageEditorModalPlaceholder"></div>