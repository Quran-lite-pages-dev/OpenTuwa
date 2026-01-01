(function() {
    // 1. Get the actual pixel width (including OS scaling)
    const actualWidth = Math.round(window.screen.width * window.devicePixelRatio);
    
    // 2. Determine resolution label
    // We use ranges because scaling math can sometimes be off by 1-2 pixels
    let res = "";
    if (actualWidth >= 7600) res = "8K";        // ~7680px
    else if (actualWidth >= 3800) res = "4K";   // ~3840px
    else if (actualWidth >= 2500) res = "UHD";  // ~2560px
    else if (actualWidth >= 1900) res = "FHD";  // ~1920px (Native 1080p)
    else if (actualWidth >= 1200) res = "HD";   // ~1280px (720p)

    // 3. Update the badge safely
    const updateBadge = () => {
        const badge = document.querySelector('.badge');
        if (badge && res) {
            // Remove any existing custom labels first to prevent stacking
            const existing = badge.querySelector('.res-label');
            if (existing) existing.remove();

            // Append the new label in a span for easy management
            const span = document.createElement('span');
            span.className = 'res-label';
            span.textContent = " " + res;
            badge.appendChild(span);
        }
    };

    // Run when page is ready
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', updateBadge);
    } else {
        updateBadge();
    }
})();
