export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const lowerPath = path.toLowerCase();

  // =========================================================================
  // 1. AUTHENTICATION
  // =========================================================================
  const cookieHeader = request.headers.get("Cookie");
  const hasPremium = cookieHeader && cookieHeader.includes("TUWA_PREMIUM=true");

  // =========================================================================
  // 2. REQUEST TYPE DETECTION (For Anti-Scraping)
  // =========================================================================
  // 'dest' tells us IF the browser is loading a page (document) 
  // or a resource (image, audio, script).
  const dest = request.headers.get("Sec-Fetch-Dest");
  const referer = request.headers.get("Referer");
  
  // Is the user trying to open a file directly in the address bar?
  // (e.g. typing tuwa.com/src/app.js) -> We will block this.
  const isDirectNav = dest === "document";

  // =========================================================================
  // 3. SECURE MEDIA TUNNEL (Signed, single-use tokens)
  // =========================================================================
  // This extends the previous tunnel by requiring a signed token in the
  // URL: /media/{type}/{token}/{filename}. Tokens are short-lived (1 minute)
  // and are marked single-use. NOTE: This implementation uses an in-memory
  // used-token store. For production use, replace with a durable store
  // (KV/Redis) via `env` bindings.

  // --- Simple in-memory used-token set (nonce => usedAt)
  if (!globalThis.__USED_MEDIA_TOKENS) globalThis.__USED_MEDIA_TOKENS = new Map();
  const usedTokens = globalThis.__USED_MEDIA_TOKENS;

  // Secret for HMAC. For production, set via env var (env.MEDIA_SECRET)
  const MEDIA_SECRET = (env && env.MEDIA_SECRET) || 'please-set-a-strong-secret-in-prod';
  
  // Log secret hash for debugging
  const secretHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(MEDIA_SECRET));
  console.log('[MEDIA-MW] Secret hash:', Array.from(new Uint8Array(secretHash)).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16));

  // Helpers
  const b64 = (s) => s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unb64 = (s) => {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    return atob(s);
  };

  async function verifyToken(token) {
    try {
      console.log('[TOKEN] Start verify, token length:', token.length);
      const parts = token.split('.');
      if (parts.length !== 2) {
        console.error('[TOKEN] Format error: expected 2 parts, got', parts.length);
        return { ok: false };
      }
      
      const [payloadB64, sigB64] = parts;

      // Decode payload (safely)
      let payloadJson = '';
      try {
        payloadJson = unb64(payloadB64);
      } catch (e) {
        console.error('[TOKEN] Payload decode failed:', e.message);
        return { ok: false };
      }

      let payload;
      try {
        payload = JSON.parse(payloadJson);
      } catch (e) {
        console.error('[TOKEN] Payload parse failed:', e.message);
        return { ok: false };
      }
      console.log('[TOKEN] Payload:', { type: payload.type, filename: payload.filename, exp: payload.exp, nonce: payload.nonce });

      // Check expiry
      const now = Date.now();
      if (!payload.exp || now > payload.exp) {
        console.error(`[TOKEN] Expired: now=${now}, exp=${payload.exp}`);
        return { ok: false, reason: 'expired' };
      }

      // Check nonce not used
      if (!payload.nonce) {
        console.error('[TOKEN] Missing nonce');
        return { ok: false };
      }
      if (usedTokens.has(payload.nonce)) {
        console.error(`[TOKEN] Nonce already used: ${payload.nonce}`);
        return { ok: false, reason: 'used' };
      }

      // Verify signature
      try {
        const enc = new TextEncoder();
        const keyData = enc.encode(MEDIA_SECRET);
        const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
        
        // Decode signature (safely with padding)
        let sigStr = sigB64.replace(/-/g, '+').replace(/_/g, '/');
        while (sigStr.length % 4) sigStr += '=';
        const sig = Uint8Array.from(atob(sigStr), c => c.charCodeAt(0));
        
        console.log('[TOKEN] Verifying signature, sig length:', sig.length);
        const valid = await crypto.subtle.verify('HMAC', key, sig, enc.encode(payloadJson));
        console.log('[TOKEN] Signature result:', valid);
        
        if (!valid) {
          console.error('[TOKEN] Signature mismatch - possible secret mismatch or payload changed');
          return { ok: false, reason: 'bad-signature' };
        }
      } catch (e) {
        console.error('[TOKEN] Signature verification threw:', e.message);
        return { ok: false };
      }

      return { ok: true, payload };
    } catch (e) {
      console.error('[TOKEN] Verification error:', e.message);
      return { ok: false };
    }
  }

  if (lowerPath.startsWith('/media/')) {

    // RULE 1: Only Premium users allowed.
    if (!hasPremium) return new Response('Not Found', { status: 404 });

    // RULE 2: Anti-Scrape. Block direct navigations.
    if (isDirectNav) return new Response('Access Denied', { status: 403 });

    // Expect path: /media/{type}/{token}/{filename}
    const parts = lowerPath.split('/').filter(Boolean); // ['media','audio','{token}','file.mp3']
    console.log('[MEDIA] Path parts:', parts);
    if (parts.length < 4) return new Response('Invalid Request', { status: 400 });

    const [, type, tokenPart, ...rest] = parts;
    const filename = rest.join('/');
    console.log('[MEDIA] Type:', type, 'Token:', tokenPart.substring(0, 50) + '...', 'Filename:', filename);

    // Validate token
    const verification = await verifyToken(tokenPart);
    if (!verification.ok) {
      const reason = verification.reason || 'unknown';
      console.error(`Token validation failed: ${reason}`);
      return new Response(`Invalid or expired token (${reason})`, { status: 403 });
    }

    const payload = verification.payload;
    // Ensure token matches request
    if (payload.type !== type || payload.filename !== filename) {
      return new Response('Token mismatch', { status: 403 });
    }

    // Mark nonce as used (single-use)
    usedTokens.set(payload.nonce, Date.now());

    // Prune old tokens (keep memory small)
    const now = Date.now();
    for (const [k, v] of usedTokens.entries()) {
      if (now - v > 1000 * 60 * 10) usedTokens.delete(k);
    }

    // Resolve real source based on type
    let realSource = null;
    if (type === 'audio') {
      // incoming filename like 001001.mp3
      realSource = `https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@master/assets/cdn/${filename}`;
    } else if (type === 'image') {
      realSource = `https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@refs/heads/master/assets/images/img/${filename}`;
    } else if (type === 'data') {
      const dataBase = 'https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@refs/heads/master/assets/data/translations/';
      if (filename.endsWith('.json') || filename.endsWith('.xml')) {
        realSource = `${dataBase}${filename}`;
      }
    }

    if (realSource) {
      try {
        const originalResponse = await fetch(realSource);
        if (!originalResponse.ok) return new Response('Media Error', { status: 404 });

        const newHeaders = new Headers(originalResponse.headers);
        newHeaders.delete('x-github-request-id');
        newHeaders.delete('access-control-allow-origin');
        newHeaders.delete('server');
        newHeaders.delete('x-cache');
        newHeaders.delete('x-served-by');
        newHeaders.set('Content-Disposition', 'inline');
        newHeaders.set('Cache-Control', 'private, max-age=86400');

        return new Response(originalResponse.body, {
          status: originalResponse.status,
          headers: newHeaders
        });
      } catch (e) {
        return new Response('Upstream Error', { status: 502 });
      }
    }
  }

  // =========================================================================
  // 4. ROOT ROUTING (The "Door")
  // =========================================================================
  if (lowerPath === '/' || lowerPath === '/index.html' || lowerPath === '') {
    const targetPage = hasPremium ? '/app.html' : '/landing.html';
    return env.ASSETS.fetch(new URL(targetPage, request.url));
  }

  // =========================================================================
  // 5. HIDE HTML FILES
  // =========================================================================
  // Prevent users from bypassing the logic by typing /app.html
  if (lowerPath === '/app.html' || lowerPath === '/landing.html' || lowerPath === '/app') {
    return Response.redirect(new URL('/', request.url), 302);
  }

  // =========================================================================
  // 6. GUEST LOCKDOWN (Strict Allowlist)
  // =========================================================================
  // If NOT Premium, block EVERYTHING except what landing.html needs.
  if (!hasPremium) {
    const allowedGuestFiles = [
      '/assets/ui/web.png',
      '/assets/ui/web.ico',
      '/assets/ui/apple-touch-icon.png',
      '/assets/ui/logo.png',
      '/styles/index1.css',
      '/styles/inline-styles.css',
      '/functions/login-client.js',
      '/src/components/navigation.js', // As seen in your landing.html
      '/favicon.ico',
      '/manifest.json'
    ];

    const allowedGuestStarts = [
      '/login',       
      '/login-google',
      '/auth/',
      '/api/config' // Allow config if needed for guest previews (optional)
    ];

    const isAllowed = allowedGuestFiles.includes(lowerPath) || 
                      allowedGuestStarts.some(prefix => lowerPath.startsWith(prefix));

    if (!isAllowed) {
      // 404 makes it look like the files literally don't exist
      return new Response("Not Found", { status: 404 });
    }
  }

  // =========================================================================
  // 7. PREMIUM SOURCE PROTECTION
  // =========================================================================
  // If Premium user tries to "Browse" folders via address bar -> Redirect Home.
  // This allows the App to fetch the files (script src="...") but blocks the User.
  if (hasPremium) {
    // Folders found in your file tree
    const protectedFolders = ['/src', '/assets', '/functions', '/locales', '/styles'];
    const isProtected = protectedFolders.some(folder => lowerPath.startsWith(folder));
    
    if (isProtected && isDirectNav) {
      // If they type "tuwa.com/src/app.js" in the address bar -> BOOM, back to home.
      return Response.redirect(new URL('/', request.url), 302);
    }
  }

  // Pass through to static assets or other Functions
  return next();
}