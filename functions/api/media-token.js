export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  
  // 1. Verify Authentication Cookie first
  const cookieHeader = request.headers.get('Cookie') || '';
  const match = cookieHeader.match(/TUWA_SESSION=([^;]+)/);
  const sessionToken = match ? match[1] : null;

  const secret = '20f673faa71507381f3edccb2c16bfd3';
  if (!secret) return new Response('Config Error', { status: 500 });

  if (!sessionToken) return new Response('Unauthorized', { status: 401 });
  
  const [data, sig] = sessionToken.split('.');
  const isValid = await verifyData(data, sig, secret);
  if (!isValid) return new Response('Invalid Session', { status: 403 });

  // 2. Process Request
  let body = {};
  try { body = await request.json(); } catch (e) {}
  const { type, filename } = body;
  
  if (!type || !filename) return new Response('Bad Request', { status: 400 });

  // 3. Create Short-Lived Token (1 min) bound to IP
  const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
  const exp = Date.now() + 60000; // 60 seconds
  
  // Payload: type + filename + expiration + IP
  const tokenData = `${type}|${filename}|${exp}|${ip}`;
  const tokenSig = await signData(tokenData, secret);
  
  // Return format: payload.signature
  // We Base64 encode the payload so it's URL safe
  const payloadB64 = btoa(tokenData).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  return new Response(JSON.stringify({ token: `${payloadB64}.${tokenSig}` }), {
    headers: { 'Content-Type': 'application/json' }
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