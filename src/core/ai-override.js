// File: src/core/ai-override.js
// Purpose: Handles the AI Search Island logic with correct DOM selectors

(function() {
    console.log("AI Search Injector: Initializing...");

    const WORKER_URL = '/search'; // Or '/api/search' depending on your Cloudflare folder structure
    let searchTimeout = null;

    // Wait for DOM to be fully ready
    document.addEventListener('DOMContentLoaded', () => {
        const islandInput = document.getElementById('island-input');
        const islandBox = document.querySelector('.island-search-box');
        const triggerBtn = document.getElementById('island-trigger');

        if (!islandInput || !islandBox) {
            console.error("AI Search: Critical elements not found in DOM.");
            return;
        }

        console.log("AI Search: Attached to island input.");

        // 1. INPUT EVENT (Debounced Typing)
        islandInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            handleSearchInput(query, islandBox, false);
        });

        // 2. KEYDOWN EVENT (Enter Key)
        islandInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                handleSearchInput(query, islandBox, true);
                e.preventDefault(); // Stop form submit or other defaults
            }
        });

        // 3. TRIGGER BUTTON CLICK
        if (triggerBtn) {
            triggerBtn.addEventListener('click', () => {
                const query = islandInput.value.trim();
                handleSearchInput(query, islandBox, true);
            });
        }
    });

    function handleSearchInput(query, islandBox, isCycleMode) {
        // CLEANUP: If empty, reset styling
        if (query.length === 0) {
            clearTimeout(searchTimeout);
            if (islandBox) islandBox.style.borderColor = '';
            resetCardStyles();
            return;
        }

        // LOGIC: Immediate vs Debounce
        if (isCycleMode) {
            clearTimeout(searchTimeout);
            runAiQuery(query, islandBox);
        } else {
            // Visual feedback: "Waiting for typing to finish"
            if (islandBox) islandBox.style.borderColor = 'rgba(0, 255, 187, 0.3)';
            
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                runAiQuery(query, islandBox);
            }, 800); // 800ms wait
        }
    }

    async function runAiQuery(query, islandBox) {
        if (islandBox) islandBox.style.borderColor = '#00ffbb'; // Green = Thinking

        try {
            // 1. Fast Path: Number directly (1-114)
            if (!isNaN(query) && query > 0 && query <= 114) {
                highlightChapter(parseInt(query));
                if (islandBox) islandBox.style.borderColor = '';
                return;
            }

            // 2. AI Path: Ask Cloudflare
            // Note: Ensure your search.js is deployed to /functions/search.js or mapped correctly
            const response = await fetch(WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query })
            });

            if (!response.ok) throw new Error("AI Endpoint Error");

            const data = await response.json();
            
            // Clean the AI response (it might send "Chapter 2" string, we just want 2)
            // The search.js returns { chapter: "2" }
            const chapterNum = parseInt(data.chapter);

            // 3. Handle Result
            if (chapterNum && !isNaN(chapterNum)) {
                highlightChapter(chapterNum);
                if (islandBox) islandBox.classList.remove('island-error');
            } else {
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
        // Reset previous highlights first
        resetCardStyles();

        // Note: app.js generates cards without 'data-chapter' attributes in your code.
        // We need to rely on the text content or add logic to app.js. 
        // HOWEVER, assuming app.js is updated OR we search by text content:
        
        // Strategy: Find the card by the number visible inside it
        const cards = Array.from(document.querySelectorAll('.surah-card'));
        const targetCard = cards.find(card => {
            const numDiv = card.querySelector('.card-bg-num');
            return numDiv && numDiv.textContent.trim() == chapterNum;
        });

        if (targetCard) {
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Animation
            targetCard.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            targetCard.style.transform = 'scale(1.05)';
            targetCard.style.filter = 'brightness(1.3)';
            targetCard.style.boxShadow = '0 0 20px rgba(0, 255, 187, 0.4)';
            
            // Remove highlight after 2 seconds
            setTimeout(() => {
                targetCard.style.transform = 'scale(1)';
                targetCard.style.filter = 'none';
                targetCard.style.boxShadow = 'none';
            }, 2000);
        } else {
            console.warn("Card for chapter " + chapterNum + " not found in DOM");
        }
    }

    function resetCardStyles() {
        document.querySelectorAll('.surah-card').forEach(c => {
            c.style.transform = 'scale(1)';
            c.style.filter = 'none';
            c.style.boxShadow = 'none';
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