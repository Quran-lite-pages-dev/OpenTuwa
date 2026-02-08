export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const lowerPath = path.toLowerCase();

  // =========================================================================
  // 0. FAVICON FIX (Insert this at the top)
  // =========================================================================
  // Browsers often request /favicon.ico automatically. 
  // We rewrite this to your actual icon location so it never 404s.
  if (lowerPath === '/favicon.ico') {
    return env.ASSETS.fetch(new URL('/assets/ui/web.ico', request.url));
  }

  // =========================================================================
  // 1. AUTHENTICATION CHECK
  // =========================================================================
  const cookieHeader = request.headers.get("Cookie");
  const hasPremium = cookieHeader && cookieHeader.includes("TUWA_PREMIUM=true");

  // =========================================================================
  // 2. LOGIN HANDLER (CRITICAL FIX)
  // =========================================================================
  // This actually SETS the cookie when your app calls fetch('/login', {method: 'POST'})
  if (lowerPath === '/login' && request.method === 'POST') {
    return new Response("Activated", {
      status: 200,
      headers: {
        // Set cookie for 1 year, accessible to entire site
        'Set-Cookie': 'TUWA_PREMIUM=true; Path=/; Max-Age=31536000; Secure; HttpOnly; SameSite=Lax',
        'Content-Type': 'text/plain'
      }
    });
  }

  // =========================================================================
  // 3. SECURE MEDIA TUNNEL (The "Proxy")
  // =========================================================================
  if (lowerPath.startsWith('/media/')) {
    
    // Only Premium users allowed to use tunnel
    if (!hasPremium) return new Response("Forbidden", { status: 403 });

    // *** SECURITY COMPATIBILITY FIX ***
    // 1. Parse URL: /media/{type}/{token}/{filename}
    // 2. We split 'path' (case-sensitive) for the token, and 'lowerPath' for filename (legacy behavior)
    const segments = path.split('/');
    const lowerSegments = lowerPath.split('/');
    
    // Check structure: ["", "media", "type", "TOKEN", "filename"]
    if (segments.length < 5) {
        return new Response("Malformed Media URL", { status: 400 });
    }

    const token = segments[3];
    // Join remaining parts to handle filenames with slashes (if any)
    const filename = lowerSegments.slice(4).join('/');

    // 3. Validate Token
    try {
        // Decode Base64 (handle URL-safe chars from app.js)
        const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = atob(base64);
        const [timestamp, salt] = decoded.split('|');

        // Verify Salt matches app.js
        if (salt !== "TUWA_SECURE_CLOCK_2026") {
            return new Response("Invalid Security Token", { status: 403 });
        }
    } catch (e) {
        return new Response("Token Validation Failed", { status: 403 });
    }
    // *** END FIX ***

    let realSource = null;

    // --- A. AUDIO TUNNEL ---
    if (lowerPath.startsWith('/media/audio/')) {
      // FIX: Use extracted 'filename' variable instead of splitting path again
      realSource = `https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@master/assets/cdn/${filename}`;
    }
    
    // --- B. IMAGE TUNNEL ---
    else if (lowerPath.startsWith('/media/image/')) {
      // FIX: Use extracted 'filename' variable
      realSource = `https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@refs/heads/master/assets/images/img/${filename}`;
    }

    // --- C. DATA TUNNEL (JSON/XML) ---
    else if (lowerPath.startsWith('/media/data/')) {
        // Base path for data
        const dataBase = "https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@refs/heads/master/assets/data/translations/";
        
        // Strict security: Only allow specific extensions
        if (filename.endsWith('.json') || filename.endsWith('.xml')) {
            // FIX: Use extracted 'filename' variable
            realSource = `https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@refs/heads/master/assets/data/translations/${filename}`;
        }
    }

    if (realSource) {
      try {
        const originalResponse = await fetch(realSource);
        if (!originalResponse.ok) return new Response("Media Not Found", { status: 404 });

        const newHeaders = new Headers(originalResponse.headers);
        newHeaders.delete('x-github-request-id');
        newHeaders.delete('server');
        newHeaders.set('Access-Control-Allow-Origin', '*'); // Allow App to read data
        newHeaders.set('Cache-Control', 'private, max-age=86400');

        return new Response(originalResponse.body, {
          status: originalResponse.status,
          headers: newHeaders
        });
      } catch (e) {
        return new Response("Upstream Error", { status: 502 });
      }
    }
  }

  // =========================================================================
  // 4. ROOT ROUTING
  // =========================================================================
  if (lowerPath === '/' || lowerPath === '/index.html' || lowerPath === '') {
    const targetPage = hasPremium ? '/app.html' : '/landing.html';
    return env.ASSETS.fetch(new URL(targetPage, request.url));
  }

  // Prevent direct access to HTML files
  if (lowerPath === '/app.html' || lowerPath === '/landing.html') {
    return Response.redirect(new URL('/', request.url), 302);
  }

  // =========================================================================
  // 5. GUEST LOCKDOWN
  // =========================================================================
  // If NOT Premium, block EVERYTHING except Landing Page assets
  if (!hasPremium) {
    const allowedGuestFiles = [
      '/assets/ui/web.png',
      '/assets/ui/web.ico',
      '/assets/ui/apple-touch-icon.png',
      '/assets/ui/logo.png',
      '/styles/index1.css',
      '/styles/inline-styles.css',
      '/functions/login-client.js',
      '/src/components/navigation.js',
      '/favicon.ico',
      '/manifest.json',
      '/src/utils/resolution.js',
      '/src/components/recommendations.js',
      '/src/utils/content-protection.js'
    ];

    const allowedGuestStarts = [
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
  // 6. PREMIUM PROTECTION (Allow Everything Else)
  // =========================================================================
  // If we are here, the user IS Premium. 
  // We only block "Direct Navigation" to source folders to prevent snooping.
  // We MUST allow scripts/images to load normally.
  
  if (hasPremium) {
    const protectedFolders = ['/src', '/assets', '/functions', '/locales'];
    const isProtected = protectedFolders.some(folder => lowerPath.startsWith(folder));
    
    // Check if this is a "Top Level" navigation (typing in address bar)
    const dest = request.headers.get("Sec-Fetch-Dest");
    const isDirectNav = dest === "document";

    if (isProtected && isDirectNav) {
      return Response.redirect(new URL('/', request.url), 302);
    }
  }

  return next();
}