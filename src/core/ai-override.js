// File: src/core/ai-override.js
// Purpose: Overwrites the traditional 'performGhostSearch' with AI logic.

(function() {
    console.log("AI Search Injector: Active");

    let searchTimeout = null;
    const WORKER_URL = '/api/search';

    // We overwrite the global function used by app.js
    window.performGhostSearch = async function(isCycleMode = false) {
        const islandInput = document.getElementById('islandInput');
        const islandBox = document.querySelector('.island-box');
        const query = islandInput.value.trim();

        // 1. CLEANUP: If empty, reset everything
        if (query.length === 0) {
            clearTimeout(searchTimeout);
            document.querySelectorAll('.surah-card').forEach(c => {
                c.style.opacity = '1';
                c.style.transform = 'scale(1)';
                c.style.filter = 'none';
            });
            if (islandBox) islandBox.style.borderColor = ''; 
            return;
        }

        // 2. LOGIC: If 'Enter' was pressed (isCycleMode), search immediately.
        // Otherwise (typing), wait 800ms (Debounce).
        if (isCycleMode) {
            clearTimeout(searchTimeout);
            runAiQuery(query, islandBox);
        } else {
            // Visual feedback that we are "waiting" for them to finish typing
            if (islandBox) islandBox.style.borderColor = 'rgba(0, 255, 187, 0.3)';
            
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                runAiQuery(query, islandBox);
            }, 800); // Wait 0.8 seconds after typing stops
        }
    };

    // The core AI function
    async function runAiQuery(query, islandBox) {
        if (islandBox) islandBox.style.borderColor = '#00ffbb'; // Bright Green = Thinking

        try {
            // 1. Check if it's just a number (Fast Path)
            if (!isNaN(query) && query > 0 && query <= 114) {
                highlightChapter(parseInt(query));
                if (islandBox) islandBox.style.borderColor = '';
                return;
            }

            // 2. Ask Cloudflare AI
            const response = await fetch(WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query })
            });

            if (!response.ok) throw new Error("AI Offline");

            const data = await response.json();
            const chapter = parseInt(data.chapter);

            // 3. Handle Result
            if (chapter && !isNaN(chapter)) {
                highlightChapter(chapter);
                if (islandBox) islandBox.classList.remove('island-error');
            } else {
                triggerErrorShake(islandBox);
            }

        } catch (err) {
            console.error("AI Error:", err);
            triggerErrorShake(islandBox);
        } finally {
            if (islandBox) islandBox.style.borderColor = ''; 
        }
    }

    // Helper: Scroll to and highlight the card
    function highlightChapter(chapterNum) {
        const targetCard = document.querySelector(`.surah-card[data-chapter="${chapterNum}"]`);
        if (targetCard) {
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Animation
            targetCard.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            targetCard.style.transform = 'scale(1.08)';
            targetCard.style.filter = 'brightness(1.4) drop-shadow(0 0 15px rgba(0,255,187,0.3))';
            
            setTimeout(() => {
                targetCard.style.transform = 'scale(1)';
                targetCard.style.filter = 'none';
            }, 800);
        }
    }

    // Helper: Shake animation for no results
    function triggerErrorShake(element) {
        if (!element) return;
        element.classList.add('island-error'); // Assumes you have this class in css
        element.style.borderColor = '#ff3333';
        setTimeout(() => {
            element.classList.remove('island-error');
            element.style.borderColor = '';
        }, 400);
    }

})();