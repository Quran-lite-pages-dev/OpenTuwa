/**
 * AI-Audio.js
 * Integrated with Puter.js for OpenAI TTS
 * Handles User Authentication automatically.
 */

(function() {
    console.log("Initializing AI Audio Module...");

    // 1. Wait for index.js to load the config
    setTimeout(() => {
        if (typeof window.TRANSLATIONS_CONFIG !== 'undefined') {
            
            // Add your new AI languages
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
    }, 500); 


    // 2. INTERCEPT PLAYBACK
    const originalUpdateTranslationAudio = window.updateTranslationAudio;

    window.updateTranslationAudio = async function(chNum, vNum, autoplay) {
        
        if (!elements || !elements.selects || !elements.selects.trans) {
            if (originalUpdateTranslationAudio) originalUpdateTranslationAudio(chNum, vNum, autoplay);
            return;
        }

        const currentTransId = elements.selects.trans.value;
        const config = window.TRANSLATIONS_CONFIG ? window.TRANSLATIONS_CONFIG[currentTransId] : null;

        // --- CHECK: IS THIS AN AI LANGUAGE? ---
        if (config && config.type === 'ai') {
            console.log(`[AI-Audio] Intercepting playback for ${config.name}`);

            try {
                if (typeof toggleBuffering === 'function') toggleBuffering(true);

                const textEl = document.getElementById('translation-text');
                const textToRead = textEl ? textEl.innerText : "";

                if (!textToRead || textToRead.includes("Select a Surah")) {
                    if (typeof toggleBuffering === 'function') toggleBuffering(false);
                    return;
                }

                // --- ATTEMPT 1: TRY TO GENERATE AUDIO ---
                // If user is logged in, this works immediately.
                // If not, it throws an error (often 401).
                const audioObj = await puter.ai.txt2speech(textToRead, {
                    provider: "openai",
                    model: "tts-1",
                    voice: config.voice || "alloy"
                });

                // Play the result
                if (elements.transAudio) {
                    elements.transAudio.src = audioObj.src;
                    if (autoplay) elements.transAudio.play();
                }

            } catch (err) {
                console.error("[AI-Audio] Generation failed:", err);

                // --- ATTEMPT 2: HANDLE LOGIN (401 ERROR) ---
                // If the error suggests they aren't logged in
                if (err.toString().includes("401") || err.message === "Unauthorized") {
                    
                    // Pause the Arabic audio so it doesn't keep playing while they login
                    if(elements.audio) elements.audio.pause();

                    // Ask user to sign in
                    const confirmLogin = confirm("Enable AI Voice?\n\nThis high-quality voice requires a free Puter.com account. Click OK to sign in.");
                    
                    if (confirmLogin) {
                        try {
                            // Launch Puter Login Popup
                            await puter.auth.signIn();
                            
                            // Once logged in, try generating again immediately
                            const audioObjRetry = await puter.ai.txt2speech(textToRead, {
                                provider: "openai",
                                model: "tts-1",
                                voice: config.voice || "alloy"
                            });
                            
                            if (elements.transAudio) {
                                elements.transAudio.src = audioObjRetry.src;
                                elements.transAudio.play();
                            }
                        } catch (loginErr) {
                            console.log("Login cancelled or failed:", loginErr);
                        }
                    }
                }

            } finally {
                if (typeof toggleBuffering === 'function') toggleBuffering(false);
            }

        } else {
            // --- ORIGINAL MP3 BEHAVIOR ---
            if (originalUpdateTranslationAudio) {
                originalUpdateTranslationAudio(chNum, vNum, autoplay);
            }
        }
    };

})();
