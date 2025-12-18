/**
 * AI-Audio.js (v2.0)
 * 1. Intercepts Audio Logic.
 * 2. AUTOMATICALLY updates the dropdown list to include all languages.
 */

(function() {
    // --- CONFIGURATION ---
    const ELEVEN_LABS_API_KEY = 'sk_47a79d8bf4952b5f54553a1b0171d1c5389a354f16a421bf'; 
    const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; 
    const MODEL_ID = 'eleven_multilingual_v2';
    
    // Languages that use original hosted MP3s (No AI)
    const NATIVE_LANGS = ['en', 'id', 'es']; 

    // --- INITIALIZATION ---
    const initInterval = setInterval(() => {
        // Wait until the app is fully ready
        if (typeof window.TRANSLATIONS_CONFIG !== 'undefined' && 
            typeof window.elements !== 'undefined') {
            
            clearInterval(initInterval);
            console.log("AI-Audio: App ready. Injecting languages...");
            
            // 1. Update the Dropdown List
            updateAudioDropdown();
            
            // 2. Activate the Logic Interceptor
            activateInterceptor();
        }
    }, 500);

    // --- FUNCTION 1: UPDATE THE DROPDOWN LIST ---
    function updateAudioDropdown() {
        // Try to find the audio select element. 
        // Based on standard versions of this app, it's usually inside settings or elements.
        // We look for the one currently holding 'en' or 'id'.
        
        let audioSelect = document.getElementById('translationAudioSelect');
        
        // If not found by ID, try to find it in the 'elements' object
        if (!audioSelect && elements.selects) {
            // Sometimes it's stored as elements.selects.translationAudio or similar
            // We search for the select that controls translation audio
            Object.values(elements.selects).forEach(el => {
                if (el && el.tagName === 'SELECT' && el.innerHTML.includes('English')) {
                    audioSelect = el;
                }
            });
        }

        if (!audioSelect) {
            console.error("AI-Audio: Could not find the Translation Audio dropdown.");
            return;
        }

        console.log("AI-Audio: Found dropdown. Adding languages...");

        // Clear current options to rebuild cleanly
        audioSelect.innerHTML = '';

        // Add "None" option if you want it
        const noneOpt = document.createElement('option');
        noneOpt.value = 'none';
        noneOpt.textContent = 'None';
        audioSelect.appendChild(noneOpt);

        // Loop through ALL available text translations
        Object.keys(TRANSLATIONS_CONFIG).forEach(langKey => {
            const langName = TRANSLATIONS_CONFIG[langKey].name || TRANSLATIONS_CONFIG[langKey].englishName || langKey;
            
            const option = document.createElement('option');
            option.value = langKey;

            // Label it based on type
            if (NATIVE_LANGS.includes(langKey)) {
                option.textContent = `${langName} (Original MP3)`;
            } else {
                option.textContent = `${langName} (AI Generated)`;
            }

            audioSelect.appendChild(option);
        });

        // Set default back to English so it doesn't break on load
        audioSelect.value = 'en';
    }

    // --- FUNCTION 2: INTERCEPT AUDIO REQUESTS ---
    function activateInterceptor() {
        const originalUpdateFn = window.updateTranslationAudio;

        window.updateTranslationAudio = async function(chapterNum, verseNum, autoplay) {
            // Get the language directly from the select we found earlier (or query it again)
            let audioSelect = document.getElementById('translationAudioSelect');
            // Fallback search again if needed
            if (!audioSelect && elements.selects) {
                Object.values(elements.selects).forEach(el => {
                    if (el && el.tagName === 'SELECT' && el.options.length > 5) audioSelect = el;
                });
            }

            const currentLangId = audioSelect ? audioSelect.value : 'en';

            // 1. Handle "None"
            if (currentLangId === 'none') {
                if(elements.transAudio) elements.transAudio.pause();
                return;
            }

            // 2. Handle Native MP3s (English, Indo, Spanish)
            if (NATIVE_LANGS.includes(currentLangId)) {
                return originalUpdateFn(chapterNum, verseNum, autoplay);
            }

            // 3. Handle AI Generation
            console.log(`AI-Audio: Generating ${currentLangId}...`);
            
            // Stop any playing audio
            if(elements.transAudio) {
                elements.transAudio.pause();
                elements.transAudio.src = '';
            }

            // Fetch Text
            if (!window.translationCache[currentLangId]) {
                 if (typeof loadTranslationData === 'function') {
                    await loadTranslationData(currentLangId);
                }
            }

            const text = getVerseText(currentLangId, chapterNum, verseNum);
            if (!text) return;

            // Call API
            try {
                const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`, {
                    method: 'POST',
                    headers: {
                        'xi-api-key': ELEVEN_LABS_API_KEY,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: text,
                        model_id: MODEL_ID
                    })
                });

                if (response.ok) {
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    elements.transAudio.src = url;
                    if (autoplay) elements.transAudio.play();
                } else {
                    console.log("AI-Audio: API Error");
                }
            } catch (e) {
                console.error(e);
            }
        };
    }

    // XML Parser Helper
    function getVerseText(lang, ch, v) {
        const doc = window.translationCache[lang];
        if (!doc) return "";
        try {
            // Try standard format
            let el = doc.querySelector(`sura[index="${ch}"] aya[index="${v}"]`);
            if (el) return el.getAttribute('text');
            
            // Try alternate format
            el = doc.querySelector(`Verse[Chapter="${ch}"][Verse="${v}"]`);
            if (el) return el.textContent;
        } catch(e){}
        return "";
    }

})();
