/**
 * lyrics-enginexjs.js
 * Spotify-Style Multi-Line Display
 */
window.LyricsEngine = {
    update: function(container, currentText, nextLines) {
        if (!container) return;

        // 1. Setup Current Verse
        let htmlContent = `<div class="_ac">${currentText}</div>`;
        
        // 2. Loop through upcoming lines
        if (nextLines && Array.isArray(nextLines) && nextLines.length > 0) {
            nextLines.forEach((line, index) => {
                // index 0 = next-1, index 1 = next-2, etc.
                htmlContent += `<div class="_bb next-${index + 1}">${line}</div>`;
            });
        } else {
            // Keep layout stable if no next verses (End of Surah)
            htmlContent += `<div class="_bb" style="opacity:0">&nbsp;</div>`;
        }

        // 3. Inject and Tag
        container.innerHTML = htmlContent;
        container.setAttribute('data-lyrics-mode', 'true');
    }
};