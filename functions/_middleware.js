// functions/_middleware.js

// =========================================================================
// CRYPTO HELPERS (Keep New Logic)
// =========================================================================
async function importDecryptKey(secret) {
  const enc = new TextEncoder();
  const rawKey = enc.encode(secret);
  let keyBytes = new Uint8Array(32);
  keyBytes.set(rawKey.slice(0, 32));
  return crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["decrypt"]);
}

function hexToBuff(hex) {
  const tokens = hex.match(/.{1,2}/g);
  if (!tokens) return new Uint8Array();
  return new Uint8Array(tokens.map(byte => parseInt(byte, 16)));
}

export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const lowerPath = path.toLowerCase();

  const MEDIA_SECRET = (env && env.MEDIA_SECRET) || 'please-set-a-strong-secret-in-prod';

  // =========================================================================
  // 0. STREAM TOKEN VALIDATION (AES-256) - [NEW LOGIC KEPT]
  // =========================================================================
  const streamParam = url.searchParams.get('stream');
  if (streamParam) {
    try {
      if (streamParam.length < 24) throw new Error("Token too short");
      
      const key = await importDecryptKey(MEDIA_SECRET);
      const ivHex = streamParam.slice(0, 24);
      const cipherHex = streamParam.slice(24);
      const iv = hexToBuff(ivHex);
      const cipherData = hexToBuff(cipherHex);

      // Attempt Decrypt
      await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, cipherData);
    } catch (e) {
      return new Response("Forbidden: Invalid or Tampered Stream Token", { status: 403 });
    }
  }

  // =========================================================================
  // 1. AUTHENTICATION
  // =========================================================================
  const cookieHeader = request.headers.get("Cookie");
  const hasPremium = cookieHeader && cookieHeader.includes("TUWA_PREMIUM=true");

  // =========================================================================
  // 2. REQUEST TYPE DETECTION
  // =========================================================================
  const dest = request.headers.get("Sec-Fetch-Dest");
  const isDirectNav = dest === "document";

  // =========================================================================
  // 3. SECURE MEDIA TUNNEL (Signed)
  // =========================================================================
  const fromBase64Url = (str) => {
    let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  };

  async function computeUaHash(ua) {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(ua || ''));
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    return hex.slice(0, 8);
  }

  if (path.startsWith('/media/')) {
    const parts = path.split('/'); 
    if (parts.length >= 5) {
      const type = parts[2];
      const tokenStr = parts[3];
      const filename = parts.slice(4).join('/');

      const [payloadB64, sigB64] = tokenStr.split('.');
      if (!payloadB64 || !sigB64) return new Response("Invalid Token Format", { status: 403 });

      // Verify Signature
      const enc = new TextEncoder();
      const keyData = enc.encode(MEDIA_SECRET);
      const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
      
      const sig = fromBase64Url(sigB64);
      const data = enc.encode(payloadB64);
      
      const isValid = await crypto.subtle.verify('HMAC', key, sig, data);
      if (!isValid) return new Response("Invalid Signature", { status: 403 });

      // Check Payload
      let payload;
      try {
        payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64)));
      } catch (e) { return new Response("Bad Payload", { status: 400 }); }

      if (payload.type !== type || payload.filename !== filename) return new Response("Token Mismatch", { status: 403 });
      if (Date.now() > payload.exp) return new Response("Token Expired", { status: 410 });
      // Single-use disabled: audio/video triggers Range requests; each would consume the token and break playback

      // IP/UA binding disabled by default - causes 403 for users on dynamic IPs, corporate proxies,
      // or when CF-Connecting-IP differs between token request and media fetch. Token remains
      // secure via HMAC and short expiry. Set MEDIA_STRICT_BINDING=true to re-enable.
      const strictBinding = (env && env.MEDIA_STRICT_BINDING) === 'true';
      if (strictBinding) {
        const currentIp = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
        if (payload.ip !== currentIp) return new Response("IP Mismatch", { status: 403 });
        const currentUa = request.headers.get('User-Agent') || '';
        const currentUaHash = await computeUaHash(currentUa);
        if (payload.ua_hash !== currentUaHash) return new Response("Device Mismatch", { status: 403 });
      }

      // Rewrite to Real Source (New GitHub Paths)
      let targetUrl = '';
      const BASE = 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/master/assets';
      
      if (type === 'audio') targetUrl = `${BASE}/audio/play/${filename}`;
      else if (type === 'image') targetUrl = `${BASE}/ui/${filename}`;
      else if (type === 'data') targetUrl = `${BASE}/data/${filename}`;
      else return new Response("Unknown Type", { status: 404 });

      return fetch(targetUrl, request);
    }
  }

  // =========================================================================
  // 4. ROOT ROUTING (The "Door") - [RESTORED FROM BACKUP]
  // =========================================================================
  // This is what the contractor forgot. Without this, "/" does nothing.
  if (lowerPath === '/' || lowerPath === '/index.html' || lowerPath === '') {
    const targetPage = hasPremium ? '/app.html' : '/landing.html';
    // We use env.ASSETS.fetch to serve the HTML file internally
    return env.ASSETS.fetch(new URL(targetPage, request.url));
  }

  // =========================================================================
  // 5. HIDE HTML FILES - [RESTORED FROM BACKUP]
  // =========================================================================
  // Forces users to use clean URLs (tuwa.com/) instead of tuwa.com/app.html
  if (lowerPath === '/app.html' || lowerPath === '/landing.html' || lowerPath === '/app') {
    return Response.redirect(new URL('/', request.url), 302);
  }

  // =========================================================================
  // 6. GUEST & PREMIUM ROUTING - [MERGED]
  // =========================================================================
  if (!hasPremium) {
    // MERGED LIST: Includes files from OLD backup (for landing page) 
    // AND the files the contractor added.
    const allowedGuestFiles = [
      // From Old Backup (Crucial for Landing UI):
      '/assets/ui/web.png',
      '/assets/ui/web.ico',
      '/assets/ui/apple-touch-icon.png',
      '/assets/ui/logo.png',
      '/styles/a1b2c3d4e5fxa.css',
      '/styles/f1a2b3c4d5exa.css',
      '/functions/login-client.js',
      '/src/components/nav_7c6b5axjs.js',
      
      // From Contractor's New Code:
      '/landing.html', // (Though we handle this in root routing, keeping it safe)
      '/login.html', 
      '/styles/landing_a1b2c.css',
      '/styles/login_x9y8z.css',
      '/src/ui/landing_ui.js',
      
      // Common:
      '/favicon.ico',
      '/manifest.json'
    ];

    const allowedGuestStarts = [
      '/login',       
      '/login-google',
      '/auth/',
      '/api/config'
    ];

    const isAllowed = allowedGuestFiles.includes(lowerPath) || 
                      allowedGuestStarts.some(prefix => lowerPath.startsWith(prefix));

    if (!isAllowed) {
      return new Response("Not Found", { status: 404 });
    }
  }

  // =========================================================================
  // 7. PREMIUM SOURCE PROTECTION - [RESTORED]
  // =========================================================================
  if (hasPremium) {
    const protectedFolders = ['/src', '/assets', '/functions', '/locales', '/styles'];
    const isProtected = protectedFolders.some(folder => lowerPath.startsWith(folder));
    
    if (isProtected && isDirectNav) {
      // Redirect directory browsing back to app
      return Response.redirect(new URL('/', request.url), 302);
    }
  }

  return next();
}