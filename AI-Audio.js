/**
 * AI-Audio.js (v3.0 - Auto-Discovery Fix)
 * 1. Auto-detects the correct "Translation Audio" dropdown by its content.
 * 2. Injects all languages from TRANSLATIONS_CONFIG.
 * 3. Intercepts playback to use ElevenLabs for non-native languages.
 */

(function() {
    // --- CONFIGURATION ---
    const ELEVEN_LABS_API_KEY = 'YOUR_ELEVENLABS_API_KEY_HERE'; 
    const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel
    const MODEL_ID = 'eleven_multilingual_v2';
    
    // The languages that ALREADY exist in the dropdown (Native MP3s)
    const NATIVE_LANGS = ['en', 'id', 'es']; 

    // Global reference to the found dropdown
    let targetDropdown = null;

    // --- MAIN INITIALIZATION LOOP ---
    const initInterval = setInterval(() => {
        // We need TRANSLATIONS_CONFIG from index.js to know what languages to add
        if (typeof window.TRANSLATIONS_CONFIG !== 'undefined') {
            
            // Attempt to find the correct dropdown
            targetDropdown = findAudioDropdown();

            if (targetDropdown) {
                clearInterval(initInterval);
                console.log("AI-Audio: Found target dropdown!", targetDropdown);
                
                // 1. Inject the new options
                injectOptions(targetDropdown);
                
                // 2. Activate the Audio Interceptor
                activateAudioBridge();
            }
        }
    }, 500); // Check every half second

    // --- HELPER: FIND THE DROPDOWN ---
    function findAudioDropdown() {
        // Strategy: Look through ALL select elements on the page.
        // The correct one MUST contain options for 'Indonesian' or 'Spanish'.
        const allSelects = document.querySelectorAll('select');
        
        for (let select of allSelects) {
            // Check the text of the options inside this select
            const textContent = select.innerHTML.toLowerCase();
            if (textContent.includes('indonesian') || textContent.includes('spanish')) {
                // Double check it's not the TEXT translation dropdown (which implies 'text' or has many langs already)
                // The Audio dropdown usually has fewer options initially (just 3-4).
                if (select.options.length < 10) { 
                    return select;
                }
            }
        }
        return null;
    }

    // --- HELPER: INJECT OPTIONS ---
    function injectOptions(selectElement) {
        // Prevent duplicate injection
        if (selectElement.getAttribute('data-ai-patched') === 'true') return;
        
        const fragment = document.createDocumentFragment();

        Object.keys(window.TRANSLATIONS_CONFIG).forEach(langKey => {
            // Skip if this language is already in the native list (en, id, es)
            if (NATIVE_LANGS.includes(langKey)) return;

            const config = window.TRANSLATIONS_CONFIG[langKey];
            const langName = config.name || config.englishName || langKey;

            const opt = document.createElement('option');
            opt.value = langKey;
            opt.textContent = `[AI] ${langName}`;
            opt.style.color = '#00ffbb'; // Optional: Highlight AI options
            
            fragment.appendChild(opt);
        });

        selectElement.appendChild(fragment);
        selectElement.setAttribute('data-ai-patched', 'true');
        console.log("AI-Audio: Injected languages into menu.");
    }

    // --- CORE: INTERCEPT AUDIO PLAYBACK ---
    function activateAudioBridge() {
        // Save the original function from index.js
        const originalUpdateFn = window.updateTranslationAudio;

        // Overwrite the global function
        window.updateTranslationAudio = async function(chapterNum, verseNum, autoplay) {
            
            // Read the currently selected value from the dropdown we found earlier
            const selectedLang = targetDropdown ? targetDropdown.value : 'en';

            console.log(`AI-Audio Check: Selected '${selectedLang}'`);

            // 1. If it's a Native language, let the original index.js handle it
            if (NATIVE_LANGS.includes(selectedLang) || selectedLang === 'none') {
                if (typeof originalUpdateFn === 'function') {
                    return originalUpdateFn(chapterNum, verseNum, autoplay);
                }
                return;
            }

            // 2. If it's an AI language, we take over
            console.log(`AI-Audio: Generating for ${selectedLang}...`);

            // Stop existing audio if any
            if (window.elements && window.elements.transAudio) {
                window.elements.transAudio.pause();
                window.elements.transAudio.src = '';
            }

            // Ensure we have the TEXT for this language loaded
            if (!window.translationCache[selectedLang]) {
                console.log("AI-Audio: Loading text data...");
                if (typeof loadTranslationData === 'function') {
                    await loadTranslationData(selectedLang);
                }
            }

            // Get the specific verse text
            const textToSpeak = getVerseText(selectedLang, chapterNum, verseNum);
            
            if (!textToSpeak) {
                console.warn("AI-Audio: No text found to speak.");
                return;
            }

            // Call ElevenLabs
            try {
                const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream?optimize_streaming_latency=3`, {
                    method: 'POST',
                    headers: {
                        'xi-api-key': ELEVEN_LABS_API_KEY,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: textToSpeak,
                        model_id: MODEL_ID,
                        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
                    })
                });

                if (response.ok) {
                    const blob = await response.blob();
                    const audioUrl = URL.createObjectURL(blob);
                    
                    if (window.elements && window.elements.transAudio) {
                        window.elements.transAudio.src = audioUrl;
                        if (autoplay) window.elements.transAudio.play();
                        
                        // Memory cleanup
                        window.elements.transAudio.onended = () => URL.revokeObjectURL(audioUrl);
                    }
                } else {
                    console.error("AI-Audio: API Error", await response.text());
                }
            } catch (err) {
                console.error("AI-Audio: Network/Logic Error", err);
            }
        };
    }

    // --- HELPER: EXTRACT TEXT FROM XML ---
    function getVerseText(lang, ch, v) {
        const doc = window.translationCache[lang];
        if (!doc) return null;
        try {
            // Try standard format <sura index="1"><aya index="1" text="..."/></sura>
            let el = doc.querySelector(`sura[index="${ch}"] aya[index="${v}"]`);
            if (el) return el.getAttribute('text');
            
            // Try alternate format <Verse Chapter="1" Verse="1">...</Verse>
            el = doc.querySelector(`Verse[Chapter="${ch}"][Verse="${v}"]`);
            if (el) return el.textContent || el.getAttribute('Text');
        } catch(e) {
            console.error(e);
        }
        return null;
    }

})();
