export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const lowerPath = url.pathname.toLowerCase();

  // --- 1. CONFIGURATION ---
  // Folders that are strictly protected.
  const protectedPaths = ['/src', '/assets', '/style', '/functions', '/locales'];

  // --- 2. SECURITY TRAP (Source Code & Assets) ---
  const isProtectedPath = protectedPaths.some(path => lowerPath.startsWith(path));
  
  // Detect if this is a "Navigation" (Browser loading a page)
  const dest = request.headers.get("Sec-Fetch-Dest");
  const accept = request.headers.get("Accept");
  const isNavigation = dest === "document" || (accept && accept.includes("text/html"));

  if (isProtectedPath && isNavigation) {
    return Response.redirect(new URL('/', request.url), 302);
  }

  // --- 3. THE "APP" TRAP (CRITICAL FIX) ---
  // This explicitly blocks direct access to /app or /app.html
  // If a user types "/app", we force them back to "/"
  // This ensures the file is NEVER served directly, only via the Root rewrite below.
  if (lowerPath === '/app' || lowerPath === '/app.html') {
     return Response.redirect(new URL('/', request.url), 302);
  }

  // --- 4. AUTHENTICATION ---
  const cookieHeader = request.headers.get("Cookie");
  const hasPremium = cookieHeader && cookieHeader.includes("TUWA_PREMIUM=true");

  // --- 5. ROUTING (Root Path Only) ---
  // This is the ONLY place where app.html is allowed to exist.
  if (lowerPath === '/' || lowerPath === '/index.html' || lowerPath === '') {
    // If Premium: Serve App content, but keep URL as "/"
    // If Guest: Serve Landing content, keep URL as "/"
    const targetPage = hasPremium ? '/app.html' : '/landing.html';
    return env.ASSETS.fetch(new URL(targetPage, request.url));
  }

  // --- 6. PASSTHROUGH ---
  // For safe static assets (images, css, etc.)
  return next();
}