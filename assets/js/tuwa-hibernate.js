/**
 * TUWA HIBERNATION ENGINE
 * Handles state preservation, offline detection, and progress restoration.
 */

(function() {
    const STORAGE_KEY = 'tuwa_session_hibernate';
    
    // --- 1. Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(reg => {
                console.log('Tuwa SW Ready');
            }).catch(err => console.error('Tuwa SW Fail', err));
        });
    }

    // --- 2. Hibernation Logic (Save State) ---
    function hibernateSession() {
        console.log("Connection lost. Hibernating session...");

        const state = {
            url: window.location.href,
            timestamp: Date.now(),
            scroll: { x: window.scrollX, y: window.scrollY },
            inputs: {},
            media: {}
        };

        // Snapshot Form Inputs
        document.querySelectorAll('input, textarea, select').forEach((el, index) => {
            if(el.id || el.name) {
                // Use ID or Name as key, fallback to index if needed
                let key = el.id || el.name || `idx_${index}`;
                if(el.type === 'checkbox' || el.type === 'radio') {
                    state.inputs[key] = { type: 'check', checked: el.checked };
                } else {
                    state.inputs[key] = { type: 'value', value: el.value };
                }
            }
        });

        // Snapshot Media (Video/Audio) Playback Time
        document.querySelectorAll('video, audio').forEach((el, index) => {
            let key = el.id || `media_${index}`;
            state.media[key] = el.currentTime;
        });

        // Secure Save
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        
        // Force Reload to trigger Service Worker Offline Page
        window.location.reload();
    }

    // --- 3. Wake Logic (Restore State) ---
    function wakeSession() {
        const rawData = localStorage.getItem(STORAGE_KEY);
        if (!rawData) return;

        try {
            const state = JSON.parse(rawData);

            // SECURITY: Only restore if we are on the exact same URL
            if (state.url !== window.location.href) return;

            // Expiration check (e.g., discard if older than 24 hours)
            if (Date.now() - state.timestamp > 86400000) {
                localStorage.removeItem(STORAGE_KEY);
                return;
            }

            console.log("Restoring Tuwa Session...");

            // Restore Inputs
            Object.keys(state.inputs).forEach(key => {
                const data = state.inputs[key];
                // Try to find by ID, then Name
                let el = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
                if (el) {
                    if (data.type === 'check') el.checked = data.checked;
                    else el.value = data.value;
                }
            });

            // Restore Media
            Object.keys(state.media).forEach(key => {
                let el = document.getElementById(key);
                // If not found by ID, try index-based fallback (risky but helpful)
                if (!el && key.startsWith('media_')) {
                    const idx = parseInt(key.split('_')[1]);
                    const allMedia = document.querySelectorAll('video, audio');
                    if (allMedia[idx]) el = allMedia[idx];
                }

                if (el) {
                    el.currentTime = state.media[key];
                    // Optional: Auto-resume if it was likely playing? 
                    // Browsers often block auto-play, so we just set the time.
                }
            });

            // Restore Scroll (Last step to ensure layout is ready)
            setTimeout(() => {
                window.scrollTo({
                    top: state.scroll.y,
                    left: state.scroll.x,
                    behavior: 'auto' // Instant jump, don't scroll smooth
                });
                
                // WIPE DATA: Security measure so we don't restore old state next time
                localStorage.removeItem(STORAGE_KEY);
                
                // Add a small visual cue (optional)
                showRestorationToast();
            }, 100);

        } catch (e) {
            console.error("Tuwa Restoration Error", e);
            localStorage.removeItem(STORAGE_KEY);
        }
    }

    // --- 4. Event Listeners ---

    // Trigger Hibernation when Offline
    window.addEventListener('offline', () => {
        // Double check navigator.onLine just to be sure
        if (!navigator.onLine) {
            hibernateSession();
        }
    });

    // Attempt to wake/restore on every page load
    if (navigator.onLine) {
        wakeSession();
    }

    // Optional: Visual Cue
    function showRestorationToast() {
        const toast = document.createElement('div');
        toast.style.cssText = "position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.8); color:white; padding:8px 16px; border-radius:20px; font-size:12px; font-family:sans-serif; pointer-events:none; z-index:9999; animation: fadeOut 3s forwards;";
        toast.innerText = "Session Restored";
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
        const style = document.createElement('style');
        style.innerHTML = "@keyframes fadeOut { 0% {opacity:1} 80% {opacity:1} 100% {opacity:0} }";
        document.head.appendChild(style);
    }

})();