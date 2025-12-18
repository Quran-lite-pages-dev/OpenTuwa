/**
 * AI-Audio.js
 * Integrated with Puter.js for OpenAI TTS
 */

(function() {
    console.log("Initializing AI Audio Module...");

    // 1. Wait for index.js to load the config
    // We use a small timeout to ensure index.js has finished execution
    setTimeout(() => {
        if (typeof window.TRANSLATIONS_CONFIG !== 'undefined') {
            
            // Add your new AI languages here
            Object.assign(window.TRANSLATIONS_CONFIG, {
                'fr-ai': { 
                    name: 'French (AI Voice - Alloy)', 
                    url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/a/fr.hamidullah.xml', 
                    type: 'ai',   
                    voice: 'alloy' 
                },
                'de-ai': { 
                    name: 'German (AI Voice - Onyx)', 
                    url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/a/de.aburida.xml', 
                    type: 'ai',
                    voice: 'onyx'
                },
                'ru-ai': { 
                    name: 'Russian (AI Voice - Fable)', 
                    url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/a/ru.kuliev.xml', 
                    type: 'ai',
                    voice: 'fable'
                },
                'tr-ai': { 
                    name: 'Turkish (AI Voice - Nova)', 
                    url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/a/tr.yuksel.xml', 
                    type: 'ai',
                    voice: 'nova'
                }
            });
            console.log("AI Languages added to config.");

        } else {
            console.error("ERROR: TRANSLATIONS_CONFIG not found. Please add 'window.TRANSLATIONS_CONFIG = TRANSLATIONS_CONFIG;' to the end of your index.js file.");
        }
    }, 500); // 500ms delay to be safe


    // 2. INTERCEPT PLAYBACK
    const originalUpdateTranslationAudio = window.updateTranslationAudio;

    window.updateTranslationAudio = async function(chNum, vNum, autoplay) {
        
        // Safety check if elements exist
        if (!elements || !elements.selects || !elements.selects.trans) {
            if (originalUpdateTranslationAudio) originalUpdateTranslationAudio(chNum, vNum, autoplay);
            return;
        }

        const currentTransId = elements.selects.trans.value;
        // Use window.TRANSLATIONS_CONFIG to be safe
        const config = window.TRANSLATIONS_CONFIG ? window.TRANSLATIONS_CONFIG[currentTransId] : null;

        // --- CHECK: IS THIS AN AI LANGUAGE? ---
        if (config && config.type === 'ai') {
            console.log(`[AI-Audio] Intercepting playback for ${config.name}`);

            try {
                if (typeof toggleBuffering === 'function') toggleBuffering(true);

                const textEl = document.getElementById('translation-text');
                const textToRead = textEl ? textEl.innerText : "";

                if (!textToRead || textToRead.includes("Select a Surah")) {
                    console.warn("[AI-Audio] No text available.");
                    if (typeof toggleBuffering === 'function') toggleBuffering(false);
                    return;
                }

                // Call Puter.js (OpenAI)
                const audioObj = await puter.ai.txt2speech(textToRead, {
                    provider: "openai",
                    model: "tts-1",
                    voice: config.voice || "alloy"
                });

                // Play the result
                if (elements.transAudio) {
                    elements.transAudio.src = audioObj.src;
                    if (autoplay) {
                        elements.transAudio.play().catch(e => console.log("Autoplay blocked:", e));
                    }
                }

            } catch (err) {
                console.error("[AI-Audio] Error:", err);
                
                // HANDLE 401 UNAUTHORIZED SPECIFICALLY
                if (err.toString().includes("401")) {
                    alert("Puter.js Authentication Required.\n\nSince this uses the 'User-Pays' model, you (the user) must be signed into Puter.com to generate AI audio.\n\nPlease sign in at Puter.com and refresh.");
                }

            } finally {
                if (typeof toggleBuffering === 'function') toggleBuffering(false);
            }

        } else {
            // --- ORIGINAL MP3 BEHAVIOR (English, Spanish, etc.) ---
            if (originalUpdateTranslationAudio) {
                originalUpdateTranslationAudio(chNum, vNum, autoplay);
            }
        }
    };

})();
