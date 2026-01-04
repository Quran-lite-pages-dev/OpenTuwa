/**
 * SEO & URL PATCH INTERCEPTOR
 * * This script intercepts the main 'launchPlayer' function from app.js.
 * It updates the Browser Title and URL (Deep Linking) without reloading the page.
 */

(function() {
    // Safety Check: Wait until app.js has loaded
    if (typeof launchPlayer === 'undefined') {
        console.warn("seo-patch.js: 'launchPlayer' not found. Make sure this script is loaded AFTER app.js");
        return;
    }

    // 1. Save the original function from app.js so we don't lose it
    const originalLaunchPlayer = window.launchPlayer;

    // 2. Overwrite 'launchPlayer' with our new wrapper
    window.launchPlayer = function(chapterNumber, verseNumber) {
        
        // --- A. Run the Original Logic (Audio, Text, etc.) ---
        // This ensures the app still works exactly as before.
        originalLaunchPlayer(chapterNumber, verseNumber);

        // --- B. Run Your New SEO Logic ---
        try {
            // Access the global metadata array from app.js
            if (typeof SURAH_METADATA !== 'undefined') {
                // Find the correct Surah object (e.g., Chapter 1)
                const surah = SURAH_METADATA.find(s => s.chapter == chapterNumber);
                
                if (surah) {
                    // 1. Update Browser Tab Title
                    document.title = `Surah ${surah.english_name} - Quran for Every Soul`;

                    // 2. Update URL in address bar without reloading (SPA behavior)
                    // This creates the link: https://site.com/?chapter=1&verse=1
                    const newUrl = new URL(window.location);
                    newUrl.searchParams.set('chapter', surah.chapter);
                    
                    if (verseNumber) {
                        newUrl.searchParams.set('verse', verseNumber);
                    }

                    // Push to history (User can now click 'Back' button correctly)
                    window.history.pushState({ path: newUrl.href }, '', newUrl);

                    // 3. Update Meta Description (Good for consistency)
                    const metaDesc = document.querySelector('meta[name="description"]');
                    if (metaDesc) {
                        metaDesc.setAttribute("content", surah.description);
                    }
                }
            }
        } catch (err) {
            console.error("SEO Patch Error:", err);
            // We catch errors silently so the user's audio player never crashes
        }
    };

    console.log("SEO Patch applied: URL and Title will now update automatically.");

})();