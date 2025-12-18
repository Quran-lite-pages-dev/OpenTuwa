/**
 * AI-Audio.js
 * Adds Text-to-Speech capabilities to the Quran Player using ElevenLabs API.
 * Intercepts existing audio logic to support all languages defined in TRANSLATIONS_CONFIG.
 */

(function() {
    // --- CONFIGURATION ---
    // 1. PASTE YOUR ELEVENLABS API KEY HERE
    const ELEVEN_LABS_API_KEY = 'YOUR_ELEVENLABS_API_KEY_HERE'; 
    
    // 2. Voice Settings (Using 'Turbo' model for low latency/cost)
    const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // "Rachel" - Clear & Neutral
    const MODEL_ID = 'eleven_multilingual_v2'; // Supports vast array of languages
    
    // 3. Native MP3 Languages (These will NOT use AI, preserving original hosting)
    // Matches the keys in TRANSLATIONS_CONFIG (en, id, es)
    const NATIVE_AUDIO_LANGS = ['en', 'id', 'es'];

    // --- INITIALIZATION ---
    // Wait for index.js to load its config and elements
    const initInterval = setInterval(() => {
        if (window.TRANSLATIONS_CONFIG && window.elements && window.quranData) {
            clearInterval(initInterval);
            console.log("AI Audio Bridge: Hooking into Quran Player...");
            setupAIAudio();
        }
    }, 200);

    function setupAIAudio() {
        const audioSelect = document.getElementById('translationAudioSelect');
        
        // 1. RE-POPULATE THE AUDIO SELECTOR
        // We overwrite the default list to include ALL languages from the XML config
        if (audioSelect) {
            const currentVal = audioSelect.value; // preserve selection if any
            audioSelect.innerHTML = ''; // Clear existing
            
            // Add "Off" or default option if needed, currently mimicking typical behavior
            const noneOpt = document.createElement('option');
            noneOpt.value = 'none';
            noneOpt.textContent = 'None (Off)';
            audioSelect.appendChild(noneOpt);

            Object.keys(TRANSLATIONS_CONFIG).forEach(key => {
                const config = TRANSLATIONS_CONFIG[key];
                const opt = document.createElement('option');
                opt.value = key;
                
                // Visual indicator for AI vs Native
                const typeLabel = NATIVE_AUDIO_LANGS.includes(key) ? '[MP3]' : '[AI]';
                opt.textContent = `${config.name} ${typeLabel}`;
                
                audioSelect.appendChild(opt);
            });

            // Restore selection or default to English if available
            if(currentVal && TRANSLATIONS_CONFIG[currentVal]) {
                audioSelect.value = currentVal;
            } else {
                audioSelect.value = 'en'; 
            }
        }

        // 2. INTERCEPT THE AUDIO UPDATE FUNCTION
        // We save the old function to call it when we need Native MP3s
        const originalUpdateTranslationAudio = window.updateTranslationAudio || function(){};

        window.updateTranslationAudio = async function(chapterNum, verseNum, autoplay) {
            const audioLang = audioSelect ? audioSelect.value : 'en';

            // A. Handle "None"
            if (audioLang === 'none') {
                elements.transAudio.src = '';
                return;
            }

            // B. Handle Native MP3s (English, Indo, Spanish)
            if (NATIVE_AUDIO_LANGS.includes(audioLang)) {
                console.log(`AI Bridge: Delegating ${audioLang} to native player.`);
                // We must ensure the select value matches what the original logic expects
                // The original logic likely reads elements.selects.translationAudioSelect or similar
                // We just call the original function.
                return originalUpdateTranslationAudio(chapterNum, verseNum, autoplay);
            }

            // C. Handle AI Generation (Everything else)
            console.log(`AI Bridge: Generating AI Audio for ${audioLang} (Ch:${chapterNum}, V:${verseNum})`);
            
            // 1. Ensure Text Data is Loaded
            if (!translationCache[audioLang]) {
                console.log("AI Bridge: Loading XML for speech generation...");
                await loadTranslationData(audioLang);
            }

            // 2. Extract Text from XML
            // Assuming standard Tanzil/Quran XML format structure
            const doc = translationCache[audioLang];
            let textToSpeak = "";

            try {
                // Try finding by Chapter/Verse attributes
                // Selector strategy: Look for Sura ID -> Verse ID
                // Common XML format: <sura index="1"><aya index="1" text="..."/></sura>
                const suras = doc.querySelectorAll('sura');
                const sura = suras[chapterNum - 1]; // 0-indexed
                if (sura) {
                    const ayas = sura.querySelectorAll('aya');
                    const aya = ayas[verseNum - 1];
                    textToSpeak = aya ? aya.getAttribute('text') : "";
                }
                
                // Fallback for different XML structures (Verse tag style)
                if (!textToSpeak) {
                    const verseNode = doc.querySelector(`Verse[Chapter="${chapterNum}"][Verse="${verseNum}"]`);
                    if (verseNode) textToSpeak = verseNode.textContent || verseNode.getAttribute('Text');
                }

            } catch (e) {
                console.error("AI Bridge: Error parsing XML text", e);
            }

            if (!textToSpeak) {
                console.warn("AI Bridge: No text found to speak.");
                return;
            }

            // 3. Call ElevenLabs API
            try {
                // Construct URL for streaming to avoid waiting for full download
                const streamUrl = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream?optimize_streaming_latency=3`;
                
                const response = await fetch(streamUrl, {
                    method: 'POST',
                    headers: {
                        'xi-api-key': ELEVEN_LABS_API_KEY,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: textToSpeak,
                        model_id: MODEL_ID,
                        voice_settings: {
                            stability: 0.5,
                            similarity_boost: 0.75
                        }
                    })
                });

                if (!response.ok) {
                    throw new Error(`ElevenLabs API Error: ${response.statusText}`);
                }

                // 4. Play the Audio Blob
                const blob = await response.blob();
                const audioUrl = URL.createObjectURL(blob);
                
                elements.transAudio.src = audioUrl;
                
                // Clean up Blob URL when audio changes to prevent memory leaks
                elements.transAudio.onended = () => URL.revokeObjectURL(audioUrl);
                
                if (autoplay) {
                    elements.transAudio.play().catch(e => console.log("AI Autoplay blocked:", e));
                }

            } catch (err) {
                console.error("AI Bridge: TTS Failed", err);
                // Optional: UI feedback that quota might be exceeded
            }
        };

        // Trigger an update to refresh the list logic immediately
        console.log("AI Audio Bridge: Ready.");
    }

})();
