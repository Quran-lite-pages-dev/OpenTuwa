/**
 * SEO & URL PATCH INTERCEPTOR (High Performance Version)
 * 1. Updates URL/Title ONLY when the Chapter changes (Prevents Verse-lag).
 * 2. Handles Browser "Back" button with a clean reload to fix Dashboard glitches.
 */

(function() {
    // Safety: Wait for app.js
    if (typeof launchPlayer === 'undefined') {
        console.warn("seo-patch.js: 'launchPlayer' not found. Load this AFTER app.js");
        return;
    }

    const originalLaunchPlayer = window.launchPlayer;

    // INTERCEPTOR
    window.launchPlayer = function(chapterNumber, verseNumber) {
        
        // 1. Run the App's original logic immediately (Priority)
        originalLaunchPlayer(chapterNumber, verseNumber);

        // 2. SEO Logic (Optimized to run ONLY on Chapter Change)
        try {
            const url = new URL(window.location);
            const currentChapter = url.searchParams.get('chapter');

            // PERF FIX: Only update URL if we are entering a NEW Surah.
            // This prevents "Slow Text" lag caused by updating history for every verse.
            if (currentChapter != chapterNumber) {
                
                if (typeof SURAH_METADATA !== 'undefined') {
                    const surah = SURAH_METADATA.find(s => s.chapter == chapterNumber);
                    
                    if (surah) {
                        // Update Title
                        document.title = `Surah ${surah.english_name} - Quran for Every Soul`;

                        // Update URL (Clean History)
                        url.searchParams.set('chapter', surah.chapter);
                        // We intentionally DO NOT set 'verse' here during playback 
                        // to keep the browser responsive.
                        
                        window.history.pushState({ type: 'player', chapter: surah.chapter }, '', url);
                    }
                }
            }
        } catch (e) { 
            // Ignore SEO errors so Audio never stops
            console.error("SEO Patch Error:", e); 
        }
    };

    // BACK BUTTON LISTENER
    window.addEventListener('popstate', function(event) {
        const url = new URL(window.location);
        const chapter = url.searchParams.get('chapter');

        if (!chapter) {
            // CASE: User clicked "Back" to reach the Dashboard.
            // FIX: Force a reload. This ensures the Dashboard subtitles and 
            // metadata are 100% restored and not broken by the player state.
            window.location.reload();
        } else {
            // CASE: User clicked "Forward" to a Surah.
            // Re-launch player if needed.
            if (typeof originalLaunchPlayer === 'function') {
                originalLaunchPlayer(chapter, 1);
            }
        }
    });

    // INITIAL LOAD (Deep Linking)
    window.addEventListener('load', function() {
        const url = new URL(window.location);
        const chapter = url.searchParams.get('chapter');
        if (chapter && typeof launchPlayer === 'function') {
            // Launch immediately
            launchPlayer(chapter, url.searchParams.get('verse') || 1);
        }
    });

})();