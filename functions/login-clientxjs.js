// functions/login-client.js

// 1. Define the Native Callback Globally
window.onNativeLoginSuccess = async function(idToken) {
    console.log("Native login success. Token received. Activating session...");

    try {
        // Send token to Cloudflare function to set the Cookie
        const response = await fetch('/login-google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: idToken })
        });

        if (response.ok) {
            console.log("Session activated. Reloading...");
            // Force reload to bypass middleware now that cookie is set
            window.location.href = window.location.origin; 
        } else {
            console.error("Server activation failed", response.status);
            alert("Login synchronization failed. Please try again.");
        }
    } catch (e) {
        console.error("Network error during activation", e);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginButton') || document.getElementById('_b6');

    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            // STRICT MODE: Check for the interface injected by MainActivity
            if (window.Android && window.Android.startGoogleLogin) {
                console.log("Triggering Android Native Login...");
                window.Android.startGoogleLogin();
            } else {
                console.warn("Native bridge not found. Fallback to web OAuth.");
                // Fallback logic here if needed, or redirect to standard web login
                // handleSocialLogin('google'); 
            }
        });
    }
});