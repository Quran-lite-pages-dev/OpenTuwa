// 1. The function that Android will call when login finishes
window.onNativeLoginSuccess = function(idToken) {
    console.log("Received Token from Android TV. Verifying...");
    
    // Send token to your Cloudflare Backend
    fetch('/login-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken })
    })
    .then(response => {
        if (response.ok) {
            console.log("Login Verified! Reloading...");
            // Reload page to force the Middleware to see the new Cookie
            window.location.reload();
        } else {
            console.error("Verification failed");
        }
    })
    .catch(err => console.error("Network error during login", err));
};

// 2. Attach this to your Login Button (Make sure you have <button id="loginButton">)
const loginBtn = document.getElementById('loginButton');
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        // Check if we are running inside the Android App
        if (window.Android) {
            // Trigger the Native Android TV Login
            window.Android.startGoogleLogin();
        } else {
            alert("This button is for Android TV Native Login. Please use standard web login.");
        }
    });
}