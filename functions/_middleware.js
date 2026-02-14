export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  
  // 1. Validate Secret
  const secret = env.MEDIA_SECRET;
  if (!secret) return new Response("Critical: MEDIA_SECRET not set", { status: 500 });

  // 2. Check Authentication (Verify Signature)
  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(/TUWA_SESSION=([^;]+)/);
  let isVerifiedUser = false;

  if (match) {
    const [data, sig] = match[1].split('.');
    if (await verifyData(data, sig, secret)) {
      isVerifiedUser = true;
    }
  }

  // =========================================================
  // ROUTE 1: SECURE MEDIA TUNNEL
  // Pattern: /media/{type}/{token}/{filename}
  // =========================================================
  if (path.startsWith('/media/')) {
    if (!isVerifiedUser) return new Response('Unauthorized', { status: 401 });

    const parts = path.split('/').filter(Boolean); // ["media", "audio", "token", "file.mp3"]
    if (parts.length < 4) return new Response('Invalid URL', { status: 400 });

    const [, reqType, rawToken, ...fileParts] = parts;
    const reqFilename = fileParts.join('/');
    
    // Parse Token
    // Token format: base64Payload.signature
    const [b64Payload, tokenSig] = rawToken.split('.');
    if (!b64Payload || !tokenSig) return new Response('Bad Token', { status: 403 });

    // Decode Payload
    let tokenDataStr;
    try {
      tokenDataStr = atob(b64Payload.replace(/-/g, '+').replace(/_/g, '/'));
    } catch(e) { return new Response('Bad Encoding', { status: 403 }); }

    // Verify Signature
    const isValid = await verifyData(tokenDataStr, tokenSig, secret);
    if (!isValid) return new Response('Token Forged', { status: 403 });

    // Verify Constraints (IP, Expiry, Filename)
    const [tokType, tokFile, tokExp, tokIp] = tokenDataStr.split('|');
    const currentIp = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
    
    if (Date.now() > parseInt(tokExp)) return new Response('Token Expired', { status: 410 });
    if (tokIp !== currentIp) return new Response('IP Mismatch', { status: 403 });
    if (tokType !== reqType || tokFile !== reqFilename) return new Response('Resource Mismatch', { status: 403 });

    // If we got here, request is legit. Fetch origin.
    let realSource = null;
    if (reqType === 'audio') {
      realSource = `https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@master/assets/cdn/${reqFilename}`;
    } else if (reqType === 'image') {
       // Using the generic image from your code
       realSource = `https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@refs/heads/master/assets/images/img/web.png`;
    } else if (reqType === 'data') {
      realSource = `https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@refs/heads/master/assets/data/translations/${reqFilename}`;
    }

    if (realSource) {
      const response = await fetch(realSource);
      // Strip GitHub headers for cleanliness
      const newHeaders = new Headers(response.headers);
      return new Response(response.body, { status: response.status, headers: newHeaders });
    }
    return new Response('Not Found', { status: 404 });
  }

  // =========================================================
  // ROUTE 2: PAGE NAVIGATION
  // =========================================================
  
  // Protect Source Files for Premium Users
  if (isVerifiedUser) {
    if (path === '/' || path === '/index.html') {
      // Rewrite to app.html (User sees /, server returns app.html)
      return env.ASSETS.fetch(new URL('/app.html', request.url));
    }
  } else {
    // Guest User
    if (path === '/' || path === '/index.html') {
      return env.ASSETS.fetch(new URL('/landing.html', request.url));
    }
    
    // Allow List for Guests
    const allowed = ['/login', '/login-google', '/assets/', '/styles/', '/functions/', '/manifest.json', '/favicon.ico'];
    const isAllowed = allowed.some(p => path.startsWith(p));
    
    if (!isAllowed) {
       // If guest tries to access /app.html directly, show 404 or redirect
       return new Response("Not Found", { status: 404 });
    }
  }

  return next();
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