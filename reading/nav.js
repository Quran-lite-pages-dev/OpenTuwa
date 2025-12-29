(function() {
    /**
     * 1. CONFIGURATION
     * CRITICAL FIX: Added 'select' and 'textarea' to ensure dropdowns are caught
     * even if they don't have an explicit tabindex attribute.
     */
    const SELECTOR = 'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"]), .focusable, .surah-card, .nav-item';
    
    // 2. VIEW CONTROLLERS
    // Maps your HTML IDs to logical views
    const VIEWS = {
        SEARCH: 'search-overlay',
        CINEMA: 'cinema-view',
        DASHBOARD: 'dashboard-view',
        SIDEBAR: 'tv-sidebar'
    };

    let currentFocus = null;

    /**
     * Determines which elements are currently valid candidates for focus.
     * Prevents "Ghost Focus" (focusing elements underneath the active view).
     */
    function getFocusableCandidates() {
        const searchOverlay = document.getElementById(VIEWS.SEARCH);
        const cinemaView = document.getElementById(VIEWS.CINEMA);
        const dashboardView = document.getElementById(VIEWS.DASHBOARD);
        const sidebar = document.getElementById(VIEWS.SIDEBAR);

        // PRIORITY 1: Search Overlay
        if (searchOverlay && searchOverlay.classList.contains('active')) {
            return Array.from(searchOverlay.querySelectorAll(SELECTOR)).filter(isVisible);
        }

        // PRIORITY 2: Cinema Mode (Player)
        if (cinemaView && cinemaView.classList.contains('active')) {
            // Even if controls are faded out (opacity: 0), we fetch them
            // The 'ensureCinemaAwake' function handles the visibility/waking up
            return Array.from(cinemaView.querySelectorAll(SELECTOR)).filter(el => {
                // Special check for Cinema: Allow elements even if opacity is currently 0
                // because we will wake them up on keypress.
                return el.offsetParent !== null && !el.disabled;
            });
        }

        // PRIORITY 3: Dashboard & Sidebar (Standard View)
        const dashCandidates = dashboardView ? Array.from(dashboardView.querySelectorAll(SELECTOR)) : [];
        const sidebarCandidates = sidebar ? Array.from(sidebar.querySelectorAll(SELECTOR)) : [];
        
        // Merge and filter
        return [...sidebarCandidates, ...dashCandidates].filter(isVisible);
    }

    /**
     * Strict visibility check.
     */
    function isVisible(el) {
        if (!el) return false;
        if (el.disabled) return false;
        
        // Basic DOM presence
        if (el.offsetParent === null) return false;
        
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return false;

        // Note: We purposefully do NOT check opacity here for general elements,
        // because some UI effects use opacity but keep the element interactive.
        // We handle Cinema opacity separately.

        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    }

    /**
     * CRITICAL: Cinema Wake-Up Logic
     * If the user presses a D-pad button while the UI is faded out,
     * this wakes it up first before moving focus.
     */
    function ensureCinemaAwake() {
        const cinemaView = document.getElementById(VIEWS.CINEMA);
        
        if (cinemaView && cinemaView.classList.contains('active')) {
            const style = window.getComputedStyle(cinemaView);
            
            // If controls are hidden (assuming your CSS/JS toggles opacity on the view or a child)
            // We check if the VIEW ITSELF is transparent, or if you have a class like 'idle'
            if (style.opacity === '0' || cinemaView.classList.contains('idle')) {
                
                // 1. Trigger fake mouse events to notify your index.js idle timer
                document.body.dispatchEvent(new Event('mousemove', { bubbles: true }));
                document.body.dispatchEvent(new Event('click', { bubbles: true }));
                
                // 2. If focus was lost, snap it back to a valid element
                if (!currentFocus || !cinemaView.contains(currentFocus)) {
                    const first = cinemaView.querySelector(SELECTOR);
                    if (first) focusElement(first);
                }
                
                return true; // We performed a wake-up action
            }
        }
        return false;
    }

    function getDistance(r1, r2, dir) {
        const c1 = { x: r1.left + r1.width / 2, y: r1.top + r1.height / 2 };
        const c2 = { x: r2.left + r2.width / 2, y: r2.top + r2.height / 2 };
        
        let dMajor, dMinor;

        if (dir === 'ArrowLeft' || dir === 'ArrowRight') {
            dMajor = Math.abs(c1.x - c2.x);
            dMinor = Math.abs(c1.y - c2.y);
        } else {
            dMajor = Math.abs(c1.y - c2.y);
            dMinor = Math.abs(c1.x - c2.x);
        }

        // Strict Directional Blocking
        if (dir === 'ArrowRight' && c2.x <= c1.x) return Infinity;
        if (dir === 'ArrowLeft' && c2.x >= c1.x) return Infinity;
        if (dir === 'ArrowDown' && c2.y <= c1.y) return Infinity;
        if (dir === 'ArrowUp' && c2.y >= c1.y) return Infinity;

        // Weight alignment heavily (x3) to favor straight lines (grids/lists)
        return dMajor + (dMinor * 3);
    }

    function navigate(direction) {
        // 1. Wake up UI if needed
        if (ensureCinemaAwake()) return;

        const all = getFocusableCandidates();

        // 2. Handle Focus Recovery
        if (!currentFocus || !document.body.contains(currentFocus)) {
            if (all.length > 0) focusElement(all[0]);
            return;
        }

        // 3. Find Best Candidate
        const r1 = currentFocus.getBoundingClientRect();
        let bestCandidate = null;
        let minScore = Infinity;

        for (let i = 0; i < all.length; i++) {
            const el = all[i];
            if (el === currentFocus) continue;

            const r2 = el.getBoundingClientRect();
            const score = getDistance(r1, r2, direction);

            if (score < minScore) {
                minScore = score;
                bestCandidate = el;
            }
        }

        if (bestCandidate) {
            focusElement(bestCandidate);
        }
    }

    function focusElement(el) {
        currentFocus = el;
        el.focus();
        
        // Smooth scroll to keep element in view
        // Using 'center' block alignment to avoid it sticking to the very edge
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }

    // 3. KEYBOARD LISTENERS
    window.addEventListener('keydown', (e) => {
        // CRITICAL: Allow 'Enter' to pass through to Select/Buttons
        // This ensures the native OS dropdown picker opens when you press Enter on a select box.
        if (e.key === 'Enter') {
            return; 
        }

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            
            // SPECIAL HANDLING FOR SELECT ELEMENTS (Dropdowns)
            // If user is ON a dropdown, and presses UP/DOWN, we usually want to move to the next UI element,
            // NOT change the value inside the box (which requires opening it first with Enter).
            // However, if the dropdown is OPEN, the browser usually consumes the event before we get it.
            
            e.stopImmediatePropagation();
            e.preventDefault();
            
            // Wake up on any arrow key
            ensureCinemaAwake();
            
            navigate(e.key);
        }
        
        // Back/Escape mapping
        if (e.key === 'Escape' || e.key === 'Backspace') {
            // Logic to trigger your 'Close' buttons
            const activeView = document.querySelector('.active');
            if (activeView) {
                const closeBtn = activeView.querySelector('.close-btn, .close-cinema-btn, .back-btn');
                if (closeBtn) closeBtn.click();
            }
        }
    }, true);

    // 4. MOUSE/TOUCH LISTENERS (Sync)
    // If the user taps the screen, we update our spatial tracker
    document.addEventListener('focusin', (e) => {
        if (e.target.matches && e.target.matches(SELECTOR)) {
            currentFocus = e.target;
        }
    });

    // 5. OBSERVER (For Dynamic Content like Search Results)
    // If new cards/buttons are added, we don't need to re-init, the next keypress calculates fresh.
    // But we DO need to watch if focus is completely lost.
    const observer = new MutationObserver(() => {
        if (document.activeElement === document.body) {
            // Focus lost? Try to find something valid
            const candidates = getFocusableCandidates();
            if (candidates.length > 0) {
                // Don't auto-focus immediately to avoid stealing focus during load,
                // but set it as the current reference.
                currentFocus = candidates[0];
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial Start
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => navigate('ArrowDown'), 500); // Small delay to let UI render
    });

})();
