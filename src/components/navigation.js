// Copyright (c) Haykal M. Zaidi 2024-2026. All rights reserved. PROPRIETARY AND CONFIDENTIAL.
(function() {
    /**
     * 1. CONFIGURATION
     */
    // [FIX 1] Updated SELECTOR to exclude .app-brand and .appx-brand so the logo is NOT focusable
    const SELECTOR = 'button, a:not(.app-brand):not(.appx-brand), input, select, textarea, [tabindex]:not([tabindex="-1"]), .focusable, .surah-card, .nav-item, .custom-select-trigger, .custom-option, .premium-btn, .social-btn';
    
    // 2. VIEW CONTROLLERS
    const VIEWS = {
        AUTH_MODAL: 'hybrid-auth-modal', // [NEW] Added Auth Modal
        PREMIUM: 'premium-landing',      // [NEW] Added Premium Landing
        ARABIC_MODAL: 'arabic-modal', 
        SEARCH: 'search-overlay',
        ISLAND_SEARCH: 'island-search-wrapper',
        CINEMA: 'cinema-view',
        DASHBOARD: 'dashboard-view',
        SIDEBAR: 'tv-sidebar'
    };

    let currentFocus = null;

    /**
     * Determines which elements are currently valid candidates for focus.
     */
    function getFocusableCandidates() {
        // PRIORITY -1: Custom Select Dropdown (Focus Trap)
        const openSelect = document.querySelector('.custom-select-wrapper.open');
        if (openSelect) {
            return Array.from(openSelect.querySelectorAll('.custom-option'));
        }

        // --- [FIX 2] PRIORITY 0: Auth & Premium Layers ---
        // These are full-screen blockades, so we must trap focus here if they are visible.
        
        const authModal = document.getElementById(VIEWS.AUTH_MODAL);
        // Check if Auth modal is visible (using your class logic or display style)
        if (authModal && (authModal.classList.contains('visible') || isVisible(authModal))) {
            return Array.from(authModal.querySelectorAll(SELECTOR)).filter(isVisible);
        }

        const premiumLanding = document.getElementById(VIEWS.PREMIUM);
        if (premiumLanding && isVisible(premiumLanding)) {
             return Array.from(premiumLanding.querySelectorAll(SELECTOR)).filter(isVisible);
        }
        // --- [END FIX] ---

        const arabicModal = document.getElementById(VIEWS.ARABIC_MODAL);
        const searchOverlay = document.getElementById(VIEWS.SEARCH);
        const cinemaView = document.getElementById(VIEWS.CINEMA);
        const dashboardView = document.getElementById(VIEWS.DASHBOARD);
        const sidebar = document.getElementById(VIEWS.SIDEBAR);

        // PRIORITY 1: Arabic Modal
        if (arabicModal) {
            const style = window.getComputedStyle(arabicModal);
            if (style.display !== 'none' && style.visibility !== 'hidden') {
                return Array.from(arabicModal.querySelectorAll(SELECTOR)).filter(isVisible);
            }
        }

        // PRIORITY 2: Search Overlay
        if (searchOverlay && searchOverlay.classList.contains('active')) {
            return Array.from(searchOverlay.querySelectorAll(SELECTOR)).filter(isVisible);
        }

        // PRIORITY 3: Cinema Mode
        if (cinemaView && cinemaView.classList.contains('active')) {
            const candidates = Array.from(cinemaView.querySelectorAll(SELECTOR));
            return candidates.filter(isVisible);
        }

        // PRIORITY 4: Island Search, Dashboard, Sidebar & Trojan
        const islandSearch = document.getElementById(VIEWS.ISLAND_SEARCH);
        const trojanContent = document.querySelector('.trojan-content'); 

        const islandCandidates = islandSearch ? Array.from(islandSearch.querySelectorAll(SELECTOR)) : [];
        const trojanCandidates = trojanContent ? Array.from(trojanContent.querySelectorAll(SELECTOR)) : [];
        
        const dashCandidates = dashboardView ? Array.from(dashboardView.querySelectorAll(SELECTOR)) : [];
        const sidebarCandidates = sidebar ? Array.from(sidebar.querySelectorAll(SELECTOR)) : [];
        
        // Include islandCandidates and trojanCandidates in the return array
        return [...islandCandidates, ...sidebarCandidates, ...dashCandidates, ...trojanCandidates].filter(isVisible);
    }

    /**
     * Strict visibility check.
     */
    function isVisible(el) {
        if (!el) return false;
        if (el.disabled) return false;
        
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;

        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    }

    /**
     * Wake Up Helper
     */
    function attemptWakeUp() {
        const isIdle = document.body.classList.contains('idle');
        
        if (isIdle) {
            document.body.classList.remove('idle');
            document.body.dispatchEvent(new Event('mousemove', { bubbles: true }));
            
            if (currentFocus && document.body.contains(currentFocus)) {
                currentFocus.focus();
            } else {
                const all = getFocusableCandidates();
                if (all.length > 0) focusElement(all[0]);
            }
            return true;
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

        return dMajor + (dMinor * 2.5);
    }

    function navigate(direction) {
        if (attemptWakeUp()) return;

        const all = getFocusableCandidates();

        if (!currentFocus || !document.body.contains(currentFocus)) {
            // [FIX 3] Check if we are in Premium mode first
            const premiumLanding = document.getElementById(VIEWS.PREMIUM);
            if (premiumLanding && isVisible(premiumLanding)) {
                 const btns = premiumLanding.querySelectorAll(SELECTOR);
                 if (btns.length > 0) focusElement(btns[0]);
                 return;
            }

            // Default fallback
            const islandInput = document.getElementById('island-input');
            if (islandInput && isVisible(islandInput)) {
                focusElement(islandInput);
            } else if (all.length > 0) {
                focusElement(all[0]);
            }
            return;
        }
        
        // If trapped in an invalid state, jump to safety
        if (!all.includes(currentFocus) && all.length > 0) {
             // Optional recovery logic
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
        if (el.scrollIntoViewIfNeeded) {
            el.scrollIntoViewIfNeeded({ behavior: 'smooth', block: 'center' });
        } else {
            el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }
    }

    // 3. KEYBOARD LISTENERS (GLOBAL)
    window.addEventListener('keydown', (e) => {
        // --- 1. WAKE UP GUARD ---
        if (document.body.classList.contains('idle')) {
            e.preventDefault();
            e.stopImmediatePropagation(); 
            attemptWakeUp();
            return; 
        }

        // --- 2. NAVIGATION LOGIC ---
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.stopImmediatePropagation();
            e.preventDefault();
            navigate(e.key);
        }

        // --- 2.5 SEARCH EXECUTION ---
        if (e.key === 'Enter') {
            const islandInput = document.getElementById('island-input');
            if (document.activeElement === islandInput) {
                const trigger = document.querySelector('.enter-trigger');
                if (trigger) {
                    trigger.click(); 
                    return;
                }
            }
        }
        
        // --- 3. BACK/ESCAPE ---
        if (e.key === 'Escape' || e.key === 'Backspace') {
            const openSelect = document.querySelector('.custom-select-wrapper.open');
            if (openSelect) {
                openSelect.classList.remove('open');
                const trigger = openSelect.querySelector('.custom-select-trigger');
                if(trigger) trigger.focus();
                return;
            }

            // [NEW] Allow closing Auth Modal via Back/Escape
            const authModal = document.getElementById(VIEWS.AUTH_MODAL);
            if (authModal && authModal.classList.contains('visible')) {
                if (window.closeAuth) window.closeAuth();
                return;
            }

            const arabicModal = document.getElementById(VIEWS.ARABIC_MODAL);
            if (arabicModal && window.getComputedStyle(arabicModal).display !== 'none') {
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
        const all = getFocusableCandidates();
        if (all.length > 0 && currentFocus && !document.body.contains(currentFocus)) {
             focusElement(all[0]);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });

    // Initial Start
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            // [FIX 4] Check Premium First on Load
            const premiumLanding = document.getElementById(VIEWS.PREMIUM);
            if (premiumLanding && isVisible(premiumLanding)) {
                 const startBtn = document.getElementById('premium-start-btn');
                 if (startBtn) focusElement(startBtn);
                 return;
            }

            const dash = document.getElementById(VIEWS.DASHBOARD);
            if (dash && dash.classList.contains('active')) {
                const playBtn = document.getElementById('door-play-btn');
                if(playBtn) focusElement(playBtn);
            }
        }, 500); 
    });

})();