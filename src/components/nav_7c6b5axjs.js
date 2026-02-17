// Copyright (c) Haykal M. Zaidi 2024-2026. All rights reserved. PROPRIETARY AND CONFIDENTIAL.
(function() {
    /**
     * 1. CONFIGURATION & STATE
     */
    const SELECTOR = 'button, a:not(._el):not(._dx), input, select, textarea, [tabindex]:not([tabindex="-1"]), .focusable, ._dw, ._eu, ._q, ._b5, ._c2, ._dl, .cinema-nav-btn';
    
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

    // State Memory
    let currentFocus = null;
    let previousFocus = null; // For history backtracking
    let cinemaFailsafeTimer = null; 
    
    // "Sticky" memory: Maps container IDs/Classes to their last focused element
    // This makes the nav remember where you were in the sidebar or a specific grid
    const focusHistory = new WeakMap(); 

    /**
     * 2. GEOMETRY & PHYSICS (The "Human" Element)
     */

    /**
     * Returns true if rect2 is strictly in the direction of 'dir' from rect1
     */
    function isInDirection(r1, r2, dir) {
        switch (dir) {
            case 'ArrowUp': return r2.bottom <= r1.top + 10; // +10 fuzziness
            case 'ArrowDown': return r2.top >= r1.bottom - 10;
            case 'ArrowLeft': return r2.right <= r1.left + 10;
            case 'ArrowRight': return r2.left >= r1.right - 10;
        }
        return false;
    }

    /**
     * Calculates how much two elements align on the secondary axis.
     * High alignment = visually intuitive movement.
     */
    function getAlignment(r1, r2, dir) {
        let overlap = 0;
        if (dir === 'ArrowLeft' || dir === 'ArrowRight') {
            // Compare Y-axis alignment
            const maxTop = Math.max(r1.top, r2.top);
            const minBottom = Math.min(r1.bottom, r2.bottom);
            overlap = Math.max(0, minBottom - maxTop);
            return overlap / Math.min(r1.height, r2.height); // Normalized 0 to 1
        } else {
            // Compare X-axis alignment
            const maxLeft = Math.max(r1.left, r2.left);
            const minRight = Math.min(r1.right, r2.right);
            overlap = Math.max(0, minRight - maxLeft);
            return overlap / Math.min(r1.width, r2.width);
        }
    }

    /**
     * The Magic Formula: Weighs distance vs. alignment.
     * Humans prefer a slightly further item if it is perfectly aligned.
     */
    function getScore(r1, r2, dir) {
        let dist = 0;
        const c1 = { x: r1.left + r1.width / 2, y: r1.top + r1.height / 2 };
        const c2 = { x: r2.left + r2.width / 2, y: r2.top + r2.height / 2 };

        // 1. Calculate Euclidean Distance
        const dx = (c1.x - c2.x);
        const dy = (c1.y - c2.y);
        const euclidean = Math.sqrt(dx*dx + dy*dy);

        // 2. Calculate Axis Distance (Primary Movement Cost)
        let primaryDist = 0;
        if (dir === 'ArrowLeft' || dir === 'ArrowRight') primaryDist = Math.abs(r1.left - r2.left);
        else primaryDist = Math.abs(r1.top - r2.top);

        // 3. Calculate Alignment Bonus (0.0 to 1.0)
        const align = getAlignment(r1, r2, dir);

        // 4. Weighting
        // If alignment is high (> 0.5), we forgive larger distances.
        // If alignment is low, we punish the distance heavily (preventing diagonal jumps).
        
        let penalty = 0;
        if (align < 0.1) penalty = 10000; // Basically impossible unless it's the only option
        else if (align < 0.5) penalty = 500;

        return euclidean + (primaryDist * 0.5) - (align * 1000) + penalty;
    }

    /**
     * 3. CONTROLLERS & LOGIC
     */

    function getFocusableCandidates() {
        // [Priority -1]: Focus Traps (Dropdowns)
        const openSelect = document.querySelector('._k.open');
        if (openSelect) return Array.from(openSelect.querySelectorAll('._b5'));

        // [Priority 0]: Modals & Overlays
        const authModal = document.getElementById(VIEWS.AUTH_MODAL);
        if (authModal && isVisible(authModal)) return Array.from(authModal.querySelectorAll(SELECTOR));

        const premium = document.getElementById(VIEWS.PREMIUM);
        if (premium && isVisible(premium)) return Array.from(premium.querySelectorAll(SELECTOR));

        const arabic = document.getElementById(VIEWS.ARABIC_MODAL);
        if (arabic && isVisible(arabic)) return Array.from(arabic.querySelectorAll(SELECTOR));

        const search = document.getElementById(VIEWS.SEARCH);
        if (search && search.classList.contains('active')) return Array.from(search.querySelectorAll(SELECTOR));

        // [Priority 1]: Cinema View (Restricted scope)
        const cinema = document.getElementById(VIEWS.CINEMA);
        if (cinema && cinema.classList.contains('active')) {
            let items = Array.from(cinema.querySelectorAll(SELECTOR));
            const nav = document.getElementById('cinema-nav-container'); // External controls
            if (nav) items = items.concat(Array.from(nav.querySelectorAll(SELECTOR)));
            return items.filter(isVisible);
        }

        // [Priority 2]: Standard App Flow (Dashboard + Sidebar + Island)
        const rootCandidates = document.querySelectorAll(SELECTOR);
        return Array.from(rootCandidates).filter(el => {
            // Filter out elements hidden inside inactive views to prevent "ghost" jumps
            return isVisible(el) && !el.closest('.hidden'); 
        });
    }

    function isVisible(el) {
        if (!el) return false;
        if (el.disabled || el.getAttribute('aria-hidden') === 'true') return false;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    }

    /**
     * Core Navigation Handler
     */
    function navigate(direction) {
        if (attemptWakeUp()) return;

        const all = getFocusableCandidates();
        
        // 1. Handle "Lost Focus" / Start
        if (!currentFocus || !document.body.contains(currentFocus)) {
            const saved = previousFocus && document.body.contains(previousFocus) && isVisible(previousFocus) 
                ? previousFocus 
                : all[0];
            if (saved) focusElement(saved);
            return;
        }

        const r1 = currentFocus.getBoundingClientRect();
        
        // 2. Filter Candidates based on Direction
        // Only look at items "in front" of the current focus
        const validCandidates = all.filter(el => {
            if (el === currentFocus) return false;
            return isInDirection(r1, el.getBoundingClientRect(), direction);
        });

        if (validCandidates.length === 0) return; // End of list/container

        // 3. Score candidates
        let bestCandidate = null;
        let minScore = Infinity;

        validCandidates.forEach(el => {
            const score = getScore(r1, el.getBoundingClientRect(), direction);
            if (score < minScore) {
                minScore = score;
                bestCandidate = el;
            }
        });

        if (bestCandidate) {
            focusElement(bestCandidate);
        }
    }

    function focusElement(el) {
        // Save history for the parent container before moving
        if (currentFocus && currentFocus.parentElement) {
            focusHistory.set(currentFocus.parentElement, currentFocus);
        }

        previousFocus = currentFocus;
        currentFocus = el;
        el.focus();

        // Smooth Scroll with padding
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        
        // Visual Hook for debugging or effects
        // el.classList.add('nav-target');
        // setTimeout(() => el.classList.remove('nav-target'), 200);
    }

    /**
     * 4. CINEMA SPECIFIC LOGIC (Seek vs Focus)
     */
    function handleCinemaInput(e) {
        const cinemaView = document.getElementById(VIEWS.CINEMA);
        if (!cinemaView || !cinemaView.classList.contains('active')) return false;

        const active = document.activeElement;
        const isUIFocused = active && active !== document.body && (active.matches(SELECTOR));
        const isDropdownOpen = !!document.querySelector('._k.open');

        // Case 1: Up/Down - Always handle UI focus
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            if (!isUIFocused && e.key === 'ArrowDown') {
                // Wake up UI
                const candidates = getFocusableCandidates();
                // Prefer play button or center items
                const preferred = candidates.find(c => c.classList.contains('_q')) || candidates[0];
                if (preferred) focusElement(preferred);
                resetCinemaFailsafe();
                e.preventDefault();
                return true;
            }
            if (isUIFocused && e.key === 'ArrowUp') {
                // Hide UI logic
                // If we are at the top row, blur.
                // Simplified: Just blur if up is pressed on UI
                active.blur();
                currentFocus = null;
                resetCinemaFailsafe(); // actually clear it
                return true;
            }
            resetCinemaFailsafe();
            return false; // Let standard navigate() handle moving between buttons
        }

        // Case 2: Left/Right - Context Dependent
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            if (isUIFocused || isDropdownOpen) {
                resetCinemaFailsafe();
                return false; // Let standard navigate() move focus between buttons
            } 
            
            // UI Hidden? SEEK.
            e.preventDefault();
            e.stopImmediatePropagation();
            triggerSmartSeek(e.key === 'ArrowLeft' ? -10 : 10);
            return true;
        }
        
        return false;
    }

    function triggerSmartSeek(seconds) {
        if (window.smartSeek) window.smartSeek(seconds);
        
        // Visual Feedback
        const id = seconds < 0 ? '_4' : '_v';
        const indicator = document.getElementById(id) || createSeekIndicator(id, seconds < 0);
        
        indicator.classList.remove('active');
        void indicator.offsetWidth; // force reflow
        indicator.classList.add('active');
        
        clearTimeout(indicator.timer);
        indicator.timer = setTimeout(() => indicator.classList.remove('active'), 600);
    }

    function createSeekIndicator(id, isLeft) {
        const el = document.createElement('div');
        el.id = id;
        el.className = `_s ${isLeft ? 'left' : 'right'}`;
        el.innerHTML = isLeft 
            ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg><span>-10s</span>'
            : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6-8.5-6z"/></svg><span>+10s</span>';
        document.body.appendChild(el);
        return el;
    }

    function resetCinemaFailsafe() {
        if (cinemaFailsafeTimer) clearTimeout(cinemaFailsafeTimer);
        cinemaFailsafeTimer = setTimeout(() => {
            if (document.activeElement && document.activeElement !== document.body) {
                document.activeElement.blur();
            }
            currentFocus = null;
        }, 5000); // 5 seconds of inactivity hides UI
    }

    function attemptWakeUp() {
        if (document.body.classList.contains('idle')) {
            document.body.classList.remove('idle');
            document.body.dispatchEvent(new Event('mousemove'));
            return true; // Consumed the event to wake up
        }
        return false;
    }

    /**
     * 5. EVENT LISTENERS
     */
    window.addEventListener('keydown', (e) => {
        // Global Back/Escape
        if (e.key === 'Escape' || e.key === 'Backspace') {
            const openSelect = document.querySelector('._k.open');
            if (openSelect) {
                openSelect.classList.remove('open');
                if(previousFocus) previousFocus.focus();
                return;
            }
            // Standard back logic...
            const activeView = document.querySelector('.active'); // Assuming generic view class
            if(activeView) {
                 const closeBtn = activeView.querySelector('.close-btn, .back-btn');
                 if(closeBtn) closeBtn.click();
            }
            return;
        }

        // Nav Keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            // Check Cinema Context first
            if (handleCinemaInput(e)) return;

            // Standard Navigation
            e.preventDefault();
            e.stopImmediatePropagation();
            navigate(e.key);
        }

        // Enter Key
        if (e.key === 'Enter') {
            if (document.activeElement.tagName === 'INPUT') return; // Let forms submit naturally
            
            // Specific overrides if needed
            const cinema = document.getElementById(VIEWS.CINEMA);
            if(cinema && cinema.classList.contains('active')) resetCinemaFailsafe();
            
            document.activeElement.click();
        }
    }, true);

    // Mouse Override (Hybrid support)
    document.addEventListener('mousemove', () => {
        // If user moves mouse, we stop forcing focus styles maybe?
        // document.body.classList.add('mouse-mode');
    });

    document.addEventListener('focusin', (e) => {
        if (e.target.matches && e.target.matches(SELECTOR)) {
            currentFocus = e.target;
            resetCinemaFailsafe();
        }
    });

    // Observer for DOM changes (Lazily re-focus if current item disappears)
    new MutationObserver(() => {
        if (currentFocus && !document.body.contains(currentFocus)) {
            // Try to find a sibling or parent fallback
            // For now, reset to global default
            currentFocus = null;
        }
    }).observe(document.body, { childList: true, subtree: true });

    // Initial Load
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            // Auto-focus logic
            const premium = document.getElementById(VIEWS.PREMIUM);
            if (premium && isVisible(premium)) {
                const btn = premium.querySelector(SELECTOR);
                if(btn) focusElement(btn);
            }
        }, 500);
    });

})();