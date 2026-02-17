// functions/login-client.js

document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginButton') || document.getElementById('_b6');

    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            // STRICT MODE: Trigger native UI, then wait for the callback.
            if (window.Android && window.Android.startGoogleLogin) {
                console.log("Triggering Real Android Native Login UI...");
                window.Android.startGoogleLogin();
            } else {
                // Fallback handled by landing.html's handleSocialLogin('google')
                console.warn("Native bridge not found. Proceeding with Web OAuth...");
            }
        });
    }
});