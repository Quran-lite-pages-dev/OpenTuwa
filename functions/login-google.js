// functions/login-google.js
export async function onRequestPost(context) {
  // "Untightened" Logic:
  // We don't check the token. We don't check Google.
  // If this endpoint is hit, we grant access.
  
  const url = new URL(context.request.url);
  const isHttps = url.protocol === 'https:';
  
  // Create the unlocking cookie
  const cookieVal = `TUWA_PREMIUM=true; Path=/; ${isHttps ? 'Secure;' : ''} HttpOnly; SameSite=Lax; Max-Age=31536000`;

  return new Response(JSON.stringify({ status: "force_unlocked" }), {
    headers: { 
      "Set-Cookie": cookieVal,
      "Content-Type": "application/json"
    }
  });
}