export async function onRequest(context) {
  const { env } = context;

  // Create session payload
  const payloadObj = { status: 'premium', exp: Date.now() + 7 * 24 * 60 * 60 * 1000 };
  const payloadJson = JSON.stringify(payloadObj);

  // Helpers for base64url
  const toBase64Url = (bytes) => {
    let str = '';
    for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const enc = new TextEncoder();
  const payloadB64 = toBase64Url(enc.encode(payloadJson));

  const SESSION_SECRET = (env && env.SESSION_SECRET) || 'please-set-a-strong-session-secret-in-dev';

  // Sign the payloadB64 using HMAC-SHA256
  const keyData = enc.encode(SESSION_SECRET);
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64));
  const sigBytes = new Uint8Array(sigBuf);
  const sigB64 = toBase64Url(sigBytes);

  const cookieValue = `${payloadB64}.${sigB64}`;

  const headers = {
    'Content-Type': 'application/json',
    'Set-Cookie': `TUWA_SESSION=${cookieValue}; HttpOnly; Path=/; SameSite=Strict`
  };

  return new Response(JSON.stringify({ ok: true, session: payloadObj }), { status: 200, headers });
}
