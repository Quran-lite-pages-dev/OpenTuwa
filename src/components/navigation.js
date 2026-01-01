(function() {
    /**
     * 1. CONFIGURATION
     */
    const SELECTOR = 'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"]), .focusable, .surah-card, .nav-item';
    
    // 2. VIEW CONTROLLERS
    // Added 'ARABIC_MODAL' to the known views
    const VIEWS = {
        ARABIC_MODAL: 'arabic-modal', 
        SEARCH: 'search-overlay',
        CINEMA: 'cinema-view',
        DASHBOARD: 'dashboard-view',
        SIDEBAR: 'tv-sidebar'
    };

    let currentFocus = null;

    /**
     * Determines which elements are currently valid candidates for focus.
     */
    function getFocusableCandidates() {
        const arabicModal = document.getElementById(VIEWS.ARABIC_MODAL);
        const searchOverlay = document.getElementById(VIEWS.SEARCH);
        const cinemaView = document.getElementById(VIEWS.CINEMA);
        const dashboardView = document.getElementById(VIEWS.DASHBOARD);
        const sidebar = document.getElementById(VIEWS.SIDEBAR);

        // PRIORITY 0: Arabic Modal (CRITICAL)
        // If this popup is visible, we MUST focus inside it and ignore everything else.
        if (arabicModal) {
            const style = window.getComputedStyle(arabicModal);
            if (style.display !== 'none' && style.visibility !== 'hidden') {
                return Array.from(arabicModal.querySelectorAll(SELECTOR)).filter(isVisible);
            }
        }

        // PRIORITY 1: Search Overlay
        if (searchOverlay && searchOverlay.classList.contains('active')) {
            return Array.from(searchOverlay.querySelectorAll(SELECTOR)).filter(isVisible);
        }

        // PRIORITY 2: Cinema Mode (Player)
        if (cinemaView && cinemaView.classList.contains('active')) {
            return Array.from(cinemaView.querySelectorAll(SELECTOR)).filter(el => {
                return el.offsetParent !== null && !el.disabled;
            });
        }

        // PRIORITY 3: Dashboard & Sidebar (Standard View)
        const dashCandidates = dashboardView ? Array.from(dashboardView.querySelectorAll(SELECTOR)) : [];
        const sidebarCandidates = sidebar ? Array.from(sidebar.querySelectorAll(SELECTOR)) : [];
        
        return [...sidebarCandidates, ...dashCandidates].filter(isVisible);
    }

    /**
     * Strict visibility check.
     */
    function isVisible(el) {
        if (!el) return false;
        if (el.disabled) return false;
        if (el.offsetParent === null) return false;
        
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return false;

        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    }

    /**
     * Cinema Wake-Up Logic
     */
    function ensureCinemaAwake() {
        const cinemaView = document.getElementById(VIEWS.CINEMA);
        
        // If we are in the Arabic Modal, DO NOT wake up cinema (it might trigger clicks in background)
        const arabicModal = document.getElementById(VIEWS.ARABIC_MODAL);
        if (arabicModal && window.getComputedStyle(arabicModal).display !== 'none') {
            return false; 
        }

        if (cinemaView && cinemaView.classList.contains('active')) {
            const style = window.getComputedStyle(cinemaView);
            if (style.opacity === '0' || cinemaView.classList.contains('idle')) {
                document.body.dispatchEvent(new Event('mousemove', { bubbles: true }));
                document.body.dispatchEvent(new Event('click', { bubbles: true }));
                
                if (!currentFocus || !cinemaView.contains(currentFocus)) {
                    const first = cinemaView.querySelector(SELECTOR);
                    if (first) focusElement(first);
                }
                return true;
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

        if (dir === 'ArrowRight' && c2.x <= c1.x) return Infinity;
        if (dir === 'ArrowLeft' && c2.x >= c1.x) return Infinity;
        if (dir === 'ArrowDown' && c2.y <= c1.y) return Infinity;
        if (dir === 'ArrowUp' && c2.y >= c1.y) return Infinity;

        return dMajor + (dMinor * 3);
    }

    function navigate(direction) {
        if (ensureCinemaAwake()) return;

        const all = getFocusableCandidates();

        // If focus is lost, or we are switching contexts (e.g., Modal just appeared), grab the first element
        if (!currentFocus || !document.body.contains(currentFocus) || !all.includes(currentFocus)) {
            if (all.length > 0) focusElement(all[0]);
            return;
        }

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
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }

    // 3. KEYBOARD LISTENERS
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') return; 

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.stopImmediatePropagation();
            e.preventDefault();
            navigate(e.key);
        }
        
        if (e.key === 'Escape' || e.key === 'Backspace') {
            // Check Modal First
            const arabicModal = document.getElementById(VIEWS.ARABIC_MODAL);
            if (arabicModal && window.getComputedStyle(arabicModal).display !== 'none') {
                 // Optional: Decide what Backspace does in modal. Maybe click "No"?
                 // For now, we do nothing to force a choice.
                 return;
            }

            const activeView = document.querySelector('.active');
            if (activeView) {
                const closeBtn = activeView.querySelector('.close-btn, .close-cinema-btn, .back-btn');
                if (closeBtn) closeBtn.click();
            }
        }
    }, true);

    // 4. MOUSE/TOUCH LISTENERS
    document.addEventListener('focusin', (e) => {
        if (e.target.matches && e.target.matches(SELECTOR)) {
            currentFocus = e.target;
        }
    });

    // 5. OBSERVER
    const observer = new MutationObserver(() => {
        // If a modal suddenly appeared (like Arabic Check), we need to re-evaluate focus immediately
        // otherwise focus might be stuck underneath it.
        const all = getFocusableCandidates();
        if (all.length > 0) {
             // If our current focus is NOT in the valid list (e.g. it's covered by modal), move focus
             if (currentFocus && !all.includes(currentFocus)) {
                 focusElement(all[0]);
             }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });

    // Initial Start
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => navigate('ArrowDown'), 500); 
    });

})();
