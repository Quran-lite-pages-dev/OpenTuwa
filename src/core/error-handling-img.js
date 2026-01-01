// Detects all current and future broken images site-wide
document.addEventListener('error', function (event) {
    const target = event.target;
    if (target.tagName.toLowerCase() === 'img') {
        // Option A: Hide completely
        target.style.display = 'none'; 
        
        // Option B: Optional replacement with a 1x1 transparent pixel 
        // to maintain layout/spacing without showing anything ugly
        // target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }
}, true); // 'true' is critical to catch events in the capturing phase
