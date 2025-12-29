// tv-fix.js - Optimized for Real OTT Feel
(function() {
    // REMOVED: The 150ms INPUT_DELAY blocking mechanism.

    function initOTTNavigation() {
        // Listen for capture phase to ensure we handle it before other scripts
        document.addEventListener('keydown', handleKeyNavigation, true);
    }

    function handleKeyNavigation(e) {
        // Only intervene for navigation keys to prevent blocking other interactions
        const navKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        if (!navKeys.includes(e.key)) return;

        // Optional: slight throttle (16ms = 1 frame) just to prevent event flooding
        // without dropping user intent.
        requestAnimationFrame(() => {
            const current = document.activeElement;
            if (current && current.classList.contains('surah-card')) {
                smoothScrollToElement(current);
            }
        });
    }

    function smoothScrollToElement(element) {
        // This is the native "Netflix-style" scroll
        // 'nearest' prevents the page from jumping up/down unnecessarily
        // 'inline: center' keeps the focused item in the middle of the screen
        element.scrollIntoView({
            behavior: 'smooth', 
            block: 'nearest', 
            inline: 'center'
        });
    }

    // Safety Focus Reset: Only run if focus is explicitly LOST to body
    // (Debounced to avoid stealing focus during load)
    let focusDebounce;
    document.addEventListener('focusout', () => {
        clearTimeout(focusDebounce);
        focusDebounce = setTimeout(() => {
            if (document.activeElement === document.body) {
                const firstItem = document.querySelector('.surah-card, .nav-item');
                if (firstItem) firstItem.focus();
            }
        }, 100);
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOTTNavigation);
    } else {
        initOTTNavigation();
    }
})();
