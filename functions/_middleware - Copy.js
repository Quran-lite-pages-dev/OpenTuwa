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
  // 3. SECURE MEDIA TUNNEL (The "Proxy")
  // =========================================================================
  // This handles requests to /media/... and fetches the real content from jsdelivr.
  // The browser NEVER sees the jsdelivr URL.
  
  if (lowerPath.startsWith('/media/')) {
    
    // RULE 1: Only Premium users allowed.
    if (!hasPremium) return new Response("Not Found", { status: 404 });

    // RULE 2: Anti-Scrape.
    // If a user tries to open an MP3/JSON directly in a tab, block it.
    // It must be requested by the page (dest="audio", "image", "empty", etc.)
    if (isDirectNav) return new Response("Access Denied", { status: 403 });

    let realSource = null;

    // --- A. AUDIO TUNNEL ---
    // Matches logic in app.js: /assets/cdn/${padCh}${padV}.mp3
    // Incoming: /media/audio/001001.mp3
    if (lowerPath.startsWith('/media/audio/')) {
      const filename = lowerPath.split('/media/audio/')[1];
      // Source from your app.js logic
      realSource = `https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@master/assets/cdn/${filename}`;
    }
    
    // --- B. IMAGE TUNNEL ---
    // Matches logic in app.js: /assets/images/img/${chNum}_${vNum}.png
    // Incoming: /media/image/1_1.png
    else if (lowerPath.startsWith('/media/image/')) {
      const filename = lowerPath.split('/media/image/')[1];
      // Source from your app.js logic (using refs/heads/master)
      realSource = `https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@refs/heads/master/assets/images/img/${filename}`;
    }

    // --- C. DATA TUNNEL (JSON/XML) ---
    // Matches logic in config.js and app.js
    // Incoming: /media/data/en.xml OR /media/data/2TM3TM.json
    else if (lowerPath.startsWith('/media/data/')) {
        const filename = lowerPath.split('/media/data/')[1];
        
        // Base path from your code
        const dataBase = "https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@refs/heads/master/assets/data/translations/";
        
        // Check strict extensions to prevent probing
        if (filename.endsWith('.json') || filename.endsWith('.xml')) {
            realSource = `${dataBase}${filename}`;
        }
    }

    // --- FETCH & RETURN ---
    if (realSource) {
      try {
        const originalResponse = await fetch(realSource);

        if (!originalResponse.ok) return new Response("Media Error", { status: 404 });

        // SANITIZE HEADERS: Hide the fact it came from GitHub/JSDelivr
        const newHeaders = new Headers(originalResponse.headers);
        newHeaders.delete('x-github-request-id');
        newHeaders.delete('access-control-allow-origin');
        newHeaders.delete('server');
        newHeaders.delete('x-cache');
        newHeaders.delete('x-served-by');
        
        // Force the browser to treat it as a resource, not a download
        newHeaders.set('Content-Disposition', 'inline'); 
        // Cache it privately so it doesn't get stuck in shared caches
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