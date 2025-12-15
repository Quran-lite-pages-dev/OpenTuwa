// tv-fix.js - OTT Spatial Navigation Engine
(function() {
    let lastInputTime = 0;
    const INPUT_DELAY = 150; // Ignore clicks faster than 150ms to prevent "ghosting"

    function initOTTNavigation() {
        document.addEventListener('keydown', (e) => {
            const now = Date.now();
            if (now - lastInputTime < INPUT_DELAY) {
                e.preventDefault();
                return; // Debounce
            }
            lastInputTime = now;

            const current = document.activeElement;
            if (!current) return;

            // Handle Row Shifting
            if (current.classList.contains('surah-card')) {
                shiftRowToVisible(current);
            }
        }, true);
    }

    function shiftRowToVisible(element) {
        const row = element.parentElement;
        if (!row || !row.classList.contains('card-scroller')) return;

        const rowRect = row.getBoundingClientRect();
        const itemRect = element.getBoundingClientRect();

        // Calculate offset relative to the row's start
        // We want the focused item to be roughly 10% from the left (Netflix style)
        const targetX = element.offsetLeft - 100; 
        
        // Use transform instead of scrollLeft for 60fps performance
        row.style.transform = `translateX(-${targetX}px)`;
    }

    // Custom Focus Reset (If user hits a dead end)
    document.addEventListener('keydown', (e) => {
        if (!document.activeElement || document.activeElement === document.body) {
            document.querySelector('.nav-item, .surah-card')?.focus();
        }
    });

    // Run when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOTTNavigation);
    } else {
        initOTTNavigation();
    }
})();
