export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  let body = null;
  try {
    body = await request.json();
  } catch (e) {
    return new Response('Bad Request', { status: 400 });
  }

  const { type, filename } = body || {};
  const allowed = new Set(['audio', 'image', 'data']);
  if (!allowed.has(type) || !filename) return new Response('Invalid Params', { status: 400 });

  // Secret from env (recommended). Fallback to hard-coded for local dev.
  const MEDIA_SECRET = (env && env.MEDIA_SECRET) || 'please-set-a-strong-secret-in-prod';

  // Payload: { type, filename, exp, nonce }
  const exp = Date.now() + 60 * 1000; // 1 minute expiry
  const nonce = crypto.getRandomValues(new Uint8Array(12)).reduce((s, b) => s + ('0' + b.toString(16)).slice(-2), '');
  const payload = { type, filename, exp, nonce };
  const payloadJson = JSON.stringify(payload);

  // Sign with HMAC-SHA256 using WebCrypto
  const enc = new TextEncoder();
  const keyData = enc.encode(MEDIA_SECRET);
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(payloadJson));
  const sigBytes = new Uint8Array(sigBuf);

  // base64url helpers - safe encoding
  const toB64Url = (arr) => {
    let binary = '';
    for (let i = 0; i < arr.length; i++) {
      binary += String.fromCharCode(arr[i]);
    }
    let str = btoa(binary);
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const payloadB64 = toB64Url(new TextEncoder().encode(payloadJson));
  const sigB64 = toB64Url(sigBytes);
  const token = `${payloadB64}.${sigB64}`;

  return new Response(JSON.stringify({ token }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}
