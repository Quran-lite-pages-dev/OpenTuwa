export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  let body = null;
  try {
    body = await request.json();
  } catch (e) {
    return new Response('Bad Request', { status: 400 });
  }

  // Cookie guard: only allow premium users to generate tokens
  const cookieHeader = request.headers.get('Cookie') || '';
  const hasPremium = cookieHeader.includes('TUWA_PREMIUM=true');
  if (!hasPremium) return new Response('Unauthorized', { status: 401 });

  const { type, filename } = body || {};
  const allowed = new Set(['audio', 'image', 'data']);
  if (!allowed.has(type) || !filename) return new Response('Invalid Params', { status: 400 });

  const MEDIA_SECRET = (env && env.MEDIA_SECRET) || 'please-set-a-strong-secret-in-prod';

  // Create payload
  const exp = Date.now() + 60 * 1000;
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  // Bind token to requester IP and a short UA fingerprint to prevent link sharing
  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '';
  const ua = request.headers.get('User-Agent') || '';

  // Compute a short UA hash via Web Crypto (SHA-256, take first 8 hex chars)
  // --- First declaration of 'enc' is here ---
  const enc = new TextEncoder();
  const uaDigestBuf = await crypto.subtle.digest('SHA-256', enc.encode(ua));
  const uaDigest = Array.from(new Uint8Array(uaDigestBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
  const ua_hash = uaDigest.slice(0, 8);

  const payload = { type, filename, exp, nonce, ip, ua_hash };
  const payloadJson = JSON.stringify(payload);

  // Sign with HMAC-SHA256
  // --- FIXED: Removed the duplicate 'const enc = ...' line here ---
  const keyData = enc.encode(MEDIA_SECRET);
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(payloadJson));
  const sigBytes = new Uint8Array(sigBuf);

  // Helper: convert bytes to base64url
  const toBase64Url = (bytes) => {
    let str = '';
    for (let i = 0; i < bytes.length; i++) {
      str += String.fromCharCode(bytes[i]);
    }
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const payloadB64 = toBase64Url(enc.encode(payloadJson));
  const sigB64 = toBase64Url(sigBytes);
  const token = `${payloadB64}.${sigB64}`;

  return new Response(JSON.stringify({ token }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}