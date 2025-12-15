(function() {
    // --- Configuration ---
    const API_ENDPOINT = '/api/transcribe'; // The Cloudflare Pages Function endpoint
    
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
        if (isRecording) {
            console.log("Recording is already in progress. Stopping and submitting.");
            stopRecordingAndSubmit();
            return;
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Error: Voice search is not supported on this device/browser.");
            return;
        }
        
        // Disable the button to prevent multiple simultaneous clicks
        voiceBtn.disabled = true;

        try {
            // 1. Check and Request Permission (Triggers prompt reliably)
            await ensureMicrophonePermission();

            // 2. Start the Actual Recording Session
            await startRecording();

        } catch (err) {
            // This catches permission denials or fatal stream errors
            console.error("FATAL MIC/PERMISSION ERROR:", err);
            updateListeningUI("Error", err.message || "Could not access microphone.", false);
            setTimeout(() => listeningOverlay.classList.remove('active'), 2000);
            isRecording = false;
        } finally {
            voiceBtn.disabled = false; // Re-enable the button
        }
    }

    async function ensureMicrophonePermission() {
        updateListeningUI("Requesting Access...", "Please grant microphone permission to proceed.");

        try {
            // Request permission. This call is critical for triggering the browser prompt
            // and checking the pre-granted state for Android TV WebViews.
            const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Permission granted, immediately stop the temporary stream to release resources
            tempStream.getTracks().forEach(track => track.stop());
            console.log("Microphone access confirmed (or pre-granted by OS settings).");
            
            // The function returns implicitly, allowing the flow to continue to startRecording
            
        } catch (error) {
            // This happens on permission denial by the user or OS.
            console.error("Permission Denial:", error);
            throw new Error("Microphone access denied. Check your application settings.");
        }
    }

    async function startRecording() {
        // We re-request the stream, ensuring we get a clean one for the recorder
        streamReference = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(streamReference, { mimeType: 'audio/webm; codecs=opus' });
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
                // If cancelled or no data, just hide the overlay
                listeningOverlay.classList.remove('active');
            }
            isRecording = false; // Final state reset
        };
        
        // --- Start Recording ---
        mediaRecorder.start();
        isRecording = true;
        updateListeningUI("Listening...", "Speak the Surah name or topic now.");
        
        // 4.5 second Auto-stop (YouTube/Netflix TV style timeout)
        timeoutId = setTimeout(() => {
            if (isRecording) {
                console.log("4.5 second timeout reached. Stopping recording.");
                stopRecordingAndSubmit();
            }
        }, 4500); 
    }

    function stopRecordingAndSubmit() {
        clearAutoStopTimeout();
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            // isRecording remains true until mediaRecorder.onstop fires and processes data
            mediaRecorder.stop();
        } else if (isRecording) {
            // If the recorder is in pending state (e.g., starting), trigger manual stop
            // This is a safety net
            if (streamReference) streamReference.getTracks().forEach(track => track.stop());
            listeningOverlay.classList.remove('active');
            isRecording = false;
        }
    }

    function stopRecordingAndCancel() {
        clearAutoStopTimeout();
        if (isRecording) {
            console.log("Voice search cancelled by user.");
            isRecording = false; // Set to false so onstop does NOT process audioChunks
            
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop(); // Triggers onstop, which will see isRecording=false
            } else if (streamReference) {
                // If recorder hasn't started, manually stop the tracks
                streamReference.getTracks().forEach(track => track.stop());
                listeningOverlay.classList.remove('active');
            }
        } else {
            // If the overlay is active but we are not recording (e.g., during permission request), just hide it
            listeningOverlay.classList.remove('active');
        }
    }

    // --- Backend Processing ---

    async function processAudio(blob) {
        updateListeningUI("Thinking...", "Analyzing with Cloudflare AI (Whisper)...");

        const formData = new FormData();
        // Append the audio blob as 'file'
        formData.append('file', blob, 'voice.webm');

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Unknown AI server response" }));
                throw new Error(errorData.error || `Server Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const transcript = data.text;
            console.log("Whisper Transcript:", transcript);

            if (transcript && transcript.trim().length > 0) {
                applySearch(transcript);
            } else {
                throw new Error("No clear speech detected. Please try again.");
            }

        } catch (error) {
            console.error("AI Transcription Failed:", error);
            updateListeningUI("Error", error.message, true); // Keep overlay up briefly
            setTimeout(() => listeningOverlay.classList.remove('active'), 2500);
        }
    }

    // --- Bridge to index.js and Search Execution ---

    function applySearch(text) {
        // Clean text (remove trailing periods, common in Whisper output)
        const cleanText = text.replace(/[.,!?;:"]+/g, '').trim();

        // 1. Check for necessary globals from index.js
        if (typeof window.searchString === 'undefined' || typeof window.performAISearch === 'undefined') {
            console.error("Integration Error: Globals 'searchString' or 'performAISearch' not found in window scope.");
            updateListeningUI("Error", "Integration failure: Missing core script variables.", false);
            return;
        }

        // 2. Update the Global Variable (required by index.js logic)
        window.searchString = cleanText;

        // 3. Update the Display Element
        const display = document.getElementById('search-input-display');
        if (display) display.textContent = cleanText;

        // 4. Close Overlay
        listeningOverlay.classList.remove('active');

        // 5. Trigger the AI Search function from index.js
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
    }

})();
                                                    
