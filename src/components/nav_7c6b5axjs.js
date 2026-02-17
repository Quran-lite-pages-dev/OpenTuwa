// Copyright (c) Haykal M. Zaidi 2024-2026. All rights reserved. PROPRIETARY AND CONFIDENTIAL.
(function() {
    /**
     * 1. CONFIGURATION
     */
    const SELECTOR = 'button, a:not(._el):not(._dx), input, select, textarea, [tabindex]:not([tabindex="-1"]), .focusable, ._dw, ._eu, ._q, ._b5, ._c2, ._dl, .cinema-nav-btn';
    
    // 2. VIEW CONTROLLERS
    const VIEWS = {
        AUTH_MODAL: '_ah',
        PREMIUM: '_a7',
        ARABIC_MODAL: '_cy', 
        SEARCH: '_bj',
        ISLAND_SEARCH: '_j',
        CINEMA: '_dd',
        DASHBOARD: '_bq',
        SIDEBAR: '_d8'
    };

    let currentFocus = null;
    let cinemaFailsafeTimer = null; 

    /**
     * Determines which elements are currently valid candidates for focus.
     */
    function getFocusableCandidates() {
        // PRIORITY -1: Custom Select Dropdown (Focus Trap)
        const openSelect = document.querySelector('._k.open');
        if (openSelect) {
            return Array.from(openSelect.querySelectorAll('._b5'));
        }

        // PRIORITY 0: Auth & Premium Layers
        const authModal = document.getElementById(VIEWS.AUTH_MODAL);
        if (authModal && (authModal.classList.contains('visible') || isVisible(authModal))) {
            return Array.from(authModal.querySelectorAll(SELECTOR)).filter(isVisible);
        }

        const premiumLanding = document.getElementById(VIEWS.PREMIUM);
        if (premiumLanding && isVisible(premiumLanding)) {
             return Array.from(premiumLanding.querySelectorAll(SELECTOR)).filter(isVisible);
        }

        // Gather References
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
            let candidates = Array.from(cinemaView.querySelectorAll(SELECTOR));
            
            // Add external cinema navigation (Back/Forward buttons) if present
            const cinemaNavContainer = document.getElementById('cinema-nav-container');
            if (cinemaNavContainer) {
                const navButtons = Array.from(cinemaNavContainer.querySelectorAll(SELECTOR));
                candidates = candidates.concat(navButtons);
            }

            return candidates.filter(isVisible);
        }

        // PRIORITY 4: Standard Views (Dashboard, Island, Sidebar)
        const islandSearch = document.getElementById(VIEWS.ISLAND_SEARCH);
        const trojanContent = document.querySelector('.trojan-content'); 

        const islandCandidates = islandSearch ? Array.from(islandSearch.querySelectorAll(SELECTOR)) : [];
        const trojanCandidates = trojanContent ? Array.from(trojanContent.querySelectorAll(SELECTOR)) : [];
        const dashCandidates = dashboardView ? Array.from(dashboardView.querySelectorAll(SELECTOR)) : [];
        const sidebarCandidates = sidebar ? Array.from(sidebar.querySelectorAll(SELECTOR)) : [];
        
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
            
            // In Cinema, waking up shouldn't grab focus automatically; wait for explicit Down key
            const cinemaView = document.getElementById(VIEWS.CINEMA);
            if (cinemaView && cinemaView.classList.contains('active')) {
                return true; 
            }

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

    /**
     * Cinema Failsafe Timer
     */
    function resetCinemaFailsafe() {
        if (cinemaFailsafeTimer) clearTimeout(cinemaFailsafeTimer);
        
        cinemaFailsafeTimer = setTimeout(() => {
            // 5 Seconds elapsed: Release Focus
            if (document.activeElement) {
                document.activeElement.blur();
            }
            currentFocus = null;
            cinemaFailsafeTimer = null; 
        }, 5000);
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
            // Check Premium First
            const premiumLanding = document.getElementById(VIEWS.PREMIUM);
            if (premiumLanding && isVisible(premiumLanding)) {
                 const btns = premiumLanding.querySelectorAll(SELECTOR);
                 if (btns.length > 0) focusElement(btns[0]);
                 return;
            }

            const islandInput = document.getElementById('_cz');
            if (islandInput && isVisible(islandInput)) {
                focusElement(islandInput);
            } else if (all.length > 0) {
                focusElement(all[0]);
            }
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
            
            const cinemaView = document.getElementById(VIEWS.CINEMA);
            const isCinemaActive = cinemaView && cinemaView.classList.contains('active') && isVisible(cinemaView);

            if (isCinemaActive) {
                const active = document.activeElement;
                const isDropdownOpen = !!document.querySelector('._k.open');

                if (e.key === 'ArrowDown') {
                    if (!isDropdownOpen && (!active || active === document.body)) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        
                        let candidates = Array.from(cinemaView.querySelectorAll(SELECTOR));
                        // Include external nav candidates for wake-up
                        const cinemaNavContainer = document.getElementById('cinema-nav-container');
                        if (cinemaNavContainer) {
                            candidates = candidates.concat(Array.from(cinemaNavContainer.querySelectorAll(SELECTOR)));
                        }

                        const visibleCandidates = candidates.filter(isVisible);

                        if (visibleCandidates.length > 0) {
                            // Prefer _q (play button usually) or fall back to first available (Back btn)
                            const targetBtn = visibleCandidates.find(el => el.classList.contains('_q')) || visibleCandidates[0];
                            focusElement(targetBtn);
                            resetCinemaFailsafe(); 
                        }
                        return;
                    }
                    resetCinemaFailsafe();
                }

                if (e.key === 'ArrowUp') {
                    if (!isDropdownOpen && active && active !== document.body) {
                        active.blur();
                        currentFocus = null;
                        if(cinemaFailsafeTimer) clearTimeout(cinemaFailsafeTimer);
                        cinemaFailsafeTimer = null;
                        return; 
                    }
                }

                // THE FIX: Left/Right ALWAYS seek unless a dropdown menu OR nav buttons are focused
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    // Check if a specific control is currently focused
                    const isControlFocused = active && active !== document.body && (active.matches(SELECTOR) || active.classList.contains('cinema-nav-btn'));

                    if (isDropdownOpen || isControlFocused) {
                        resetCinemaFailsafe(); 
                        e.stopImmediatePropagation(); 
                        e.preventDefault(); 
                        navigate(e.key);
                        return; 
                    } else {
                        // FORCE SEEK BEHAVIOR
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        
                        const direction = e.key === 'ArrowLeft' ? -10 : 10;
                        if (window.smartSeek) window.smartSeek(direction);

                        const ensureIndicator = (id, isLeft) => {
                            let el = document.getElementById(id);
                            if (!el) {
                                el = document.createElement('div');
                                el.id = id;
                                el.className = `_s ${isLeft ? 'left' : 'right'}`;
                                el.innerHTML = isLeft 
                                    ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg><span>-10s</span>'
                                    : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6-8.5-6z"/></svg><span>+10s</span>';
                                document.body.appendChild(el);
                            }
                            return el;
                        };

                        const isLeft = e.key === 'ArrowLeft';
                        const indicatorId = isLeft ? '_4' : '_v';
                        const indicator = ensureIndicator(indicatorId, isLeft);
                        
                        if (indicator) {
                            indicator.classList.remove('active');
                            void indicator.offsetWidth; 
                            indicator.classList.add('active');

                            if (indicator.dataset.timer) clearTimeout(parseInt(indicator.dataset.timer));
                            
                            const timer = setTimeout(() => {
                                indicator.classList.remove('active');
                            }, 600);
                            indicator.dataset.timer = timer.toString();
                        }
                        return;
                    }
                }
            }

            e.stopImmediatePropagation();
            e.preventDefault();
            navigate(e.key);
        }

        // --- 2.5 SEARCH EXECUTION ---
        if (e.key === 'Enter') {
            const islandInput = document.getElementById('_cz');
            if (document.activeElement === islandInput) {
                const trigger = document.querySelector('._b0');
                if (trigger) {
                    trigger.click(); 
                    return;
                }
            }
            const cinemaView = document.getElementById(VIEWS.CINEMA);
            if (cinemaView && cinemaView.classList.contains('active')) {
                resetCinemaFailsafe();
            }
        }
        
        // --- 3. BACK/ESCAPE ---
        if (e.key === 'Escape' || e.key === 'Backspace') {
            const openSelect = document.querySelector('._k.open');
            if (openSelect) {
                openSelect.classList.remove('open');
                const trigger = openSelect.querySelector('._q');
                if(trigger) trigger.focus();
                return;
            }

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
            const premiumLanding = document.getElementById(VIEWS.PREMIUM);
            if (premiumLanding && isVisible(premiumLanding)) {
                 const startBtn = document.getElementById('_ao');
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