// tv-fix.js

(function() {
    console.log("TV Patch Loaded");

    // --- STATE TRACKING ---
    // We need to remember if we came from Search to go back to it correctly
    let tvState = {
        lastViewWasSearch: false
    };

    // --- 1. SPATIAL NAVIGATION (D-Pad Logic) ---
    // This stops the "mouse scroll" behavior and moves focus instead
    function initSpatialNav() {
        const focusableSelector = 'a, button, input, select, [tabindex]:not([tabindex="-1"]), .nav-item, .card';

        document.addEventListener('keydown', (e) => {
            const key = e.key;
            if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) return;

            e.preventDefault(); // STOP the browser scroll

            const current = document.activeElement;
            const focusables = Array.from(document.querySelectorAll(focusableSelector))
                .filter(el => el.offsetParent !== null && !el.disabled && el.style.display !== 'none');

            if (!focusables.includes(current)) {
                focusables[0]?.focus(); // If lost, focus first item
                return;
            }

            const curRect = current.getBoundingClientRect();
            const curCenter = { x: curRect.left + curRect.width / 2, y: curRect.top + curRect.height / 2 };

            let bestCandidate = null;
            let minDist = Infinity;

            focusables.forEach(el => {
                if (el === current) return;

                const rect = el.getBoundingClientRect();
                const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };

                // Direction Check
                let valid = false;
                if (key === 'ArrowUp' && center.y < curCenter.y) valid = true;
                if (key === 'ArrowDown' && center.y > curCenter.y) valid = true;
                if (key === 'ArrowLeft' && center.x < curCenter.x) valid = true;
                if (key === 'ArrowRight' && center.x > curCenter.x) valid = true;

                if (valid) {
                    // Calculate distance to find the closest element
                    const dist = Math.hypot(center.x - curCenter.x, center.y - curCenter.y);
                    if (dist < minDist) {
                        minDist = dist;
                        bestCandidate = el;
                    }
                }
            });

            if (bestCandidate) {
                bestCandidate.focus();
                bestCandidate.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    // --- 2. MONKEY PATCH CLICK HANDLING ---
    // We listen to clicks to update our "History" state before the old JS runs
    document.addEventListener('click', (e) => {
        const searchOverlay = document.getElementById('search-overlay');
        const isSearchResult = e.target.closest('.search-result-item') || e.target.closest('.results-grid > div');
        
        // If user clicked a result inside the search overlay
        if (searchOverlay && searchOverlay.classList.contains('active') && isSearchResult) {
            tvState.lastViewWasSearch = true;
        } else {
            // If we are clicking something else (like dashboard), reset this
            // But don't reset if we are just clicking controls inside Cinema
            if (!document.getElementById('cinema-view').contains(e.target)) {
                 tvState.lastViewWasSearch = false;
            }
        }
    }, true); // Use capture phase to run before other scripts

    // --- 3. CUSTOM BACK BUTTON LOGIC ---
    function handleBack(e) {
        // Prevent default browser back
        if(e) e.preventDefault();

        const cinema = document.getElementById('cinema-view');
        const search = document.getElementById('search-overlay');
        const sidebar = document.getElementById('tv-sidebar');
        const dashboard = document.getElementById('dashboard-view');

        // PRIORITY 1: IF CINEMA IS OPEN
        if (cinema && cinema.classList.contains('active') && cinema.style.opacity !== '0') {
            // Close Cinema (using your app's existing logic styles)
            cinema.classList.remove('active');
            cinema.style.opacity = '0';
            cinema.style.pointerEvents = 'none';

            // Logic: Go back to Search OR Dashboard
            if (tvState.lastViewWasSearch && search) {
                search.style.display = 'grid'; // Force show
                search.classList.add('active');
                
                // Try to focus the first result to keep "static" feel
                const firstResult = search.querySelector('.results-grid > div') || document.getElementById('search-input-display');
                if(firstResult) firstResult.focus();
            } else {
                if(dashboard) {
                    dashboard.classList.add('active');
                    document.getElementById('door-play-btn')?.focus();
                }
            }
            return;
        }

        // PRIORITY 2: IF SEARCH IS OPEN
        if (search && search.classList.contains('active')) {
            // Close Search
            search.classList.remove('active');
            search.style.display = 'none';
            tvState.lastViewWasSearch = false;

            // Go to Sidebar
            sidebar.classList.add('expanded');
            document.getElementById('nav-profile')?.focus(); // Focus sidebar item
            return;
        }

        // PRIORITY 3: IF SIDEBAR IS EXPANDED
        if (sidebar && sidebar.classList.contains('expanded')) {
            sidebar.classList.remove('expanded');
            // Focus Main Content
            document.getElementById('door-play-btn')?.focus();
            return;
        }

        // PRIORITY 4: IF ON DASHBOARD (Sidebar Closed) -> OPEN SIDEBAR
        if (sidebar && !sidebar.classList.contains('expanded')) {
            sidebar.classList.add('expanded');
            document.getElementById('nav-profile')?.focus();
            return;
        }
    }

    // Hook into Browser Back Button & Physical Remote Back Button
    window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', (e) => {
        window.history.pushState(null, null, window.location.href); // Trap it again
        handleBack(e);
    });

    // Also listen for KeyDown "Escape" or Backspace (common TV remote keys)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.key === 'Backspace' || e.keyCode === 10009 || e.keyCode === 461) {
            handleBack(e);
        }
    });

    // Run Init
    document.addEventListener('DOMContentLoaded', initSpatialNav);
    // In case DOM is already ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initSpatialNav();
    }

})();
