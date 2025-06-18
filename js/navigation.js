//import { Resumes } from "./resumes";
//import { Skills } from "./skills.js";
//import { Experience } from "./experience";
//import { Profile } from "./profile";

const pageModules = {
    skills: undefined,
    resumes: undefined,
    experience: undefined,
    profile: undefined
    // Add other pages here
};

export const NavigationManager = {
    cache: {}, // Stores cached pages
    cachingEnabled: false, // Set to true when ready to enable caching


    init: function () {
        console.log("✅ NavigationManager initialized");

        // Selecting DOM elements AFTER the DOM has loaded
        this.navButtons = document.querySelectorAll(".sidebar-nav .nav-link"); // Select all sidebar buttons
        this.mainContent = document.getElementById("main-content"); // The main content area

        this.setupNavListeners();
        // Handles back/forward navigation
        window.addEventListener("popstate", (event) => {
            if (event.state && event.state.page) {
                this.loadPage(event.state.page, event.state.type || null);
            }
        });
    },

    loadPage: function (page, type = null) {
        let params = new URLSearchParams();
        if (type) params.append("type", type);
        let pageUrl = `${page}.php?${params.toString()}`;

        // Use cached version if available and not expired
        if (this.cachingEnabled && this.cache[pageUrl] && Date.now() - this.cache[pageUrl].timestamp < 300000) { // 5 min expiry
            console.log(`Loading ${pageUrl} from cache`);
            this.mainContent.innerHTML = this.cache[pageUrl].data;
            const pageName = page.replace(".php", "");
            const modulePath = `./${page}.js`; // e.g. ./skills.js
            import(modulePath)
                .then(module => {
                    if (module?.default?.init) {
                        module.default.init(type);
                    } else {
                        // Try named exports if default.init() doesn't exist
                        const exportedKey = Object.keys(module).find(key => typeof module[key]?.init === 'function');
                        if (exportedKey) {
                            module[exportedKey].init(type);
                        }
                    }
                })
                .catch(err => console.error("Module load error:", err));
            this.updateActiveButton(page, type);
            return;
        }

        this.mainContent.innerHTML = "<p>Loading...</p>";

        fetch(pageUrl)
            .then(response => response.text())
            .then(data => {
                if (this.cachingEnabled) {
                    this.cache[pageUrl] = { data, timestamp: Date.now() }; // Store with timestamp
                }
                this.mainContent.innerHTML = data;
                const pageName = page.replace(".php", "");
                const modulePath = `./${page}.js`; // e.g. ./skills.js
                import(modulePath)
                    .then(module => {
                        if (module?.default?.init) {
                            module.default.init(type);
                        } else {
                            // Try named exports if default.init() doesn't exist
                            const exportedKey = Object.keys(module).find(key => typeof module[key]?.init === 'function');
                            if (exportedKey) {
                                module[exportedKey].init(type);
                            }
                        }
                    })
                    .catch(err => console.error("Module load error:", err));
                this.updateActiveButton(page, type);
                document.dispatchEvent(new Event("pageLoaded")); // Dispatch event for any extra script listeners
            })
            .catch(error => {
                this.mainContent.innerHTML = "<p>Error loading page.</p>";
                console.error("Error loading page:", error);
            });
    },

    updateActiveButton: function (page, type = null) {
        this.navButtons.forEach((button) => {
            let buttonPage = button.getAttribute("data-page");
            let buttonType = button.getAttribute("data-type") || null;

            if (buttonPage === page && buttonType === type) {
                button.classList.add("active");
            } else {
                button.classList.remove("active");
            }
        });
    },

    setupNavListeners: function () {
        this.navButtons.forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                let page = button.getAttribute("data-page");
                let type = button.getAttribute("data-type") || null;
                let newUrl = `?page=${page}${type ? `&type=${type}` : ""}`;

                if (window.location.search !== newUrl) {
                    window.history.pushState({ page, type }, "", newUrl);
                    this.loadPage(page, type);
                }
            });
        });
    },

    reloadCurrentPage: function () {
        const currentPage = new URLSearchParams(window.location.search).get("page") || "resumes.php";
        const currentType = new URLSearchParams(window.location.search).get("type") || null;
        console.log("Reloading current page:", currentPage);
        this.loadPage(currentPage, currentType);
    },

    clearCache: function () {
        console.log("Cache cleared");
        this.cache = {}; // Reset cache
    }
};