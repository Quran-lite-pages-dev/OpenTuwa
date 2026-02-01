export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  // --- 1. CONFIGURATION ---
  // Define folders users should never see in the browser address bar.
  const protectedPaths = ['/src', '/assets', '/style', '/functions', '/locales'];

  // --- 2. ROBUST SECURITY TRAP ---
  
  // FIX 1: Case Insensitivity
  // Convert path to lowercase strictly for the check.
  // This prevents '/SRC/app.js' from bypassing the filter.
  const lowerPath = url.pathname.toLowerCase();
  
  // Check if the user is touching a protected folder
  const isProtectedPath = protectedPaths.some(path => lowerPath.startsWith(path));

  // Check if this is a "Navigation" (Human using browser) vs "Subresource" (App loading script)
  // - Sec-Fetch-Dest: 'document' is the modern standard for top-level navigation.
  // - Accept: 'text/html' catches older browsers or direct navigation attempts.
  const dest = request.headers.get("Sec-Fetch-Dest");
  const accept = request.headers.get("Accept");
  const isNavigation = dest === "document" || (accept && accept.includes("text/html"));

  if (isProtectedPath && isNavigation) {
    // FIX 2: The Redirect (Solves the "Indexless" / Broken CSS Bug)
    // We do NOT serve the file. We do NOT rewrite.
    // We bounce the user back to the Root URL.
    // Result: URL changes to '/', Landing Page loads, CSS works perfectly.
    return Response.redirect(new URL('/', request.url), 302);
  }

  // --- 3. AUTHENTICATION ---
  const cookieHeader = request.headers.get("Cookie");
  const hasPremium = cookieHeader && cookieHeader.includes("TUWA_PREMIUM=true");

  // --- 4. ROUTING (Root Path) ---
  
  // Only handle the exact root or index.html
  if (lowerPath === '/' || lowerPath === '/index.html' || lowerPath === '') {
    // Serve the "Mask" page based on auth status
    const targetPage = hasPremium ? '/app.html' : '/landing.html';
    return env.ASSETS.fetch(new URL(targetPage, request.url));
  }

  // --- 5. PASSTHROUGH ---
  // If we are here, it is a safe asset request (e.g. your app.html loading app.js).
  return next();
}