/**
 * AI-Audio.js
 * Seamlessly adds AI Audio support to new languages.
 * Uses ElevenLabs (Flash v2.5) for high speed and free-tier efficiency.
 */

(function() {
    console.log("Initializing AI Audio Module...");

    // ==========================================
    // ⚠️ PASTE YOUR ELEVENLABS API KEY HERE
    // ==========================================
    const ELEVEN_API_KEY = "sk_47a79d8bf4952b5f54553a1b0171d1c5389a354f16a421bf"; 

    // Voice Configuration (Hidden from UI, used by logic)
    const VOICE_MAP = {
        'fr': "21m00Tcm4TlvDq8ikWAM",  // French (Rachel)
        'de': "D38z5RcWu1voky8WS1ja",  // German (Fin)
        'ru': "JBFqnCBsd6RMkjVDRZzb",  // Russian (George)
        'tr': "FGY2WhTYpPnrIDTdsKH5",  // Turkish (Laura)
        'ur': "Xb7hH8MSUDp1N1sqb7dO"   // Urdu (Example)
    };

    // 1. INJECT LANGUAGES SAFELY
    // We wait for index.js to be ready, then we add the languages naturally.
    setTimeout(() => {
        if (typeof window.TRANSLATIONS_AUDIO_CONFIG !== 'undefined') {
            
            // We extend the config with standard languages.
            // They look just like your English/Spanish entries.
            // We add a special hidden flag 'isAI: true'.
            Object.assign(window.TRANSLATIONS_AUDIO_CONFIG, {
                'fr': { 
                    name: 'French (Hamidullah)', 
                    url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/a/fr.hamidullah.xml', 
                    type: 'ai',   
                    voiceId: VOICE_MAP['fr']
                },
                'de': { 
                    name: 'German (Abu Rida)', 
                    url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/a/de.aburida.xml', 
                    type: 'ai',
                    voiceId: VOICE_MAP['de']
                },
                'ru': { 
                    name: 'Russian (Kuliev)', 
                    url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/a/ru.kuliev.xml', 
                    type: 'ai',
                    voiceId: VOICE_MAP['ru']
                },
                'tr': { 
                    name: 'Turkish (Yuksel)', 
                    url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/a/tr.yuksel.xml', 
                    type: 'ai',
                    voiceId: VOICE_MAP['tr']
                }
            });
            console.log("AI Languages integrated seamlessly.");

            // Optional: Refresh dropdown if it was already built (depends on index.js logic)
            // if (typeof populateTranslationSelect === 'function') populateTranslationSelect();

        } else {
            console.error("ERROR: TRANSLATIONS_AUDIO_CONFIG not found. Add 'window.TRANSLATIONS_AUDIO_CONFIG = TRANSLATIONS_AUDIO_CONFIG;' to index.js");
        }
    }, 500);


    // 2. INTELLIGENT AUDIO INTERCEPTOR
    const originalUpdateTranslationAudio = window.updateTranslationAudio;

    window.updateTranslationAudio = async function(chNum, vNum, autoplay) {
        
        // Safety Check
        if (!elements || !elements.selects || !elements.selects.trans) {
            if (originalUpdateTranslationAudio) originalUpdateTranslationAudio(chNum, vNum, autoplay);
            return;
        }

        const currentLangId = elements.selects.trans.value;
        const config = window.TRANSLATIONS_AUDIO_CONFIG ? window.TRANSLATIONS_AUDIO_CONFIG[currentLangId] : null;

        // --- DECISION LOGIC ---
        // If it is 'en', 'es', 'id' (Standard MP3) -> Use Old Code.
        // If it is 'fr', 'de', 'ru' (AI Type)      -> Use New Code.
        
        if (config && config.type === 'ai') {
            
            console.log(`[AI-Audio] Generating audio for: ${config.name}`);

            try {
                if (typeof toggleBuffering === 'function') toggleBuffering(true);

                // 1. GET TEXT (This is the "Text Section" you mentioned)
                const textEl = document.getElementById('translation-text');
                let textToRead = textEl ? textEl.innerText : "";

                // Cleanup text (remove verse numbers or footnotes if necessary)
                // textToRead = textToRead.replace(/\[.*?\]/g, ''); 

                if (!textToRead || textToRead.length < 2) {
                    if (typeof toggleBuffering === 'function') toggleBuffering(false);
                    return;
                }

                // 2. FETCH AUDIO FROM ELEVENLABS
                // We use the 'eleven_flash_v2_5' model for speed/free-tier.
                const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${config.voiceId}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'audio/mpeg',
                        'Content-Type': 'application/json',
                        'xi-api-key': ELEVEN_API_KEY
                    },
                    body: JSON.stringify({
                        text: textToRead,
                        model_id: "eleven_flash_v2_5",
                        voice_settings: { stability: 0.5, similarity_boost: 0.5 }
                    })
                });

                if (!response.ok) throw new Error("ElevenLabs API Error");

                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);

                // 3. INJECT & PLAY
                if (elements.transAudio) {
                    elements.transAudio.src = audioUrl;
                    if (autoplay) elements.transAudio.play();
                }

            } catch (err) {
                console.error("AI Audio Error:", err);
            } finally {
                if (typeof toggleBuffering === 'function') toggleBuffering(false);
            }

        } else {
            // --- STANDARD BEHAVIOR (MP3) ---
            // This runs for English, Indonesian, Spanish, etc.
            if (originalUpdateTranslationAudio) {
                originalUpdateTranslationAudio(chNum, vNum, autoplay);
            }
        }
    };
})();
