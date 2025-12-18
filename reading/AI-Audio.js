/**
 * AI-Audio.js
 * Extends the existing Quran Player to generate audio for non-hosted languages.
 * INTERCEPTS the audio logic without modifying the original index.js.
 */

(function() {
    // --- 1. CONFIGURATION ---
    // PASTE YOUR FREE ELEVENLABS API KEY HERE
    const ELEVEN_LABS_API_KEY = 'sk_47a79d8bf4952b5f54553a1b0171d1c5389a354f16a421bf'; 
    
    // Voice Settings (Using Multilingual v2 for best language support)
    const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // "Rachel" - specific voice ID
    const MODEL_ID = 'eleven_multilingual_v2';
    
    // These languages use your existing MP3 files (NO AI for these)
    const NATIVE_LANGS = ['en', 'id', 'es']; 

    // --- 2. INITIALIZATION BRIDGE ---
    // We wait for index.js to fully load its globals (TRANSLATIONS_CONFIG, elements)
    const bridgeInterval = setInterval(() => {
        // Safe check for global variables defined in index.js
        const globalsReady = (
            typeof TRANSLATIONS_CONFIG !== 'undefined' &&
            typeof elements !== 'undefined' &&
            typeof updateTranslationAudio === 'function' &&
            typeof translationCache !== 'undefined'
        );

        if (globalsReady) {
            clearInterval(bridgeInterval);
            console.log("AI-Audio Bridge: Connected to Quran Player.");
            activateAILogic();
        }
    }, 200);

    function activateAILogic() {
        // Capture the original function from index.js
        const originalUpdateFn = window.updateTranslationAudio;

        // --- 3. THE INTERCEPTOR ---
        // We overwrite the global function to inject our logic
        window.updateTranslationAudio = async function(chapterNum, verseNum, autoplay) {
            
            // Get currently selected translation ID (e.g., 'fr', 'sq', 'en')
            const currentLangId = elements.selects.trans ? elements.selects.trans.value : 'en';

            // CASE A: Original Hosted Audio (English, Indo, Spanish)
            if (NATIVE_LANGS.includes(currentLangId)) {
                // Pass control back to the original function exactly as before
                return originalUpdateFn(chapterNum, verseNum, autoplay);
            }

            // CASE B: AI Generation (Everything else)
            console.log(`AI-Audio: Generating speech for lang '${currentLangId}' [${chapterNum}:${verseNum}]`);

            // 1. Reset Audio Player to avoid playing old buffer
            elements.transAudio.pause();
            elements.transAudio.src = '';

            // 2. Retrieve Text from the XML Cache
            // (index.js loads the XML into 'translationCache', we just read it)
            if (!translationCache[currentLangId]) {
                // If text isn't loaded yet, try to load it using the original helper
                if (typeof loadTranslationData === 'function') {
                    await loadTranslationData(currentLangId);
                }
            }

            const verseText = extractVerseText(currentLangId, chapterNum, verseNum);
            
            if (!verseText) {
                console.warn("AI-Audio: Could not find text for this verse.");
                return;
            }

            // 3. Call ElevenLabs API
            try {
                const streamUrl = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream?optimize_streaming_latency=3`;
                
                const response = await fetch(streamUrl, {
                    method: 'POST',
                    headers: {
                        'xi-api-key': ELEVEN_LABS_API_KEY,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: verseText,
                        model_id: MODEL_ID,
                        voice_settings: {
                            stability: 0.5,
                            similarity_boost: 0.75
                        }
                    })
                });

                if (!response.ok) throw new Error("ElevenLabs API Error");

                const blob = await response.blob();
                const audioUrl = URL.createObjectURL(blob);
                
                elements.transAudio.src = audioUrl;
                
                if (autoplay) {
                    elements.transAudio.play().catch(e => console.log("AI Playback blocked:", e));
                }

                // Cleanup memory when audio ends
                elements.transAudio.onended = () => URL.revokeObjectURL(audioUrl);

            } catch (err) {
                console.error("AI-Audio Error:", err);
            }
        };
    }

    // --- 4. XML TEXT PARSER HELPER ---
    // Extracts text safely regardless of XML format variations
    function extractVerseText(langId, ch, v) {
        const doc = translationCache[langId];
        if (!doc) return null;

        try {
            // Strategy 1: Standard Tanzil Format <sura index="1"><aya index="1" text="..."/></sura>
            const suraNode = doc.querySelector(`sura[index="${ch}"]`);
            if (suraNode) {
                const ayaNode = suraNode.querySelector(`aya[index="${v}"]`);
                if (ayaNode) return ayaNode.getAttribute('text');
            }

            // Strategy 2: Direct Verse attributes <Verse Chapter="1" Verse="1">...</Verse>
            const verseNode = doc.querySelector(`Verse[Chapter="${ch}"][Verse="${v}"]`);
            if (verseNode) {
                return verseNode.textContent || verseNode.getAttribute('Text');
            }
            
        } catch (e) {
            console.error("AI-Audio: XML Parse error", e);
        }
        return null;
    }

})();
