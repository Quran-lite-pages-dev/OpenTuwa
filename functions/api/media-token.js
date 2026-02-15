// functions/api/media-token.js

// Crypto Helpers for AES-GCM
async function importStreamKey(secret) {
  const enc = new TextEncoder();
  // Pad or slice secret to 32 bytes for AES-256
  const rawKey = enc.encode(secret);
  let keyBytes = new Uint8Array(32);
  keyBytes.set(rawKey.slice(0, 32));
  
  return crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

function buffToHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuff(hex) {
  const tokens = hex.match(/.{1,2}/g);
  if (!tokens) return new Uint8Array();
  return new Uint8Array(tokens.map(byte => parseInt(byte, 16)));
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  let body = null;
  try {
    body = await request.json();
  } catch (e) {
    return new Response('Bad Request', { status: 400 });
  }

  const MEDIA_SECRET = (env && env.MEDIA_SECRET) || 'please-set-a-strong-secret-in-prod';
  
  // ---------------------------------------------------------
  // MODE 1: STREAM PARAMETER ENCRYPTION/DECRYPTION (AES-256)
  // ---------------------------------------------------------
  if (body.type === 'stream_crypto') {
    
    // ACTION: ENCRYPT (Generate URL)
    // Only allow if user is on the site (Cookie/Referer check could be stricter here)
    if (body.action === 'encrypt') {
      const { data } = body; 
      // data should be { ch, v, rec, trans, aud }
      if (!data) return new Response('Missing Data', { status: 400 });

      const key = await importStreamKey(MEDIA_SECRET);
      const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
      const encodedData = new TextEncoder().encode(JSON.stringify(data));

      const cipherBuf = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encodedData
      );

      // Return format: IV (hex) + Ciphertext (hex)
      const token = buffToHex(iv) + buffToHex(cipherBuf);
      return new Response(JSON.stringify({ token }), { headers: { 'Content-Type': 'application/json' }});
    }

    // ACTION: DECRYPT (Read URL)
    if (body.action === 'decrypt') {
      const { token } = body;
      if (!token || token.length < 24) return new Response('Invalid Token', { status: 400 });

      try {
        const key = await importStreamKey(MEDIA_SECRET);
        
        // Extract IV (first 24 hex chars = 12 bytes)
        const ivHex = token.slice(0, 24);
        const cipherHex = token.slice(24);
        
        const iv = hexToBuff(ivHex);
        const cipherData = hexToBuff(cipherHex);

        const decryptedBuf = await crypto.subtle.decrypt(
          { name: "AES-GCM", iv: iv },
          key,
          cipherData
        );

        const decryptedString = new TextDecoder().decode(decryptedBuf);
        const jsonData = JSON.parse(decryptedString);

        return new Response(JSON.stringify(jsonData), { headers: { 'Content-Type': 'application/json' }});
      } catch (e) {
        console.error("Stream Decryption Failed", e);
        return new Response('Decryption Failed', { status: 403 });
      }
    }
  }

  // ---------------------------------------------------------
  // MODE 2: MEDIA DOWNLOAD TOKENS (Signed HMAC)
  // ---------------------------------------------------------

  // Cookie guard: only allow premium users to generate tokens
  const cookieHeader = request.headers.get('Cookie') || '';
  const hasPremium = cookieHeader.includes('TUWA_PREMIUM=true');
  if (!hasPremium) return new Response('Unauthorized', { status: 401 });

  const { type, filename } = body || {};
  const allowed = new Set(['audio', 'image', 'data']);
  if (!allowed.has(type) || !filename) return new Response('Invalid Params', { status: 400 });

  // Create payload
  const exp = Date.now() + 60 * 1000;
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Bind token to requester IP and a short UA fingerprint
  const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
  const ua = request.headers.get('User-Agent') || '';

  const enc = new TextEncoder();
  const uaDigestBuf = await crypto.subtle.digest('SHA-256', enc.encode(ua));
  const uaDigest = Array.from(new Uint8Array(uaDigestBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
  const ua_hash = uaDigest.slice(0, 8);

  const payload = { type, filename, exp, nonce, ip, ua_hash };
  const payloadJson = JSON.stringify(payload);

  // Sign with HMAC-SHA256
  const keyData = enc.encode(MEDIA_SECRET);
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(payloadJson));
  const sigBytes = new Uint8Array(sigBuf);

  const toBase64Url = (bytes) => {
    let str = '';
    for (let i = 0; i < bytes.length; i++) {
      str += String.fromCharCode(bytes[i]);
    }
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const tokenStr = `${toBase64Url(new TextEncoder().encode(payloadJson))}.${toBase64Url(sigBytes)}`;

  return new Response(JSON.stringify({ token: tokenStr }), {
    headers: { 'Content-Type': 'application/json' }
  });
}