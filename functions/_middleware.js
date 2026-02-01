export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  // --- CONFIGURATION ---
  // List of protected folders. Users cannot browse these directly.
  const protectedPaths = ['/src', '/assets', '/style', '/functions', '/locales'];

  // Check for Premium Cookie immediately
  const cookieHeader = request.headers.get("Cookie");
  const hasPremium = cookieHeader && cookieHeader.includes("TUWA_PREMIUM=true");
  
  // Decide which page acts as the "Mask" (Interception content)
  const maskPage = hasPremium ? '/app.html' : '/landing.html';

  // --- 1. SECURITY INTERCEPTION LOGIC ---
  
  // Check if the request is for one of the protected folders
  const isProtectedPath = protectedPaths.some(path => url.pathname.startsWith(path));

  // Check if this is a "Navigation" request (User typing URL in browser bar)
  // 'document' means the browser wants to display this as a full page.
  const isNavigation = request.headers.get("Sec-Fetch-Dest") === "document";

  if (isProtectedPath && isNavigation) {
    // SECURITY BLOCK:
    // The user tried to browse a protected folder directly.
    // We INTERCEPT the request. The URL stays the same (e.g. /src/config.js),
    // but we serve the content of the Mask Page (Landing or App).
    return env.ASSETS.fetch(new URL(maskPage, request.url));
  }

  // --- 2. STATIC ASSETS & LOGIN ---
  
  // Now it is safe to pass through assets because we blocked direct user navigation above.
  // This allows the browser to load <img src="/assets/logo.png"> but prevents the user from visiting it.
  if (url.pathname.match(/\.(css|js|png|jpg|ico|xml|mp3|json|woff2)$/) || url.pathname === '/login') {
    return next();
  }

  // --- 3. ROUTING LOGIC (Root Path) ---

  // A. User is NOT Premium (serve landing)
  if (!hasPremium) {
    // If they are at root, serve landing
    if (url.pathname === '/' || url.pathname === '/index.html') {
       return env.ASSETS.fetch(new URL('/landing.html', request.url));
    }
    // Note: If they requested a non-existent page not caught above, we might want 404 or Landing.
    // For high security, default to Landing:
    return env.ASSETS.fetch(new URL('/landing.html', request.url));
  }

  // B. User IS Premium
  if (hasPremium) {
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return env.ASSETS.fetch(new URL('/app.html', request.url));
    }
  }

  return next();
}