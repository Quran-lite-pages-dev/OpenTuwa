(function() {
    // 1. CONFIGURATION
    const SELECTOR = 'button, a, input, [tabindex]:not([tabindex="-1"]), .focusable';
    const THRESHOLD = 10;
    let currentFocus = null;

    function getDistance(r1, r2, dir) {
        const c1 = { x: r1.left + r1.width / 2, y: r1.top + r1.height / 2 };
        const c2 = { x: r2.left + r2.width / 2, y: r2.top + r2.height / 2 };
        let dMajor = (dir === 'ArrowLeft' || dir === 'ArrowRight') ? Math.abs(c1.x - c2.x) : Math.abs(c1.y - c2.y);
        let dMinor = (dir === 'ArrowLeft' || dir === 'ArrowRight') ? Math.abs(c1.y - c2.y) : Math.abs(c1.x - c2.x);
        return (13 * dMajor) + dMinor;
    }

    function navigate(direction, isFallback = false) {
        const all = Array.from(document.querySelectorAll(SELECTOR))
            .filter(el => el.offsetParent !== null && !el.disabled);

        if (!currentFocus || !document.contains(currentFocus)) {
            currentFocus = all[0];
            currentFocus?.focus();
            return;
        }

        const r1 = currentFocus.getBoundingClientRect();
        let best = null, minScore = Infinity;

        all.forEach(el => {
            if (el === currentFocus) return;
            const r2 = el.getBoundingClientRect();
            let isCandidate = false;

            if (direction === 'ArrowRight') isCandidate = r2.left >= r1.right - THRESHOLD;
            else if (direction === 'ArrowLeft') isCandidate = r2.right <= r1.left + THRESHOLD;
            else if (direction === 'ArrowDown') isCandidate = r2.top >= r1.bottom - THRESHOLD;
            else if (direction === 'ArrowUp') isCandidate = r2.bottom <= r1.top + THRESHOLD;

            if (isCandidate) {
                const score = getDistance(r1, r2, direction);
                if (score < minScore) { minScore = score; best = el; }
            }
        });

        if (best) {
            currentFocus = best;
            best.focus();
            best.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        } else if (!isFallback) {
            if (direction === 'ArrowRight') navigate('ArrowDown', true);
            else if (direction === 'ArrowLeft') navigate('ArrowUp', true);
        }
    }

    // 2. OVERRIDE & CAPTURE LOGIC
    // useCapture: true ensures we intercept keys before the website's own code can
    window.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.stopImmediatePropagation(); // The "Vacuum" command: kills other scripts' listeners
            e.preventDefault(); 
            navigate(e.key);
        }
        if (e.key === 'Tab') e.preventDefault(); // Disables linear tabbing for 100% spatial mode
    }, true); 

    // 3. DYNAMIC CONTENT OBSERVER
    // Automatically focuses the first item if the page changes and focus is lost
    const observer = new MutationObserver(() => {
        if (!document.activeElement || document.activeElement === document.body) {
            const first = document.querySelector(SELECTOR);
            if (first) { currentFocus = first; first.focus(); }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('focusin', (e) => { if (e.target.matches(SELECTOR)) currentFocus = e.target; });
    window.addEventListener('DOMContentLoaded', () => navigate());
    if (document.readyState !== 'loading') navigate();
})();
