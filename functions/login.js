export async function onRequestPost(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const isHttps = url.protocol === 'https:';
  
  // 1. Get the secret (CRITICAL: Fail if missing)
  const secret = env.MEDIA_SECRET;
  if (!secret) return new Response("Server Config Error", { status: 500 });

  // 2. Create the data payload
  const payload = "user_is_premium"; // In a real app, this would be a user ID
  
  // 3. Sign it
  const signature = await signData(payload, secret);
  const cookieValue = `${payload}.${signature}`; // Format: data.signature

  // 4. Set the Cookie
  const cookieStr = `TUWA_SESSION=${cookieValue}; Path=/; ${isHttps ? 'Secure;' : ''} HttpOnly; SameSite=Lax; Max-Age=31536000`;

  return new Response(JSON.stringify({ status: "activated" }), {
    headers: { 
      "Set-Cookie": cookieStr,
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}

// --- PASTE THE SECURITY HELPER BLOCK FROM STEP 2 HERE ---
async function signData(data, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function verifyData(data, signature, secret) {
  const expected = await signData(data, secret);
  return expected === signature;
}