/**
 * - Excludes: #chapter-title (as requested)
 * - Preserves ALL your existing colors, fonts, and CSS filters.
 */
(function applyCleanEyeFade() {
    // 1. Inject the Clean CSS (UNTOUCHED)
    const css = `
    @keyframes pureEyeSoothe {
        0% {
            opacity: 0;
            filter: blur(2px);
            transform: translateY(-2px);
        }
        100% {
            opacity: 0.7;
            filter: blur(0);
            transform: translateY(0);
        }
    }

    .eye-fade-active {
        animation: pureEyeSoothe 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: opacity, filter, transform;
    }
    `;
    const style = document.createElement('style');
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    // 2. The Observer Logic
    const observer = new MutationObserver((mutations) => {
        const handledIds = new Set(); 

        mutations.forEach((mutation) => {
            let target = mutation.target;

            // Normalize to Element
            if (target.nodeType === 3) target = target.parentElement;

            const idElement = target.closest('[id]');
            
            if (idElement && !handledIds.has(idElement.id)) {
                // EXCLUSION 1: System Tags (Inputs, etc.)
                if (['INPUT', 'TEXTAREA', 'SCRIPT', 'STYLE'].includes(idElement.tagName)) return;

                // EXCLUSION 2: Specific User Request
                // We strictly ignore the chapter title.
                if (idElement.id === 'chapter-title') return;

                // --- ANIMATION TRIGGER (UNTOUCHED) ---
                idElement.classList.remove('eye-fade-active');
                void idElement.offsetWidth; // Magic Reflow
                idElement.classList.add('eye-fade-active');
                
                // Cleanup
                setTimeout(() => {
                    idElement.classList.remove('eye-fade-active');
                }, 550);

                handledIds.add(idElement.id);
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

    console.log("");
})();