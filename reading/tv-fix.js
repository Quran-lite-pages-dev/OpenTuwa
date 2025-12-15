// tv-fix.js

(function() {
    console.log("TV Patch Loaded (Directional Fix)");

    // --- STATE TRACKING ---
    let tvState = {
        lastViewWasSearch: false
    };

    // --- 1. IMPROVED SPATIAL NAVIGATION ---
    function initSpatialNav() {
        // Select all things we can click or focus
        const focusableSelector = 'a, button, input, select, [tabindex]:not([tabindex="-1"]), .nav-item, .surah-card';

        document.addEventListener('keydown', (e) => {
            const key = e.key;
            if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) return;

            e.preventDefault(); // STOP browser scrolling

            const current = document.activeElement;
            const focusables = Array.from(document.querySelectorAll(focusableSelector))
                .filter(el => {
                    // Filter out hidden or disabled items
                    return el.offsetParent !== null && !el.disabled && el.style.display !== 'none' && el.style.visibility !== 'hidden';
                });

            if (!focusables.includes(current)) {
                // If focus is lost, reset to the first available item (usually Sidebar Home)
                focusables[0]?.focus();
                return;
            }

            const curRect = current.getBoundingClientRect();
            const curCenter = { 
                x: curRect.left + (curRect.width / 2), 
                y: curRect.top + (curRect.height / 2) 
            };

            let bestCandidate = null;
            let minScore = Infinity;

            focusables.forEach(el => {
                if (el === current) return;

                const elRect = el.getBoundingClientRect();
                const elCenter = { 
                    x: elRect.left + (elRect.width / 2), 
                    y: elRect.top + (elRect.height / 2) 
                };

                // --- DIRECTION FILTERS ---
                // We strictly exclude items that are in the "wrong" direction
                // to prevent the "Press Right -> Go Down" bug.
                
                let isInDirection = false;
                
                switch (key) {
                    case 'ArrowRight':
                        // Must be to the right of current center
                        isInDirection = elCenter.x > curCenter.x; 
                        break;
                    case 'ArrowLeft':
                        // Must be to the left of current center
                        isInDirection = elCenter.x < curCenter.x;
                        break;
                    case 'ArrowDown':
                        // Must be below current center
                        isInDirection = elCenter.y > curCenter.y;
                        break;
                    case 'ArrowUp':
                        // Must be above current center
                        isInDirection = elCenter.y < curCenter.y;
                        break;
                }

                if (!isInDirection) return;

                // --- WEIGHTED DISTANCE CALCULATION ---
                // We calculate distance, but we PENALIZE misalignment.
                // If pressing Right, vertical difference (dy) is "bad" distance (multiplied by 5).
                // Horizontal difference (dx) is "good" distance (normal).

                const dx = Math.abs(elCenter.x - curCenter.x);
                const dy = Math.abs(elCenter.y - curCenter.y);
                let score = 0;

                if (key === 'ArrowLeft' || key === 'ArrowRight') {
                    // Moving Horizontally: Alignment (dy) matters MOST.
                    // If an item is far away horizontally but perfectly aligned, pick it 
                    // over an item that is close but diagonally offset.
                    score = dx + (dy * 5); 
                } else {
                    // Moving Vertically: Alignment (dx) matters MOST.
                    score = dy + (dx * 5);
                }

                if (score < minScore) {
                    minScore = score;
                    bestCandidate = el;
                }
            });

            if (bestCandidate) {
                bestCandidate.focus();
                
                // Smooth Scroll to the element if it's off-screen
                bestCandidate.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
        });
    }

    // --- 2. BACK BUTTON HANDLING ---
    // (Kept your original logic here as it seemed fine)
    function handleBack(e) {
        if(e) e.preventDefault();
        
        // Logic: If in Player -> Close to Dashboard
        // If in Dashboard -> Focus Sidebar
        const cinema = document.getElementById('cinema-view');
        
        if (cinema && cinema.classList.contains('active')) {
             // We can trigger the existing 'close' logic or click the back button
             // Assuming you have a function or button for this:
             const backBtn = document.getElementById('back-btn');
             if(backBtn) backBtn.click();
             return;
        }

        const sidebar = document.getElementById('tv-sidebar');
        if (document.activeElement && sidebar && !sidebar.contains(document.activeElement)) {
            // If focused on grid, move focus to sidebar
            document.getElementById('nav-profile')?.focus();
            return;
        }
    }

    // Hook Keys
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.key === 'Backspace' || e.keyCode === 10009 || e.keyCode === 461) {
            handleBack(e);
        }
    });

    // Run Init
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initSpatialNav();
    } else {
        document.addEventListener('DOMContentLoaded', initSpatialNav);
    }

})();
