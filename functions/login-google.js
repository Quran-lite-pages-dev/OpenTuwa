// functions/login-google.js
export async function onRequestPost(context) {
  // "Untightened" Logic:
  // We don't check the token. We don't check Google.
  // If this endpoint is hit, we grant access.
  
  const url = new URL(context.request.url);
  const isHttps = url.protocol === 'https:';
  // Create signed session cookie (TUWA_SESSION) - still no real Google verification here
  const payloadObj = { status: 'premium', exp: Date.now() + 31536000 * 1000 };
  const payloadJson = JSON.stringify(payloadObj);

  const toBase64Url = (bytes) => {
    let str = '';
    for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const enc = new TextEncoder();
  const payloadB64 = toBase64Url(enc.encode(payloadJson));

  const SESSION_SECRET = (context.env && context.env.SESSION_SECRET) || 'please-set-a-strong-session-secret-in-dev';
  const keyData = enc.encode(SESSION_SECRET);
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64));
  const sigBytes = new Uint8Array(sigBuf);
  const sigB64 = toBase64Url(sigBytes);

  const cookieValue = `${payloadB64}.${sigB64}`;
  const cookieAttrs = `${isHttps ? 'Secure; ' : ''}HttpOnly; Path=/; SameSite=Strict; Max-Age=31536000`;

  return new Response(JSON.stringify({ status: "force_unlocked" }), {
    headers: { 
      "Set-Cookie": `TUWA_SESSION=${cookieValue}; ${cookieAttrs}`,
      "Content-Type": "application/json"
    }
  });
}