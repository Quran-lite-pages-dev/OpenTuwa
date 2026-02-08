// _middleware.js

/**
 * Helper: Generate HMAC-SHA256 Signature
 * Uses Web Crypto API available in Cloudflare Workers
 */
async function generateSignature(data, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  // Convert buffer to Hex string
  return [...new Uint8Array(signature)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const lowerPath = path.toLowerCase();

  // SECRET: Still needed for Media Tokens (Keep this hidden!)
  const SECRET_KEY = env.SECRET_KEY || "dk29s-29sk2-10sk2-xm102";

  // =========================================================================
  // 0. FAVICON FIX
  // =========================================================================
  if (lowerPath === '/favicon.ico') {
    return env.ASSETS.fetch(new URL('/assets/ui/web.ico', request.url));
  }

  // =========================================================================
  // 1. AUTHENTICATION CHECK
  // =========================================================================
  const cookieHeader = request.headers.get("Cookie");
  const hasPremium = cookieHeader && cookieHeader.includes("TUWA_PREMIUM=true");

  // =========================================================================
  // 2. LOGIN HANDLER (REVERTED TO OLD BEHAVIOR)
  // =========================================================================
  // No password check. Just requires a POST request to activate.
  if (lowerPath === '/login' && request.method === 'POST') {
    return new Response("Activated", {
      status: 200,
      headers: {
        'Set-Cookie': 'TUWA_PREMIUM=true; Path=/; Max-Age=31536000; Secure; HttpOnly; SameSite=Lax',
        'Content-Type': 'text/plain'
      }
    });
  }

  // =========================================================================
  // 3. TOKEN GENERATION (Secure Server-Side)
  // =========================================================================
  // The client calls this to get a signed token for media access.
  // This still requires the cookie from step 2.
  if (lowerPath === '/api/auth/token') {
    if (!hasPremium) return new Response("Unauthorized", { status: 401 });

    // Token Validity: 1 Hour
    const expiration = Date.now() + (60 * 60 * 1000);
    const dataToSign = `${expiration}`;
    const signature = await generateSignature(dataToSign, SECRET_KEY);
    
    // Token Format: timestamp|signature
    const token = btoa(`${expiration}|${signature}`);

    return new Response(JSON.stringify({ token: token }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // =========================================================================
  // 4. SECURE MEDIA TUNNEL
  // =========================================================================
  if (lowerPath.startsWith('/media/')) {
    
    // 1. Parse URL: /media/{type}/{token}/{filename}
    const segments = path.split('/');
    const lowerSegments = lowerPath.split('/');

    if (segments.length < 5) {
        return new Response("Malformed Media URL", { status: 400 });
    }

    const tokenRaw = segments[3];
    const filename = lowerSegments.slice(4).join('/'); 

    // 2. Validate Token
    try {
        const base64 = tokenRaw.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = atob(base64);
        const [expStr, sig] = decoded.split('|');

        // A. Check Expiration
        if (Date.now() > parseInt(expStr)) {
            return new Response("Token Expired", { status: 410 });
        }

        // B. Verify Signature (Re-sign and compare)
        const expectedSig = await generateSignature(expStr, SECRET_KEY);
        if (sig !== expectedSig) {
            return new Response("Invalid Signature", { status: 403 });
        }

    } catch (e) {
        return new Response("Token Validation Failed", { status: 403 });
    }

    // 3. Fetch Content (If token is valid)
    let realSource = null;

    if (lowerPath.startsWith('/media/audio/')) {
    realSource = `https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@master/assets/cdn/${filename}`;
} else if (lowerPath.startsWith('/media/image/')) {
    realSource = `https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@refs/heads/master/assets/images/img/${filename}`;
}

    if (realSource) {
        const response = await fetch(realSource);
        const newHeaders = new Headers(response.headers);
        newHeaders.set("Access-Control-Allow-Origin", "*");
        // Hide Source
        newHeaders.delete("x-github-request-id");
        newHeaders.delete("via");
        
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });
    }

    return new Response("Media Type Not Found", { status: 404 });
  }

  // =========================================================================
  // 5. GUEST ACCESS & FALLBACK
  // =========================================================================
  if (!hasPremium) {
    // Note: This list was from the new version. 
    // If you need the longer list from your old file, paste it here.
    const allowedGuestFiles = [
      '/', '/landing.html', '/style.css', '/app.js', 
      '/login-client.js', '/src/components/navigation.js', 
      '/favicon.ico', '/manifest.json'
    ];
    const allowedGuestStarts = ['/login', '/api/config', '/auth/'];
    
    const isAllowed = allowedGuestFiles.includes(lowerPath) || 
                      allowedGuestStarts.some(prefix => lowerPath.startsWith(prefix));

    if (!isAllowed) return new Response("Not Found", { status: 404 });
  }

  return next();
}