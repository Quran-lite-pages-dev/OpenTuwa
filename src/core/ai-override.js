// File: src/core/ai-override.js
// Purpose: Handles AI Search with Multi-Result Cycling

(function() {
    console.log("AI Search Injector: Initializing...");

    const WORKER_URL = '/search'; // Ensure this matches your route
    
    // STATE MANAGEMENT
    let searchTimeout = null;
    let cachedQuery = "";      // The text currently in the results cache
    let cachedResults = [];    // The list of chapters [12, 21, ...]
    let resultIndex = 0;       // Which result we are currently showing

    document.addEventListener('DOMContentLoaded', () => {
        const islandInput = document.getElementById('island-input');
        const islandBox = document.querySelector('.island-search-box');
        const triggerBtn = document.getElementById('island-trigger');

        if (!islandInput || !islandBox) return;

        // 1. INPUT: Debounce logic
        islandInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            // Reset state on new typing
            if (query !== cachedQuery) {
                if (islandBox) islandBox.style.borderColor = 'rgba(0, 255, 187, 0.3)';
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    executeSearch(query, islandBox);
                }, 800); // Wait 800ms after typing stops
            }
        });

        // 2. ENTER KEY: Cycle or Search
        islandInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = e.target.value.trim();
                handleTrigger(query, islandBox);
            }
        });

        // 3. BUTTON CLICK: Cycle or Search
        if (triggerBtn) {
            triggerBtn.addEventListener('click', () => {
                const query = islandInput.value.trim();
                handleTrigger(query, islandBox);
            });
        }
    });

    // Decides whether to fetch new data or cycle existing data
    function handleTrigger(query, islandBox) {
        if (!query) return;

        // CYCLE MODE: If query matches cache and we have results, just move next
        if (query === cachedQuery && cachedResults.length > 0) {
            cycleNextResult(islandBox);
        } else {
            // NEW SEARCH: Clear timeout and run immediately
            clearTimeout(searchTimeout);
            executeSearch(query, islandBox);
        }
    }

    // Moves to the next chapter in the cached list
    function cycleNextResult(islandBox) {
        resultIndex++;
        if (resultIndex >= cachedResults.length) {
            resultIndex = 0; // Loop back to start
            // Optional: Visual cue that we looped (e.g., flash blue)
            if(islandBox) {
                islandBox.style.borderColor = '#00bbff'; 
                setTimeout(() => islandBox.style.borderColor = '', 300);
            }
        }
        
        const chapterToFind = cachedResults[resultIndex];
        highlightChapter(chapterToFind);
    }

    async function executeSearch(query, islandBox) {
        if (!query) {
            if (islandBox) islandBox.style.borderColor = '';
            resetCardStyles();
            return;
        }

        if (islandBox) islandBox.style.borderColor = '#00ffbb'; // Thinking Green

        try {
            // 1. FAST PATH: Numeric Input (e.g. "67")
            if (!isNaN(query) && query > 0 && query <= 114) {
                cachedQuery = query;
                cachedResults = [parseInt(query)];
                resultIndex = 0;
                highlightChapter(cachedResults[0]);
                if (islandBox) islandBox.style.borderColor = '';
                return;
            }

            // 2. AI PATH: Fetch from Worker
            const response = await fetch(WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query })
            });

            if (!response.ok) throw new Error("AI Endpoint Error");

            const data = await response.json();
            
            // Expecting data.chapters = [1, 2, 3...]
            if (data.chapters && Array.isArray(data.chapters) && data.chapters.length > 0) {
                // SUCCESS: Update Cache
                cachedQuery = query;
                cachedResults = data.chapters;
                resultIndex = 0;
                
                // Highlight the first one
                highlightChapter(cachedResults[0]);
                
                if (islandBox) islandBox.classList.remove('island-error');
            } else {
                // AI returned nothing useful
                triggerErrorShake(islandBox);
            }

        } catch (err) {
            console.error("AI Search Error:", err);
            triggerErrorShake(islandBox);
        } finally {
            if (islandBox) islandBox.style.borderColor = ''; 
        }
    }

    function highlightChapter(chapterNum) {
        resetCardStyles();

        // Search for card by visible text number
        const cards = Array.from(document.querySelectorAll('.surah-card'));
        const targetCard = cards.find(card => {
            const numDiv = card.querySelector('.card-bg-num');
            return numDiv && numDiv.textContent.trim() == chapterNum;
        });

        if (targetCard) {
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Make it pop
            targetCard.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            targetCard.style.transform = 'scale(1.1)';
            targetCard.style.filter = 'brightness(1.4)';
            targetCard.style.boxShadow = '0 0 25px rgba(0, 255, 187, 0.6)';
            targetCard.style.zIndex = '10'; // Bring to front

            // Keep it highlighted slightly longer so user sees it
            setTimeout(() => {
                targetCard.style.transform = 'scale(1)';
                targetCard.style.filter = 'none';
                targetCard.style.boxShadow = 'none';
                targetCard.style.zIndex = 'auto';
            }, 2500);
        } else {
            console.warn(`Card ${chapterNum} not found in DOM.`);
        }
    }

    function resetCardStyles() {
        document.querySelectorAll('.surah-card').forEach(c => {
            c.style.transform = 'scale(1)';
            c.style.filter = 'none';
            c.style.boxShadow = 'none';
            c.style.zIndex = 'auto';
        });
    }

    function triggerErrorShake(element) {
        if (!element) return;
        element.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(5px)' },
            { transform: 'translateX(0)' }
        ], { duration: 300 });
        
        element.style.borderColor = '#ff3333';
        setTimeout(() => element.style.borderColor = '', 1000);
    }

})();