/* cast-logic.js - Handles detection and Casting */

const CAST_BTN_ID = "smart-cast-btn";
const CONTROL_PANEL_ID = "control-panel"; // Ensure this matches your HTML ID

// 1. Google Cast Setup
window['__onGCastApiAvailable'] = function(isAvailable) {
    if (isAvailable) {
        cast.framework.CastContext.getInstance().setOptions({
            receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
            autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
        });
        
        // Listen for connection (To mute local audio)
        const player = new cast.framework.RemotePlayer();
        const controller = new cast.framework.RemotePlayerController(player);
        
        controller.addEventListener(
            cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
            function() {
                if (player.isConnected) {
                    // Connected: Mute local, use TV
                    console.log("Casting started");
                    const localAudio = document.querySelector('audio'); 
                    if(localAudio) localAudio.pause();
                    window.isCastingActive = true;
                    // Load the current media to TV immediately
                    castCurrentMedia(); 
                } else {
                    // Disconnected: Resume local
                    console.log("Casting stopped");
                    window.isCastingActive = false;
                }
            }
        );
    }
};

// 2. The Smart Detection Logic
async function updateCastButtonVisibility() {
    const btn = document.getElementById(CAST_BTN_ID);
    const panel = document.getElementById(CONTROL_PANEL_ID);
    if (!btn) return;

    const ua = navigator.userAgent;

    // CHECK A: Is this an Android TV Wrapper or Native TV Browser?
    // Looks for "Android" + "TV" or "wv" (WebView) inside Android
    const isTV = /Android/.test(ua) && (/TV|SmartTV|GoogleTV/.test(ua) || /wv/.test(ua));
    const isSmartTV = /Tizen|Web0S|Viera|SmartHub/.test(ua);

    if (isTV || isSmartTV) {
        btn.style.display = 'none';
        return; 
    }

    // CHECK B: Is this Mobile (Phone/Tablet)?
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua) && !isTV;
    if (isMobile) {
        btn.style.display = 'flex'; // Always show on mobile
        return;
    }

    // CHECK C: Is this a Laptop connected to HDMI?
    // We use window.screen.isExtended (Modern Chrome)
    // If browser is on secondary screen, hide button
    if (window.screen && window.screen.isExtended) {
         try {
             // This line requires permission. If strictly HDMI detection is needed
             const details = await window.getScreenDetails();
             if (!details.currentScreen.isInternal) {
                 btn.style.display = 'none'; // It's on the external monitor/TV
                 return;
             }
         } catch(e) {
             // Permission not granted, assume Laptop
         }
    }

    // CHECK D: Desktop/Laptop Logic
    // Only show if control panel is visible
    if (panel && window.getComputedStyle(panel).display !== 'none') {
        btn.style.display = 'flex';
    } else {
        btn.style.display = 'none';
    }
}

// 3. Helper to Trigger Cast
function triggerCast() {
    const castContext = cast.framework.CastContext.getInstance();
    castContext.requestSession();
}

// 4. Helper to Send Media to TV
function castCurrentMedia() {
    const session = cast.framework.CastContext.getInstance().getCurrentSession();
    if (!session) return;
    
    // We grab variables from your index.js scope using window or global vars
    // NOTE: Ensure your index.js variables (currentSurahUrl) are accessible
    const audioUrl = window.currentSurahUrl || document.querySelector('audio')?.src;
    
    if (audioUrl) {
        const mediaInfo = new chrome.cast.media.MediaInfo(audioUrl, 'audio/mp3');
        const request = new chrome.cast.media.LoadRequest(mediaInfo);
        session.loadMedia(request);
    }
}

// Run checks on load and resize
window.addEventListener('load', updateCastButtonVisibility);
window.addEventListener('resize', updateCastButtonVisibility);
// Check every 1 second in case Control Panel is toggled by other scripts
setInterval(updateCastButtonVisibility, 1000);
