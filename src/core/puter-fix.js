/**
 * Puter AI Interceptor
 * Fixes "Validation Error" by mapping generic language codes (en) to region codes (en-US).
 * Blocks unsupported languages to prevent API errors.
 */

(function() {
    // 1. Define Supported Region Codes (Strictly from your error log)
    const SUPPORTED_MAP = {
        'en': 'en-US', // Default English
        'ar': 'ar-AE', // Arabic
        'fr': 'fr-FR', // French
        'es': 'es-ES', // Spanish
        'de': 'de-DE', // German
        'it': 'it-IT', // Italian
        'ru': 'ru-RU', // Russian
        'tr': 'tr-TR', // Turkish
        'zh': 'cmn-CN', // Chinese (Mandarin)
        'nl': 'nl-NL', // Dutch
        'pl': 'pl-PL', // Polish
        'pt': 'pt-PT', // Portuguese
        'sv': 'sv-SE', // Swedish
        'ja': 'ja-JP', // Japanese
        'ko': 'ko-KR', // Korean
        'hi': 'hi-IN', // Hindi
        'no': 'nb-NO', // Norwegian
        'ro': 'ro-RO', // Romanian
        'cs': 'cs-CZ', // Czech
        'da': 'da-DK', // Danish
        'is': 'is-IS', // Icelandic
        'fi': 'fi-FI', // Finnish
        'ca': 'ca-ES', // Catalan
        'cy': 'cy-GB'  // Welsh
    };

    // 2. The Interceptor Function
    function injectPuterInterceptor() {
        // Wait for Puter to load
        if (typeof puter === 'undefined' || !puter.ai) {
            console.log("[Puter Fix] Waiting for Puter.js...");
            setTimeout(injectPuterInterceptor, 100);
            return;
        }

        // Prevent double injection
        if (puter.ai.txt2speech._isFixed) return;

        // Save the original function
        const originalTxt2Speech = puter.ai.txt2speech;

        // Overwrite with our "Fixed" version
        puter.ai.txt2speech = function(text, options) {
            
            let requestedLang = 'en'; // Default
            
            // Handle various ways calls might be made: (text, 'en') or (text, {language: 'en'})
            if (typeof options === 'string') {
                requestedLang = options;
            } else if (typeof options === 'object' && options.language) {
                requestedLang = options.language;
            }

            // Clean input (handle cases like "en-US" coming in correctly, or "en" needing fix)
            const cleanCode = requestedLang.split('-')[0].toLowerCase(); // 'en-US' -> 'en'

            // Check if supported
            const mappedCode = SUPPORTED_MAP[cleanCode];

            if (!mappedCode) {
                console.warn(`[Puter Fix] Blocked unsupported TTS language: ${requestedLang}`);
                // Return a rejected promise so the app handles it gracefully (catch block)
                return Promise.reject(new Error(`Language '${requestedLang}' is not supported by AI TTS.`));
            }

            console.log(`[Puter Fix] Remapped: ${requestedLang} -> ${mappedCode}`);

            // Update the arguments with the CORRECT code
            // We force it into the object format { language: 'en-US' } which Puter prefers
            const newOptions = typeof options === 'object' ? options : {};
            newOptions.language = mappedCode;

            // Call the REAL function with FIXED arguments
            return originalTxt2Speech.call(this, text, newOptions);
        };

        // Mark as fixed
        puter.ai.txt2speech._isFixed = true;
        console.log("[Puter Fix] Interceptor active. Language codes will now be corrected automatically.");
    }

    // 3. Start Injection Logic
    if (document.readyState === 'complete') {
        injectPuterInterceptor();
    } else {
        window.addEventListener('load', injectPuterInterceptor);
    }

})();