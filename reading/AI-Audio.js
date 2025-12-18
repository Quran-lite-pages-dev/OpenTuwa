/**
 * AI-Audio.js
 * Intercepts translation playback to support AI Voices (OpenAI via Puter.js)
 * while keeping existing MP3 playback 100% untouched.
 */

(function() {
    console.log("Initializing AI Audio Module...");

    // 1. SAFE CONFIG EXTENSION
    // We add new languages to your existing TRANSLATIONS_CONFIG.
    // We assume standard XML paths exist for these.
    if (typeof TRANSLATIONS_CONFIG !== 'undefined') {
        Object.assign(TRANSLATIONS_CONFIG, {
            'fr-ai': { 
                name: 'French (AI Voice - Alloy)', 
                url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/a/fr.hamidullah.xml', 
                type: 'ai',   // New flag to identify AI languages
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
    } else {
        console.error("TRANSLATIONS_CONFIG not found. Make sure AI-Audio.js is loaded AFTER index.js");
    }

    // 2. INTERCEPT THE AUDIO FUNCTION
    // We save the old function so we can call it for your original languages.
    const originalUpdateTranslationAudio = window.updateTranslationAudio;

    // We replace the global function with our "Smart" function
    window.updateTranslationAudio = async function(chNum, vNum, autoplay) {
        
        // Get the current language ID selected by the user
        const currentTransId = elements.selects.trans.value;
        const config = TRANSLATIONS_CONFIG[currentTransId];

        // --- CHECK: IS THIS AN AI LANGUAGE? ---
        if (config && config.type === 'ai') {
            console.log(`[AI-Audio] Intercepting playback for ${config.name}`);

            try {
                // A. Show Buffering (using your existing UI function)
                if (typeof toggleBuffering === 'function') toggleBuffering(true);

                // B. Get the Text
                // The text is already loaded in the DOM by your existing updateTranslationText()
                const textEl = document.getElementById('translation-text');
                const textToRead = textEl ? textEl.innerText : "";

                if (!textToRead || textToRead.includes("Select a Surah")) {
                    console.warn("[AI-Audio] No text available to read.");
                    if (typeof toggleBuffering === 'function') toggleBuffering(false);
                    return;
                }

                // C. Generate Audio with Puter.js (OpenAI)
                // This creates an Audio object with the speech
                const audioObj = await puter.ai.txt2speech(textToRead, {
                    provider: "openai",
                    model: "tts-1",    // 'tts-1' is faster, 'tts-1-hd' is higher quality
                    voice: config.voice || "alloy"
                });

                // D. Inject into your existing player
                // We hijack the existing <audio id="translation-audio-player"> 
                // so that your existing UI controls (pause/play) still work.
                if (elements.transAudio) {
                    // Set the source to the Blob URL created by Puter
                    elements.transAudio.src = audioObj.src;
                    
                    // E. Play
                    if (autoplay) {
                        const playPromise = elements.transAudio.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(error => {
                                console.log("[AI-Audio] Autoplay blocked by browser:", error);
                            });
                        }
                    }
                }

            } catch (err) {
                console.error("[AI-Audio] Speech generation failed:", err);
                // Optional: Fallback to silent error or alert user
            } finally {
                // Hide Buffering
                if (typeof toggleBuffering === 'function') toggleBuffering(false);
            }

        } else {
            // --- ORIGINAL BEHAVIOR ---
            // If it's English, Spanish, or Indonesian (not type: 'ai'), 
            // we do EXACTLY what the old code did.
            if (originalUpdateTranslationAudio) {
                originalUpdateTranslationAudio(chNum, vNum, autoplay);
            }
        }
    };

    console.log("AI Audio Interceptor is active.");
})();
