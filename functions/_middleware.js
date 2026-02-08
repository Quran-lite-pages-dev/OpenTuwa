//
export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const lowerPath = path.toLowerCase();

  // =========================================================================
  // 1. AUTHENTICATION CHECK
  // =========================================================================
  const cookieHeader = request.headers.get("Cookie");
  const hasPremium = cookieHeader && cookieHeader.includes("TUWA_PREMIUM=true");

  // =========================================================================
  // 2. LOGIN HANDLER
  // =========================================================================
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
  // 3. SECURE MEDIA TUNNEL (The "Proxy")
  // =========================================================================
  if (lowerPath.startsWith('/media/')) {
    
    // Only Premium users allowed to use tunnel
    if (!hasPremium) return new Response("Forbidden: Premium Required", { status: 403 });

    // --- SECURITY CONFIGURATION ---
    // Must match the salt in app.js
    const SECRET_SALT = "TUWA_SECURE_CLOCK_2026"; 
    // Link validity duration (e.g., 12 hours in milliseconds)
    const MAX_AGE_MS = 12 * 60 * 60 * 1000; 

    // Helper: Validate Token
    function validateToken(token) {
      try {
        // Decode Base64 (restore standard Base64 from URL-safe if needed)
        const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = atob(base64);
        const [timestampStr, salt] = decoded.split('|');

        if (!timestampStr || !salt) return false;

        // 1. Check Salt
        if (salt !== SECRET_SALT) return false;

        // 2. Check Time (Clock Alignment)
        const linkTime = parseInt(timestampStr, 10);
        const now = Date.now();
        
        // If link is older than MAX_AGE or from the future (allow small drift)
        if (now - linkTime > MAX_AGE_MS || linkTime - now > 300000) {
          return false; // Expired
        }

        return true;
      } catch (e) {
        return false;
      }
    }

    let realSource = null;
    let requestType = ""; // audio, image, data
    let token = "";
    let filename = "";

    // Parse URL Structure: /media/{type}/{TOKEN}/{filename}
    // parts[0]="" parts[1]="media" parts[2]="type" parts[3]="token" parts[4...]="filename"
    const parts = lowerPath.split('/');

    if (parts.length >= 5) {
      requestType = parts[2]; // 'audio', 'image', 'data'
      token = parts[3];
      // Reconstruct filename (in case it had slashes, though rare for files)
      filename = parts.slice(4).join('/'); 
    } else {
      return new Response("Invalid URL Structure", { status: 400 });
    }

    // --- VALIDATE TOKEN BEFORE PROCEEDING ---
    if (!validateToken(token)) {
      return new Response("Link Expired or Invalid", { status: 410 }); // 410 Gone
    }

    // --- A. AUDIO TUNNEL ---
    if (requestType === 'audio') {
      // Logic: Map filename to CDN
      // Example filename: 001001.mp3 or Reciter/001001.mp3 depending on your logic
      // Assuming flat file for simple example based on your snippet
      realSource = `https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@master/assets/cdn/${filename}`;
    }
    
    // --- B. IMAGE TUNNEL ---
    else if (requestType === 'image') {
      realSource = `https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@master/assets/ui/${filename}`;
    }

    // --- C. DATA TUNNEL (JSON/XML) ---
    else if (requestType === 'data') {
        // Handle translations, configs, etc.
        // Example: /media/data/TOKEN/FTT.XML -> FTT.XML
        // Example: /media/data/TOKEN/ur.junagarhi.xml -> ur.junagarhi.xml
        realSource = `https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@refs/heads/master/assets/data/translations/${filename}`;
    }
    
    else {
      return new Response("Unknown Media Type", { status: 404 });
    }

    // --- FETCH & RETURN ---
    if (realSource) {
      const response = await fetch(realSource, {
        headers: {
          'User-Agent': 'Tuwa-Secure-Proxy/1.0'
        }
      });

      // Clone response to modify headers (CORS, caching) if necessary
      const newResponse = new Response(response.body, response);
      newResponse.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate'); // Prevent browser caching of the secure link itself
      
      return newResponse;
    }
  }

  // =========================================================================
  // 4. PREMIUM PROTECTION (Allow Everything Else)
  // =========================================================================
  if (hasPremium) {
    const protectedFolders = ['/src', '/assets', '/functions', '/locales'];
    const isProtected = protectedFolders.some(folder => lowerPath.startsWith(folder));
    
    const dest = request.headers.get("Sec-Fetch-Dest");
    const isDirectNav = dest === "document" || dest === "frame";

    if (isProtected && isDirectNav) {
      return new Response("Access Denied", { status: 403 });
    }
    return next();
  }

  // DEFAULT: REDIRECT TO LANDING
  if (lowerPath === '/' || lowerPath === '/index.html' || lowerPath === '/app') {
    return env.ASSETS.fetch(request); 
  }

  return new Response("Not Found", { status: 404 });
}