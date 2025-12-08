/* consent.js - User Consent Logic */
(function() {
    const CONSENT_KEY = 'quran_download_consent';
    
    function showConsentModal() {
        if (localStorage.getItem(CONSENT_KEY) === 'true') return;

        const modal = document.createElement('div');
        modal.id = 'consent-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.95); z-index: 10000; display: flex;
            align-items: center; justify-content: center; color: #fff;
            font-family: 'Inter', sans-serif;
        `;
        
        modal.innerHTML = `
            <div style="background: #111; padding: 2rem; border: 1px solid #333; max-width: 500px; text-align: center; border-radius: 8px;">
                <h2 style="margin-top: 0; color: #fff;">Offline Access Request</h2>
                <p style="color: #ccc; line-height: 1.6;">
                    To enable the <strong>Quran Offline</strong> feature, this website requires permission to store data (Audio, Verses, Translations) on your device. 
                    This allows the app to function fully without an internet connection.
                </p>
                <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center;">
                    <button id="btn-accept-consent" style="padding: 10px 20px; background: #e50914; color: #fff; border: none; font-size: 1rem; cursor: pointer; border-radius: 4px;">ALLOW STORAGE</button>
                    <button id="btn-decline-consent" style="padding: 10px 20px; background: transparent; border: 1px solid #666; color: #ccc; font-size: 1rem; cursor: pointer; border-radius: 4px;">LATER</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);

        // TV / Keyboard Focus
        const btnAccept = document.getElementById('btn-accept-consent');
        const btnDecline = document.getElementById('btn-decline-consent');
        
        setTimeout(() => btnAccept.focus(), 100);

        btnAccept.onclick = () => {
            localStorage.setItem(CONSENT_KEY, 'true');
            modal.remove();
            // If on dashboard, we might trigger sw registration here
            if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
        };

        btnDecline.onclick = () => {
            modal.remove();
        };
        
        // Trap focus for TV
        btnAccept.onkeydown = (e) => { if(e.key === 'ArrowRight') btnDecline.focus(); }
        btnDecline.onkeydown = (e) => { if(e.key === 'ArrowLeft') btnAccept.focus(); }
    }

    // Run on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showConsentModal);
    } else {
        showConsentModal();
    }
})();
