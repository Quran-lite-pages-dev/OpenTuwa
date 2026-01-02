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
            // --- SAFETY LIMIT CHECK (NO-STUCK VERSION) ---
            if (typeof text === 'string' && text.length > 2990) {
                console.warn(`[Puter Fix] Text length (${text.length}) exceeds safety limit. Skipping AI TTS safely.`);
                
                // Return a "Dummy" Audio object so the player doesn't crash or freeze.
                // This pretends to play successfully and finish instantly.
                return Promise.resolve({
                    play: () => Promise.resolve(), // Pretend to play
                    pause: () => {},
                    currentTime: 0,
                    duration: 0,
                    // If the app listens for 'ended' to go to next verse, this triggers it:
                    addEventListener: function(event, callback) {
                        if (event === 'ended') {
                            setTimeout(callback, 10); // Fire 'ended' almost immediately
                        }
                    }
                });
            }
            // ---------------------------------------------

            console.log(`[Puter Fix] Intercepting TTS request...`);

            // 1. Determine the requested language
            // arg2 can be a string ('en-US') or an options object
            let requestedLangCode = 'en-US'; // Default
            if (typeof arg2 === 'string') {
                requestedLangCode = arg2;
            } else if (typeof arg2 === 'object' && arg2.language) {
                requestedLangCode = arg2.language;
            }

            // 2. Map to Full Language Name
            // e.g., 'es-ES' -> 'Spanish', 'ar' -> 'Arabic'
            const shortCode = requestedLangCode.split('-')[0].toLowerCase();
            const langName = LANG_NAMES[requestedLangCode] || LANG_NAMES[shortCode] || shortCode;

            // 3. Construct High-Quality Options (OpenAI)
            const newOptions = {
                provider: 'openai',          // FORCE OpenAI for natural sounding accents
                model: 'gpt-4o-mini-tts',    // Fast and high quality
                voice: 'alloy',              // 'alloy' and 'echo' are excellent at multilingual
                response_format: 'mp3',
                // Explicitly tell the AI which language to speak to prevent "American accent" issues
                instructions: `Read this text clearly in ${langName}. Pronounce correctly with native accent. And what you are reading now are actually the translation of Quran in ${langName} thus read it with suitable tone either it look like story mode or warning and etcetera.`
            };

            console.log(`[Puter Fix] Upgraded to OpenAI (${newOptions.voice}) for Language: ${langName}`);

            // 4. Call Original Function with New Options
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

/**
 * Puter.js Debugger & Interceptor
 * Paste this into your website to see why the popup is stubborn.
 */
(function() {
    // Force Puter to recognize the referrer even if the browser hides it
    if (window.puter) {
        window.puter.ui.useNativePopups = false;
    }

    // INTERCEPT THE POSTMESSAGE ERROR
    window.addEventListener('message', function(event) {
        // If we receive a message from Puter, manually trigger the sign-in state
        if (event.origin.includes('puter.com') && event.data === 'signed_in') {
            console.log("Puter Login Successful - Refreshing Session");
            location.reload(); 
        }
    });

    // AUTO-REDIRECT IF STUCK ON WHITE SCREEN
    if (window.location.href.includes('embedded_in_popup=true')) {
        // If we are stuck on the white screen for more than 3 seconds, 
        // it means the postMessage failed. Force close or redirect.
        setTimeout(() => {
            if (document.body.innerHTML === "" || document.body.scrollHeight < 10) {
                 console.log("Stuck detected. Redirecting back...");
                 window.location.href = "https://Quran-lite.pages.dev";
            }
        }, 3000);
    }
})();