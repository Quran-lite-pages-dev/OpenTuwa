// functions/_middleware.js

// Duplicated Crypto Logic for Middleware (Edge context)
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
  // 0. STREAM TOKEN VALIDATION (AES-256)
  // =========================================================================
  // If the user navigates to ?stream=XXX, we strictly validate it here.
  // We do NOT decrypt and expose the data to the browser in the URL.
  // We only check if it is VALID. If invalid, 403.
  // The Client JS will separately call the API to decrypt it.
  
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
      
      // If no error thrown, token is valid AES-256. Proceed.
    } catch (e) {
      // Invalid Stream Token -> Block Access
      return new Response("Forbidden: Invalid or Tampered Stream Token", { status: 403 });
    }
  }

  // =========================================================================
  // 1. AUTHENTICATION
  // =========================================================================
  const cookieHeader = request.headers.get("Cookie");
  const hasPremium = cookieHeader && cookieHeader.includes("TUWA_PREMIUM=true");

  // =========================================================================
  // 2. REQUEST TYPE DETECTION (For Anti-Scraping)
  // =========================================================================
  const dest = request.headers.get("Sec-Fetch-Dest");
  const referer = request.headers.get("Referer");
  const isDirectNav = dest === "document";

  // =========================================================================
  // 3. SECURE MEDIA TUNNEL (Signed, single-use tokens)
  // =========================================================================
  if (!globalThis.__USED_MEDIA_TOKENS) globalThis.__USED_MEDIA_TOKENS = new Map();
  const usedTokens = globalThis.__USED_MEDIA_TOKENS;

  // Helpers for base64url
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
    // Expect: /media/{type}/{token}/{filename}
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
      if (usedTokens.has(payload.nonce)) return new Response("Token Used", { status: 403 });

      // Check IP Binding
      const currentIp = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
      if (payload.ip !== currentIp) return new Response("IP Mismatch", { status: 403 });

      // Check UA Binding
      const currentUa = request.headers.get('User-Agent') || '';
      const currentUaHash = await computeUaHash(currentUa);
      if (payload.ua_hash !== currentUaHash) return new Response("Device Mismatch", { status: 403 });

      // Mark Used
      usedTokens.set(payload.nonce, Date.now());
      // Cleanup
      for (const [n, t] of usedTokens) {
        if (Date.now() - t > 65000) usedTokens.delete(n);
      }

      // Rewrite to Real Source
      // MAPPING:
      // audio -> https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/master/assets/audio/play/{filename}
      // image -> https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/master/assets/ui/{filename}
      // data  -> https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/master/assets/data/{filename}

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
  // 4. GUEST & PREMIUM ROUTING
  // =========================================================================
  if (!hasPremium) {
    const allowedGuestFiles = [
      '/landing.html', 
      '/login.html', 
      '/styles/landing_a1b2c.css',
      '/styles/login_x9y8z.css',
      '/src/ui/landing_ui.js', 
      '/src/components/nav_7c6b5axjs.js',
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
  // 5. PREMIUM SOURCE PROTECTION
  // =========================================================================
  if (hasPremium) {
    const protectedFolders = ['/src', '/assets', '/functions', '/locales', '/styles'];
    const isProtected = protectedFolders.some(folder => lowerPath.startsWith(folder));
    
    if (isProtected && isDirectNav) {
      return Response.redirect(url.origin, 302);
    }
  }

  return next();
}