/**
 * TUWA - The Sacred Valley
 * Copyright (c) 2024-2026 Haykal M. Zaidi (d/b/a Tuwa Media).
 * * PROPRIETARY IDENTITY:
 * The name "Tuwa" and "Sacred Valley" are trademarks of Tuwa Media.
 * This code is licensed under MIT + Trademark Lock.
 */

// Purpose: Handles AI Search, Audio/Visual Sync, and Dynamic "See More" Button


(function() {
    console.log("");

    const WORKER_URL = '/search'; 
    const SFX_BUBBLES = '';
    const SFX_SUCCESS = '';

    // --- DYNAMIC STYLES FOR BUTTON EXPANSION ---
    // We inject this to handle the "See more results" text layout
    // --- DYNAMIC STYLES FOR BUTTON EXPANSION ---
    const style = document.createElement('style');
    style.innerHTML = `
        ._b0 {
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Bouncy expansion */
            overflow: hidden;
            white-space: nowrap;
        }
        
        /* The button expands independently now */
        ._b0.expanded-btn {
            width: auto !important;
            padding: 0 20px !important; /* More padding for text */
            border-radius: 50px !important; /* Pill shape */
            background: rgba(255, 255, 255, 0.1) !important;
            border-color: rgba(255, 255, 255, 0.3) !important;
        }

        ._b0.expanded-btn ._et {
            font-size: 1.3rem;
            font-weight: 500;
            color: #fff;
        }

        /* REMOVED: ._ak.has-results { width: auto ... }
           Reason: The box no longer needs to grow to fit the button. 
           The wrapper (flex) will automatically adjust the centering 
           as the button grows next to it.
        */
    `;
    document.head.appendChild(style);
    // --- STATE ---
    let searchTimeout = null;
    let cachedQuery = "";      
    let cachedResults = [];    
    let resultIndex = 0;
    
    // --- AUDIO ---
    let bubbleAudio = new Audio(SFX_BUBBLES);
    let successAudio = new Audio(SFX_SUCCESS);
    let aiFinishedLoading = false;
    let audioResolve = null;

    bubbleAudio.preload = 'auto';
    successAudio.preload = 'auto';
    bubbleAudio.loop = false;

    // --- ICONS ---
    const ICON_ARROW = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right-short" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"/></svg>`;
    const TEXT_SEE_MORE = `See more results`;

    document.addEventListener('DOMContentLoaded', () => {
        // 1. HIDE ON READING MODE
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('stream')) {
            const islandWrapper = document.getElementById('_j');
            if (islandWrapper) {
                islandWrapper.style.display = 'none'; 
                islandWrapper.innerHTML = '';         
            }
            return; 
        }

        const islandInput = document.getElementById('_cz');
        const islandBox = document.querySelector('._ak');
        const triggerBtn = document.getElementById('_bx');
        const triggerHint = triggerBtn ? triggerBtn.querySelector('._et') : null;

        if (!islandInput || !islandBox || !triggerBtn) return;

        // 2. INPUT HANDLER
        islandInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            // RESET BUTTON if input changes
            if (query !== cachedQuery) {
                resetButtonState(triggerBtn, triggerHint, islandBox);
                
                if (islandBox) islandBox.style.borderColor = 'rgba(209, 209, 214, 0.3)';
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    executeSearch(query, islandBox, triggerBtn, triggerHint);
                }, 800); 
            }
        });

        // 3. ENTER/CLICK HANDLERS
        islandInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleTrigger(islandInput.value.trim(), islandBox, triggerBtn, triggerHint);
            }
        });

        triggerBtn.addEventListener('click', () => {
            handleTrigger(islandInput.value.trim(), islandBox, triggerBtn, triggerHint);
        });
    });

    // --- BUTTON STATE HELPERS ---

    function setButtonToSeeMore(btn, hint, box) {
        if (!btn || !hint) return;
        hint.textContent = TEXT_SEE_MORE;
        btn.classList.add('expanded-btn');
        if (box) box.classList.add('has-results');
    }

    function resetButtonState(btn, hint, box) {
        if (!btn || !hint) return;
        // Only reset if it's currently changed (performance check)
        if (btn.classList.contains('expanded-btn')) {
            hint.innerHTML = ICON_ARROW;
            btn.classList.remove('expanded-btn');
            if (box) box.classList.remove('has-results');
        }
    }

    // --- AUDIO SYNC LOGIC ---

    function startProcess() {
        aiFinishedLoading = false;
        bubbleAudio.currentTime = 0;
        bubbleAudio.play().catch(() => {});

        bubbleAudio.onended = () => {
            if (aiFinishedLoading) {
                if (audioResolve) audioResolve();
            } else {
                bubbleAudio.currentTime = 0;
                bubbleAudio.play().catch(() => {});
            }
        };
    }

    function waitForBubbles() {
        return new Promise((resolve) => {
            if (bubbleAudio.paused) {
                resolve();
                return;
            }
            audioResolve = resolve;
            aiFinishedLoading = true;
        });
    }

    function playSuccess() {
        successAudio.currentTime = 0;
        successAudio.volume = 0.6; 
        successAudio.play().catch(() => {});
    }

    // --- MAIN SEARCH LOGIC ---

    function handleTrigger(query, islandBox, btn, hint) {
        if (!query) return;
        if (query === cachedQuery && cachedResults.length > 0) {
            cycleNextResult(islandBox);
        } else {
            clearTimeout(searchTimeout);
            executeSearch(query, islandBox, btn, hint);
        }
    }

    function cycleNextResult(islandBox) {
        resultIndex++;
        if (resultIndex >= cachedResults.length) resultIndex = 0; 
        
        // Flash Blue
        if(islandBox) {
            islandBox.style.borderColor = '#f5f5f7 '; 
            setTimeout(() => islandBox.style.borderColor = '', 300);
        }
        highlightChapter(cachedResults[resultIndex]);
    }

    async function executeSearch(query, islandBox, btn, hint) {
        if (!query) {
            stopVisuals(islandBox); 
            return;
        }

        // 1. START
        startVisuals(islandBox);
        startProcess(); 

        try {
            let results = [];

            // 2. FETCH
            if (!isNaN(query) && query > 0 && query <= 114) {
                await new Promise(r => setTimeout(r, 600)); 
                results = [parseInt(query)];
            } else {
                const response = await fetch(WORKER_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: query })
                });
                if (!response.ok) throw new Error("AI Error");
                const data = await response.json();
                results = data.chapters || [];
            }

            // 3. WAIT FOR AUDIO
            await waitForBubbles();

            // 4. SUCCESS UI
            if (results.length > 0) {
                cachedQuery = query;
                cachedResults = results;
                resultIndex = 0;
                
                playSuccess(); 
                highlightChapter(results[0]); 
                if (islandBox) islandBox.classList.remove('_cv');

                // CHANGE BUTTON IF MULTIPLE RESULTS
                if (results.length > 1) {
                    setButtonToSeeMore(btn, hint, islandBox);
                } else {
                    // If only 1 result, keep arrow (optional preference)
                    // or force arrow back if it was previously text
                    resetButtonState(btn, hint, islandBox);
                }

            } else {
                triggerErrorShake(islandBox);
            }

        } catch (err) {
            console.error("Search Error:", err);
            bubbleAudio.pause(); 
            triggerErrorShake(islandBox);
        } finally {
            stopVisuals(islandBox);
        }
    }

    // --- VISUAL HELPERS ---
    
    function startVisuals(box) {
        if (!box) return;
        box.style.borderColor = ''; 
        box.classList.add('_df');
    }

    function stopVisuals(box) {
        if (!box) return;
        box.classList.remove('_df');
        box.style.borderColor = ''; 
    }

    function highlightChapter(chapterNum) {
        document.querySelectorAll('._dw').forEach(c => {
            c.style.transform = 'scale(1)';
            c.style.filter = 'none';
            c.style.boxShadow = 'none';
            c.style.zIndex = 'auto';
        });

        const cards = Array.from(document.querySelectorAll('._dw'));
        const targetCard = cards.find(card => {
            const numDiv = card.querySelector('._c5');
            return numDiv && numDiv.textContent.trim() == chapterNum;
        });

        if (targetCard) {
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetCard.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            targetCard.style.transform = 'scale(1.1)';
            targetCard.style.filter = 'brightness(1.4)';
            targetCard.style.boxShadow = '0 0 25px rgba(209, 209, 214, 0.6)';
            targetCard.style.zIndex = '10'; 

            setTimeout(() => {
                targetCard.style.transform = 'scale(1)';
                targetCard.style.filter = 'none';
                targetCard.style.boxShadow = 'none';
                targetCard.style.zIndex = 'auto';
            }, 99500);
        }
    }

    function triggerErrorShake(element) {
        if (!element) return;
        stopVisuals(element);
        element.animate([
            { transform: 'translateX(0)' }, { transform: 'translateX(-5px)' },
            { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }
        ], { duration: 300 });
        element.style.borderColor = '#ff3333';
        setTimeout(() => element.style.borderColor = '', 1000);
    }

})();
