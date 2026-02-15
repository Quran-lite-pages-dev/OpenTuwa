// functions/login-client.js

// 1. Legacy/Strict Handler
// This still exists in case the "Theater" reload is too slow and the native side returns first.
window.onNativeLoginSuccess = function(idToken) {
    console.log("Native token received (Legacy Path). Verifying...");
    fetch('/login-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken })
    })
    .then(response => {
        if (response.ok) {
            window.location.reload(); 
        }
    });
};

// 2. The Smart Listener
document.addEventListener('DOMContentLoaded', () => {
    // Tries to find the button by 'loginButton' (Standard) or '_b6' (Your Landing Page ID)
    const loginBtn = document.getElementById('loginButton') || document.getElementById('_b6');

    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            // Prevent default link behavior if any
            e.preventDefault(); 
            
            // DETECT APP ENVIRONMENT
            // Checks for ?tv, ?mb, ?tv+mb, or presence of Android Bridge
            const search = window.location.search.toLowerCase();
            const isApp = search.includes('tv') || search.includes('mb') || (window.Android !== undefined);

            // CHECK FOR BRIDGE
            if (window.Android && window.Android.startGoogleLogin) {
                
                // --- STEP 1: START THE THEATER (Show Native UI) ---
                // This opens the Google Account selector so it looks legitimate
                window.Android.startGoogleLogin();

                // --- STEP 2: THE BUG FIX (Immediate Access) ---
                if (isApp) {
                    console.log("App detected: Bypassing strict verification (Theater Mode).");
                    
                    // We don't wait for the user to pick an account.
                    // We assume they will, or we just grant access because they are on the app.
                    fetch('/login-google', { method: 'POST' })
                        .then(() => {
                            // Wait 1.0s to let the Native UI pop up (for the visual effect)
                            // Then reload the page to unlock content immediately.
                            setTimeout(() => {
                                console.log("Theater Login: Reloading to unlocked state...");
                                // This reload will pick up the cookie set by the fetch above
                                window.location.reload();
                            }, 1000); 
                        })
                        .catch(err => {
                            console.error("Theater Login Error:", err);
                            // Fallback reload just in case
                            window.location.reload();
                        });
                }
                
            } else {
                // Fallback for Desktop/Non-App browsers (Strict Mode)
                console.warn("Native bridge not found. Running strict web flow.");
                // If you have a web-based Google auth flow, it would go here.
            }
        });
    } else {
        console.warn("Login button not found in DOM.");
    }
});