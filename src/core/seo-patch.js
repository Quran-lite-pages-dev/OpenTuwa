/**
 * SEO & URL PATCH INTERCEPTOR (Fixed for Back Button)
 * 1. Updates URL/Title when Surah plays.
 * 2. Handles Browser "Back" button to close player/return to dashboard.
 * 3. Prevents "Double Back" issue by checking current state.
 */

(function() {
    // Safety: Wait for app.js
    if (typeof launchPlayer === 'undefined') {
        console.warn("seo-patch.js: 'launchPlayer' not found. Load this AFTER app.js");
        return;
    }

    // 1. Intercept the Player Launch
    const originalLaunchPlayer = window.launchPlayer;

    window.launchPlayer = function(chapterNumber, verseNumber) {
        // A. Run original app logic
        originalLaunchPlayer(chapterNumber, verseNumber);

        // B. Update URL & Title (SEO)
        try {
            if (typeof SURAH_METADATA !== 'undefined') {
                const surah = SURAH_METADATA.find(s => s.chapter == chapterNumber);
                if (surah) {
                    document.title = `Surah ${surah.english_name} - Quran for Every Soul`;

                    // --- FIX 1: Prevent Duplicate History (Double Click Issue) ---
                    const url = new URL(window.location);
                    const currentChapter = url.searchParams.get('chapter');

                    // Only push a new state if we are actually changing chapters
                    if (currentChapter != surah.chapter) {
                        url.searchParams.set('chapter', surah.chapter);
                        if (verseNumber) url.searchParams.set('verse', verseNumber);
                        
                        // Push new URL to history
                        window.history.pushState({ type: 'player', chapter: surah.chapter }, '', url);
                    }
                }
            }
        } catch (e) { console.error("SEO Patch Error:", e); }
    };

    // --- FIX 2: Handle Browser "Back" Button ---
    window.addEventListener('popstate', function(event) {
        // The user pressed Back/Forward. Check the URL.
        const url = new URL(window.location);
        const chapter = url.searchParams.get('chapter');

        if (!chapter) {
            // CASE: URL is back to root (Dashboard). We must close the player.
            console.log("Back to Dashboard detected.");
            
            // Try to find the app's internal close function
            if (typeof closePlayer === 'function') {
                closePlayer(); 
            } else if (typeof returnToDashboard === 'function') {
                returnToDashboard();
            } else {
                // FALLBACK: If we can't find the function name, 
                // force a reload to ensure the dashboard appears clean.
                // This mimics the "Previous" behavior you liked.
                window.location.reload();
            }
        } else {
            // CASE: User went "Forward" to a chapter. Re-open player if needed.
            // (Optional: triggers audio again if user wants deeply integrated nav)
            if (typeof originalLaunchPlayer === 'function') {
                originalLaunchPlayer(chapter, url.searchParams.get('verse') || 1);
            }
        }
    });

    // 3. Initial Load Handling (Deep Linking)
    // If user lands on "?chapter=1", launch it automatically.
    window.addEventListener('load', function() {
        const url = new URL(window.location);
        const chapter = url.searchParams.get('chapter');
        if (chapter && typeof launchPlayer === 'function') {
            // Small delay to ensure App is ready
            setTimeout(() => launchPlayer(chapter, url.searchParams.get('verse') || 1), 500);
        }
    });

})();