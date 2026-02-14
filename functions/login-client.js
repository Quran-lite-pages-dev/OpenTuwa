// 1. The function Android calls automatically after you pick an account
window.onNativeLoginSuccess = function(idToken) {
    // VISUAL DEBUG: Confirm Android sent the token
    alert("Token Received from Android! Verifying...");

    // Send token to Cloudflare
    fetch('/login-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken })
    })
    .then(response => {
        if (response.ok) {
            alert("Verification Success! Reloading App...");
            // Force a hard reload to pick up the new Premium Cookie
            window.location.href = window.location.href; 
        } else {
            response.text().then(txt => alert("Login Failed: " + txt));
        }
    })
    .catch(err => alert("Network Error: " + err.message));
};

// 2. The Listener for the "Login" button on your page
// Ensure your HTML button has id="loginButton"
const loginBtn = document.getElementById('loginButton');
if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Check if running inside the Android App
        if (window.Android && window.Android.startGoogleLogin) {
            window.Android.startGoogleLogin();
        } else {
            alert("Please use this app on your Android TV device.");
        }
    });
}