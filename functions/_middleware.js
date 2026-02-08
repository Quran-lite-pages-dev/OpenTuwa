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
  // 3. SECURE MEDIA TUNNEL (Time-Based Encryption)
  // =========================================================================
  // Target URL: /media/(type)/TOKEN/filename.ext
  if (lowerPath.startsWith('/media/')) {
    
    // A. CONFIG: Must match app.js
    const SECRET_KEY = "999"; 
    const ALLOW_WINDOW_MS = 60000; // 1 minute validity

    // B. PARSE URL
    // Expected: ["", "media", "audio", "TOKEN_HERE", "001001.mp3"]
    const parts = path.split('/');
    
    // Check if structure matches secured pattern (5 parts)
    // If it's a "naked" access (e.g. /media/audio/file.mp3), we BLOCK it
    if (parts.length < 5) {
      return new Response("Forbidden: Direct Access Denied", { status: 403 });
    }

    const mediaType = parts[2]; // audio, images, data
    const token = parts[3];
    const fileName = parts[4];
    
    // C. VALIDATION LOGIC
    try {
      // 1. Decrypt Token (Base64 -> XOR)
      const decodedStr = atob(token);
      let decrypted = "";
      for (let i = 0; i < decodedStr.length; i++) {
        decrypted += String.fromCharCode(decodedStr.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
      }

      // 2. Parse Payload "TIMESTAMP|FILENAME"
      const [expiryStr, linkedFile] = decrypted.split('|');
      const expiryTime = parseInt(expiryStr);

      // 3. Security Checks
      const now = Date.now();

      // Check A: Is token expired?
      if (now > expiryTime) {
         return new Response("Link Expired", { status: 410 });
      }

      // Check B: Does token belong to THIS file? (Prevents swapping tokens)
      if (linkedFile !== fileName) {
         return new Response("Invalid Token Signature", { status: 403 });
      }
      
      // Check C: Is it too far in the future? (Clock skew protection)
      if (expiryTime > (now + ALLOW_WINDOW_MS + 5000)) {
         return new Response("Invalid Time", { status: 400 });
      }

    } catch (e) {
      return new Response("Malformation Error", { status: 400 });
    }

    // D. REWRITE & SERVE
    // We rewrite the URL to point to the ACTUAL location on the server/storage
    // Assuming your actual files are stored at /media/type/filename
    // We strip the token out of the path for the internal fetch
    const hiddenUrl = new URL(request.url);
    hiddenUrl.pathname = `/media/${mediaType}/${fileName}`; // Skips the token part

    // Use env.ASSETS.fetch to get the static file securely
    return env.ASSETS.fetch(new Request(hiddenUrl, request));
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