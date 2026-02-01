export async function onRequestPost(context) {
  const url = new URL(context.request.url);
  // Always use Secure if on HTTPS. 
  // If you are on localhost (http), the browser simply ignores 'Secure', which is safer than complex logic.
  const isHttps = url.protocol === 'https:';
  
  // 1. Force Path=/ to ensure it covers the whole site
  // 2. Use SameSite=Lax to allow top-level navigation usage
  const cookieVal = `TUWA_PREMIUM=true; Path=/; ${isHttps ? 'Secure;' : ''} HttpOnly; SameSite=Lax; Max-Age=31536000`;

  return new Response(JSON.stringify({ status: "activated" }), {
    headers: { 
      "Set-Cookie": cookieVal,
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache"
    }
  });
}
// 1. The function that Android will call when login finishes
window.onNativeLoginSuccess = function(idToken) {
    console.log("Received Token from Android TV:", idToken);
    
    // SEND this token to your backend (Cloudflare Worker) to verify it
    fetch('/login-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken })
    })
    .then(response => {
        if (response.ok) {
            // Reload page to show Premium content
            window.location.reload();
        }
    });
};

// 2. Attach this to your Login Button
document.getElementById('loginButton').addEventListener('click', () => {
    // Check if we are running inside the Android App
    if (window.Android) {
        // Trigger the Native Android TV Login
        window.Android.startGoogleLogin();
    } else {
        // Fallback for normal web browsers
        alert("Please use the Mobile App or standard web login.");
    }
});