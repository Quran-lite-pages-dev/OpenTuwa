(function() {
    // --- Configuration ---
    const API_ENDPOINT = '/transcribe'; // The Cloudflare Pages Function endpoint
    
    // --- Global Elements ---
    const voiceBtn = document.getElementById('voice-search-btn');
    const listeningOverlay = document.getElementById('listening-overlay');
    
    if (!voiceBtn || !listeningOverlay) {
        console.error("Voice search elements not found. Check index.html for IDs: voice-search-btn, listening-overlay");
        return;
    }
    
    const listeningText = listeningOverlay.querySelector('.listening-text');
    const listeningSub = listeningOverlay.querySelector('.listening-sub');
    
    // --- State Variables ---
    let mediaRecorder = null;
    let audioChunks = [];
    let isRecording = false; // Tracks if recording is currently active/intended
    let streamReference = null; // Stores the active microphone stream
    let timeoutId = null; // Stores the ID for the auto-stop timer

    // --- Utility Functions for UI/State Management ---

    function updateListeningUI(text, sub, isActive = true) {
        listeningText.textContent = text;
        listeningSub.textContent = sub;
        if (isActive) {
            listeningOverlay.classList.add('active');
        } else {
            listeningOverlay.classList.remove('active');
        }
    }

    function clearAutoStopTimeout() {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    }

    // --- Event Listeners ---
    voiceBtn.addEventListener('click', handleVoiceSearch);
    voiceBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); // Prevent space from scrolling
            handleVoiceSearch();
        }
    });

    // Handle cancellation by clicking the overlay
    listeningOverlay.addEventListener('click', stopRecordingAndCancel);

    // --- Core Voice Search Flow ---

    async function handleVoiceSearch() {
        // If already recording, assume the click means "I'm done speaking"
        if (isRecording) {
            console.log("Recording is in progress. Stopping and submitting.");
            stopRecordingAndSubmit();
            return;
        }

        // Basic Browser Check
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Error: Voice search is not supported on this device/browser (HTTPS required).");
            return;
        }
        
        voiceBtn.disabled = true;

        try {
            // DIRECTLY start recording. This ensures the stream opens and stays open.
            await startRecording();

        } catch (err) {
            console.error("FATAL MIC/PERMISSION ERROR:", err);
            updateListeningUI("Error", err.message || "Could not access microphone.", false);
            
            // Clean up if we failed halfway
            isRecording = false; 
            if (streamReference) {
                streamReference.getTracks().forEach(t => t.stop());
                streamReference = null;
            }

            setTimeout(() => listeningOverlay.classList.remove('active'), 2000);
        } finally {
            voiceBtn.disabled = false;
        }
    }

    async function startRecording() {
        updateListeningUI("Listening...", "Speak now...");

        // 1. Get the Stream (Triggers prompt if not already granted)
        streamReference = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // 2. Determine Supported MIME Type (Safeguard for Windows/Safari)
        let mimeType = 'audio/webm; codecs=opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
            console.warn(`${mimeType} not supported, falling back to default.`);
            mimeType = ''; // Let browser choose default
        }

        const options = mimeType ? { mimeType } : {};
        mediaRecorder = new MediaRecorder(streamReference, options);
        audioChunks = [];

        // --- Recorder Event Handlers ---
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = async () => {
            // Safely stop all tracks to release the microphone immediately
            if (streamReference) {
                streamReference.getTracks().forEach(track => track.stop());
                streamReference = null;
            }
            clearAutoStopTimeout();

            // Only proceed if the recording was intended to be submitted (not cancelled)
            if (audioChunks.length > 0 && isRecording) {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' }); 
                await processAudio(audioBlob);
            } else {
                console.log("Recording stopped without data or was cancelled.");
                listeningOverlay.classList.remove('active');
            }
            isRecording = false; // Reset state
        };

        // 3. Start Recording
        mediaRecorder.start();
        isRecording = true;
        console.log("MediaRecorder started", mediaRecorder.state);

        // 4. Set Safety Timeout (Stop after 5 seconds of silence/recording)
        timeoutId = setTimeout(() => {
            if (isRecording && mediaRecorder.state === 'recording') {
                console.log("Auto-stopping recording due to timeout.");
                stopRecordingAndSubmit();
            }
        }, 5000);
    }

    function stopRecordingAndSubmit() {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            // We do NOT set isRecording = false here. 
            // We want existing 'true' state to trigger processing in onstop.
            mediaRecorder.stop();
        }
    }

    function stopRecordingAndCancel() {
        isRecording = false; // Explicitly flag to ignore data
        clearAutoStopTimeout();
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
        if (streamReference) {
            streamReference.getTracks().forEach(t => t.stop());
            streamReference = null;
        }
        updateListeningUI("Cancelled", "", false);
    }

    // --- Backend Processing ---

    async function processAudio(blob) {
        updateListeningUI("Thinking...", "Analyzing with Cloudflare AI...");
        const formData = new FormData();
        formData.append('file', blob, 'voice.webm');

        try {
            const response = await fetch(API_ENDPOINT, { method: 'POST', body: formData });
            
            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({}));
                 throw new Error(errorData.error || "Transcription failed");
            }

            const data = await response.json();
            // Adjust this based on your exact API response structure (e.g., data.result.text)
            const cleanText = data.text || (data.result && data.result.text) || ""; 
            
            if (!cleanText) throw new Error("No text detected.");

            // --- Success Logic ---
            // Ensure global search variables exist (from index.js)
            if (typeof window.searchString === 'undefined' || typeof window.performAISearch === 'undefined') {
                console.error("Integration Error: Globals 'searchString' or 'performAISearch' not found in window scope.");
                updateListeningUI("Error", "Integration failure: Missing core script variables.", false);
                return;
            }

            // 1. Update the Global Variable
            window.searchString = cleanText;

            // 2. Update the Display Element
            const display = document.getElementById('search-input-display');
            if (display) display.textContent = cleanText;

            // 3. Close Overlay
            listeningOverlay.classList.remove('active');

            // 4. Trigger the AI Search function from index.js
            if (typeof performAISearch === 'function') {
                // Show loading state in the results grid for immediate feedback
                const grid = document.getElementById('search-results-grid');
                if(grid) {
                    grid.innerHTML = `
                    <div class="loader-content" style="padding-top:2rem; text-align:center;">
                        <div class="loader-spinner" style="width:30px;height:30px;border-width:2px; margin: 0 auto;"></div>
                        <div style="color:#666; font-size:1.2rem; margin-top: 10px;">Searching for "${cleanText}"...</div>
                    </div>`;
                }
                
                performAISearch();
            }

        } catch (err) {
            console.error("Transcription Error:", err);
            updateListeningUI("Error", "Could not understand audio. Try again.", false);
            setTimeout(() => listeningOverlay.classList.remove('active'), 2000);
        }
    }

})();
