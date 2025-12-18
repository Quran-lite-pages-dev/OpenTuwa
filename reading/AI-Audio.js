/**
 * AI-Audio.js
 * Intercepts translation playback to use ElevenLabs API
 * Model: eleven_flash_v2_5 (Best for speed & free tier efficiency)
 */

(function() {
    console.log("Initializing ElevenLabs AI Audio...");

    // ==========================================
    // ⚠️ CONFIGURATION: ENTER YOUR KEY HERE
    // ==========================================
    const ELEVEN_API_KEY = "sk_47a79d8bf4952b5f54553a1b0171d1c5389a354f16a421bf"; 
    
    // Voice IDs (Standard ElevenLabs IDs)
    // You can swap these ID strings with others from the Voice Lab
    const VOICES = {
        french: "21m00Tcm4TlvDq8ikWAM",  // Rachel 
        german: "D38z5RcWu1voky8WS1ja",  // Fin 
        russian: "JBFqnCBsd6RMkjVDRZzb", // George 
        turkish: "FGY2WhTYpPnrIDTdsKH5", // Laura 
        default: "21m00Tcm4TlvDq8ikWAM"
    };

    // 1. Wait for index.js to load, then inject new languages
    setTimeout(() => {
        if (typeof window.TRANSLATIONS_CONFIG !== 'undefined') {
            
            // Add your new AI languages to the global config
            Object.assign(window.TRANSLATIONS_CONFIG, {
                'fr-ai': { 
                    name: 'French (AI - Flash)', 
                    url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/a/fr.hamidullah.xml', 
                    type: 'ai',   
                    voiceId: VOICES.french
                },
                'de-ai': { 
                    name: 'German (AI - Flash)', 
                    url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/a/de.aburida.xml', 
                    type: 'ai',
                    voiceId: VOICES.german
                },
                'ru-ai': { 
                    name: 'Russian (AI - Flash)', 
                    url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/a/ru.kuliev.xml', 
                    type: 'ai',
                    voiceId: VOICES.russian
                },
                'tr-ai': { 
                    name: 'Turkish (AI - Flash)', 
                    url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/a/tr.yuksel.xml', 
                    type: 'ai',
                    voiceId: VOICES.turkish
                }
            });
            console.log("ElevenLabs Languages added to config.");

        } else {
            console.error("ERROR: TRANSLATIONS_CONFIG not found. Add 'window.TRANSLATIONS_CONFIG = TRANSLATIONS_CONFIG;' to index.js");
        }
    }, 500);


    // 2. INTERCEPT PLAYBACK LOGIC
    const originalUpdateTranslationAudio = window.updateTranslationAudio;

    window.updateTranslationAudio = async function(chNum, vNum, autoplay) {
        
        // Safety checks
        if (!elements || !elements.selects || !elements.selects.trans) {
            if (originalUpdateTranslationAudio) originalUpdateTranslationAudio(chNum, vNum, autoplay);
            return;
        }

        const currentTransId = elements.selects.trans.value;
        const config = window.TRANSLATIONS_CONFIG ? window.TRANSLATIONS_CONFIG[currentTransId] : null;

        // --- CHECK: IS THIS AN AI LANGUAGE? ---
        if (config && config.type === 'ai') {
            
            console.log(`[ElevenLabs] Intercepting for: ${config.name}`);

            try {
                // Show buffering UI
                if (typeof toggleBuffering === 'function') toggleBuffering(true);

                // Get text
                const textEl = document.getElementById('translation-text');
                const textToRead = textEl ? textEl.innerText : "";

                if (!textToRead || textToRead.length < 2 || textToRead.includes("Select a Surah")) {
                    console.warn("[ElevenLabs] Text too short or invalid.");
                    if (typeof toggleBuffering === 'function') toggleBuffering(false);
                    return;
                }

                // --- CALL ELEVENLABS API ---
                const voiceId = config.voiceId || VOICES.default;
                const modelId = "eleven_flash_v2_5"; // Fastest & most credit-efficient

                const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'audio/mpeg',
                        'Content-Type': 'application/json',
                        'xi-api-key': ELEVEN_API_KEY
                    },
                    body: JSON.stringify({
                        text: textToRead,
                        model_id: modelId,
                        voice_settings: {
                            stability: 0.5,
                            similarity_boost: 0.5
                        }
                    })
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.detail?.message || "API Error");
                }

                // Convert response blob to audio URL
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);

                // Play it using existing player
                if (elements.transAudio) {
                    elements.transAudio.src = audioUrl;
                    if (autoplay) {
                        elements.transAudio.play().catch(e => console.log("Autoplay blocked:", e));
                    }
                }

            } catch (err) {
                console.error("[ElevenLabs] Error:", err);
                alert("ElevenLabs Error: " + err.message + "\n\nCheck your API Key and Credit Balance.");
            } finally {
                if (typeof toggleBuffering === 'function') toggleBuffering(false);
            }

        } else {
            // --- ORIGINAL MP3 BEHAVIOR (Old JS) ---
            if (originalUpdateTranslationAudio) {
                originalUpdateTranslationAudio(chNum, vNum, autoplay);
            }
        }
    };
})();
