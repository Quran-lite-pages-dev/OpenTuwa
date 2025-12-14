(function() {
    // --- Configuration ---
    const API_ENDPOINT = '/api/transcribe';
    
    // --- Elements ---
    const voiceBtn = document.getElementById('voice-search-btn');
    const listeningOverlay = document.getElementById('listening-overlay');
    const listeningText = listeningOverlay.querySelector('.listening-text');
    const listeningSub = listeningOverlay.querySelector('.listening-sub');
    
    // --- State ---
    let mediaRecorder = null;
    let audioChunks = [];
    let isRecording = false;

    // --- Event Listeners ---
    voiceBtn.addEventListener('click', startVoiceSearch);
    voiceBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') startVoiceSearch();
    });

    // Close overlay if clicked (cancel)
    listeningOverlay.addEventListener('click', stopRecordingAndCancel);

    async function startVoiceSearch() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Voice search is not supported on this browser.");
            return;
        }

        try {
            // 1. UI Updates
            listeningOverlay.classList.add('active');
            listeningText.textContent = "Listening...";
            listeningSub.textContent = "Say something like 'Surah Yusuf'...";
            
            // 2. Start Microphone
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                // Stop all tracks to release mic
                stream.getTracks().forEach(track => track.stop());

                // If chunks exist, process them
                if (audioChunks.length > 0 && isRecording) {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    await processAudio(audioBlob);
                }
            };

            mediaRecorder.start();
            isRecording = true;

            // 3. Auto-stop after 4 seconds (TV Style typical duration)
            setTimeout(() => {
                if (isRecording) stopRecordingAndSubmit();
            }, 4000);

        } catch (err) {
            console.error("Mic Error:", err);
            listeningOverlay.classList.remove('active');
            alert("Could not access microphone.");
        }
    }

    function stopRecordingAndSubmit() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
    }

    function stopRecordingAndCancel() {
        isRecording = false;
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        listeningOverlay.classList.remove('active');
    }

    async function processAudio(blob) {
        // Update UI to "Processing"
        listeningText.textContent = "Thinking...";
        listeningSub.textContent = "Analyzing with AI...";

        const formData = new FormData();
        formData.append('file', blob, 'voice.webm');

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error("AI Processing Failed");

            const data = await response.json();
            const transcript = data.text;

            if (transcript) {
                applySearch(transcript);
            } else {
                throw new Error("No speech detected");
            }

        } catch (error) {
            console.error(error);
            listeningText.textContent = "Try Again";
            setTimeout(() => listeningOverlay.classList.remove('active'), 1000);
        }
    }

    function applySearch(text) {
        // Clean text (remove trailing periods, etc)
        const cleanText = text.replace(/[.,!?;:]/g, '').trim();

        // --- BRIDGE TO INDEX.JS ---
        // We directly update the variables used in index.js
        // NOTE: This assumes 'searchString' and 'performAISearch' are in the global scope 
        // (which they are in your provided index.js).

        if (typeof searchString !== 'undefined') {
            // 1. Update the Global Variable
            // We use 'window.searchString' if declared with var, or direct assignment if let/const in global
            try {
                // If searchString is 'let' in index.js top level, direct assignment works
                searchString = cleanText; 
            } catch (e) {
                // Fallback if scope is restricted
                console.warn("Could not set searchString directly");
            }

            // 2. Update the Display
            const display = document.getElementById('search-input-display');
            if (display) display.textContent = cleanText;

            // 3. Close Overlay
            listeningOverlay.classList.remove('active');

            // 4. Trigger the AI Search function from index.js
            if (typeof performAISearch === 'function') {
                // Show loading state in grid manually to ensure UI feedback
                const grid = document.getElementById('search-results-grid');
                if(grid) {
                    grid.innerHTML = `
                    <div class="loader-content" style="padding-top:2rem">
                        <div class="loader-spinner" style="width:30px;height:30px;border-width:2px;"></div>
                        <div style="color:#666; font-size:1.2rem">Searching for "${cleanText}"...</div>
                    </div>`;
                }
                
                performAISearch();
            }
        }
    }

})();
