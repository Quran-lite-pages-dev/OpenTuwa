/**
 * Puter AI Interceptor - High Quality Voice Fix
 * Forces the use of OpenAI's TTS engine which supports native-sounding
 * multilingual speech (Arabic, Spanish, etc.) automatically.
 */

(function() {
    // LANGUAGE NAME MAP (Used to give clear instructions to the AI)
    const LANG_NAMES = {
        'ar': 'Arabic', 'ar-AE': 'Arabic',
        'en': 'English', 'en-US': 'English',
        'es': 'Spanish', 'es-ES': 'Spanish',
        'fr': 'French', 'fr-FR': 'French',
        'de': 'German', 'de-DE': 'German',
        'it': 'Italian', 'it-IT': 'Italian',
        'ru': 'Russian', 'ru-RU': 'Russian',
        'tr': 'Turkish', 'tr-TR': 'Turkish',
        'zh': 'Chinese', 'cmn-CN': 'Chinese',
        'ur': 'Urdu', 'id': 'Indonesian', 
        'ms': 'Malay', 'fa': 'Persian'
        // Add others if needed
    };

    function injectPuterInterceptor() {
        if (!window.puter || !window.puter.ai || window.puter.ai.txt2speech._isFixed) return;

        const originalTxt2Speech = puter.ai.txt2speech;

        puter.ai.txt2speech = function(text, arg2, arg3) {
            console.log(`[Puter Fix] Intercepting TTS request...`);

            // 1. Determine the requested language
            // arg2 can be a string ('en-US') or an options object
            let requestedLangCode = 'en-US'; // Default
            
            if (typeof arg2 === 'string') {
                requestedLangCode = arg2;
            } else if (typeof arg2 === 'object' && arg2.language) {
                requestedLangCode = arg2.language;
            }

            // 2. Resolve Language Name for Instructions
            // We strip region codes (e.g. 'ar-AE' -> 'ar') to look up the name
            const shortCode = requestedLangCode.split('-')[0].toLowerCase();
            const langName = LANG_NAMES[requestedLangCode] || LANG_NAMES[shortCode] || shortCode;

            // 3. Construct High-Quality Options (OpenAI)
            const newOptions = {
                provider: 'openai',          // FORCE OpenAI for natural sounding accents
                model: 'gpt-4o-mini-tts',    // Fast and high quality
                voice: 'alloy',              // 'alloy' and 'echo' are excellent at multilingual
                response_format: 'mp3',
                // Explicitly tell the AI which language to speak to prevent "American accent" issues
                instructions: `Read this text clearly in ${langName}. Pronounce correctly with native accent.`
            };

            console.log(`[Puter Fix] Upgraded to OpenAI (${newOptions.voice}) for Language: ${langName}`);

            // 4. Call Original Function with New Options
            // We ignore the original arg2/arg3 structure and force our options
            return originalTxt2Speech.call(this, text, newOptions);
        };

        // Mark as fixed
        puter.ai.txt2speech._isFixed = true;
        console.log("[Puter Fix] High-Quality Multilingual TTS Interceptor Active.");
    }

    // Start Injection Logic
    if (document.readyState === 'complete') {
        injectPuterInterceptor();
    } else {
        window.addEventListener('load', injectPuterInterceptor);
    }
})();