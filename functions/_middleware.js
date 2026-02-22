export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const lowerPath = path.toLowerCase();

  // =========================================================================
  // 0. DEV BACKDOOR (LOGIN TRIGGER ONLY)
  // =========================================================================
  // This acts as a "Virtual Login". If the key is present, we consider the user
  // logged in (hasPremium = true) and inject the persistent cookie.
  // We do NOT bypass media security checks. The user is treated as a standard Premium user.
  const DEV_PARAM = "dev_key_bypass_fortest_unauthorized_use_may_cause_legal_consequences";
  const DEV_SECRET = "02mz01010199SosMaOIOUJINksnwiI0390jk0ihwcf02ew8uf083yfuhoh3f93";
  const isDevBypass = url.searchParams.get(DEV_PARAM) === DEV_SECRET;

  // Helper: Inject the Premium Cookie if the Backdoor Key was used.
  // This ensures the user remains "logged in" for future requests without the key.
  const finalize = (res) => {
    if (isDevBypass && res) {
      const newRes = new Response(res.body, res);
      newRes.headers.set(
        "Set-Cookie", 
        "TUWA_PREMIUM=true; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=31536000"
      );
      return newRes;
    }
    return res;
  };

  // =========================================================================
  // 1. AUTHENTICATION
  // =========================================================================
  const cookieHeader = request.headers.get("Cookie");
  // User is Premium if they have the Cookie OR if they just used the Dev Key.
  const hasPremium = isDevBypass || (cookieHeader && cookieHeader.includes("TUWA_PREMIUM=true"));

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

  // Helpers for base64url
  const fromBase64Url = (str) => {
    let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  };

  // Compute a short UA hash (SHA-256 -> first 8 hex chars)
  async function computeUaHash(ua) {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(ua || ''));
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    return hex.slice(0, 8);
  }

  async function verifyToken(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 2) return { ok: false };
      
      const payloadB64 = parts[0];
      const sigB64 = parts[1];

      // Decode payload
      const payloadBytes = fromBase64Url(payloadB64);
      const payloadJson = new TextDecoder().decode(payloadBytes);
      const payload = JSON.parse(payloadJson);

      // Check expiry
      if (!payload.exp || Date.now() > payload.exp) {
        return { ok: false, reason: 'expired' };
      }

      // Check nonce not used
      if (!payload.nonce || usedTokens.has(payload.nonce)) {
        return { ok: false, reason: 'used' };
      }

      // Verify signature
      const enc = new TextEncoder();
      const keyData = enc.encode(MEDIA_SECRET);
      const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
      
      const sig = fromBase64Url(sigB64);
      const valid = await crypto.subtle.verify('HMAC', key, sig, enc.encode(payloadJson));
      
      if (!valid) {
        console.error('[TOKEN] Signature verification failed for nonce:', payload.nonce);
        return { ok: false, reason: 'bad-signature' };
      }

      return { ok: true, payload };
    } catch (e) {
      console.error('[TOKEN] Verification error:', e.message);
      return { ok: false };
    }
  }

  if (lowerPath.startsWith('/media/')) {

    // RULE 1: Only Premium users allowed.
    // (This works for Backdoor users too, because hasPremium is true)
    if (!hasPremium) return finalize(new Response('Not Found', { status: 404 }));

    // RULE 2: Anti-Scrape. Block direct navigations.
    if (isDirectNav) return finalize(new Response('Access Denied', { status: 403 }));

    // Expect path: /media/{type}/{token}/{filename}
    // NOTE: do NOT lowercase the token segment — tokens are case-sensitive.
    const parts = path.split('/').filter(Boolean);
    if (parts.length < 4) return finalize(new Response('Invalid Request', { status: 400 }));

    const [, rawType, tokenPart, ...rest] = parts;
    const type = (rawType || '').toLowerCase();
    const filename = rest.join('/');

    // Validate token
    // STRICT MODE: Backdoor users must provide valid tokens just like everyone else.
    const verification = await verifyToken(tokenPart);
    if (!verification.ok) {
      return finalize(new Response(`Invalid token (${verification.reason || 'unknown'})`, { status: 403 }));
    }

    const payload = verification.payload;
    // Token Binding: verify IP and UA fingerprint match
    const currentIp = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '';
    const currentUa = request.headers.get('User-Agent') || '';
    const currentUaHash = await computeUaHash(currentUa);
    if ((payload.ip || '') !== currentIp || (payload.ua_hash || '') !== currentUaHash) {
      return finalize(new Response('Link Stolen/Device Mismatch', { status: 403 }));
    }
    // Ensure token matches request
    if (payload.type !== type || payload.filename !== filename) {
      return finalize(new Response('Token mismatch', { status: 403 }));
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
      realSource = `https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@refs/heads/master/assets/images/img/web.png`;
    } else if (type === 'data') {
      const dataBase = 'https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@refs/heads/master/assets/data/translations/';
      if (filename.endsWith('.json') || filename.endsWith('.xml')) {
        realSource = `${dataBase}${filename}`;
      }
    }

    if (realSource) {
      try {
        const originalResponse = await fetch(realSource);
        if (!originalResponse.ok) return finalize(new Response('Media Error', { status: 404 }));

        const newHeaders = new Headers(originalResponse.headers);
        newHeaders.delete('x-github-request-id');
        newHeaders.delete('access-control-allow-origin');
        newHeaders.delete('server');
        newHeaders.delete('x-cache');
        newHeaders.delete('x-served-by');
        newHeaders.set('Content-Disposition', 'inline');
        newHeaders.set('Cache-Control', 'private, max-age=86400');

        return finalize(new Response(originalResponse.body, {
          status: originalResponse.status,
          headers: newHeaders
        }));
      } catch (e) {
        return finalize(new Response('Upstream Error', { status: 502 }));
      }
    }
  }

  // =========================================================================
  // 4. ROOT ROUTING (The "Door")
  // =========================================================================
  if (lowerPath === '/' || lowerPath === '/index.html' || lowerPath === '') {
    const targetPage = hasPremium ? '/app.html' : '/landing.html';
    // Use finalize to ensure cookie is set if this was the login trigger
    return finalize(await env.ASSETS.fetch(new URL(targetPage, request.url)));
  }

  // =========================================================================
  // 5. HIDE HTML FILES
  // =========================================================================
  // Prevent users from bypassing the logic by typing /app.html
  if (lowerPath === '/app.html' || lowerPath === '/landing.html' || lowerPath === '/app') {
    return finalize(Response.redirect(new URL('/', request.url), 302));
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
      '/styles/a1b2c3d4e5fxa.css',
      '/styles/f1a2b3c4d5exa.css',
      '/functions/login-client.js',
      '/src/components/nav_7c6b5axjs.js', // As seen in your landing.html
      '/favicon.ico',
      '/sw.js',
      '/i18n.js',
      '/locales.js',
      '/assets/ui/err_9391za.html',
      '/assets/js/tuwa-hibernate.js',
      '/legal/index.html',
      '/legal/locales.json',
      '/legal/i18n.js',
      '/legal/daun.me.png',
      '/manifest.json'
    ];

    const allowedGuestStarts = [
      '/login',  
      '/legal',       
      '/login-google',
      '/auth/',
      '/api/config' // Allow config if needed for guest previews (optional)
      '/i18n',
      '/locales',
    ];

    const isAllowed = allowedGuestFiles.includes(lowerPath) || 
                      allowedGuestStarts.some(prefix => lowerPath.startsWith(prefix));

    if (!isAllowed) {
      // 404 makes it look like the files literally don't exist
      return finalize(new Response("Not Found", { status: 404 }));
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
      return finalize(Response.redirect(new URL('/', request.url), 302));
    }
  }

  // Pass through to static assets or other Functions
  // Ensure finalize is called in case next() returns a Response that needs headers.
  return finalize(await next());
}