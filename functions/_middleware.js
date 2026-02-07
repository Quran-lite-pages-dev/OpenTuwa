export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const lowerPath = path.toLowerCase();

  // --- 1. AUTHENTICATION CHECK ---
  // Check if the user has the Premium cookie
  const cookieHeader = request.headers.get("Cookie");
  const hasPremium = cookieHeader && cookieHeader.includes("TUWA_PREMIUM=true");

  // --- 2. ROOT ROUTING (The "Door") ---
  // This handles the main entry point
  if (lowerPath === '/' || lowerPath === '/index.html' || lowerPath === '') {
    // If Premium: Serve App content
    // If Guest: Serve Landing content
    // URL remains "/" for both, hiding the file name
    const targetPage = hasPremium ? '/app.html' : '/landing.html';
    return env.ASSETS.fetch(new URL(targetPage, request.url));
  }

  // --- 3. EXPLICITLY HIDE THE HTML FILES ---
  // Prevent users from guessing "/app.html" or "/landing.html" directly
  if (lowerPath === '/app.html' || lowerPath === '/landing.html' || lowerPath === '/app') {
    return Response.redirect(new URL('/', request.url), 302);
  }

  // --- 4. GUEST "BLACK HOLE" MODE ---
  // If the user is NOT premium, we pretend nothing else exists.
  if (!hasPremium) {
    
    // LIST A: Files strictly required for 'landing.html' to look good.
    // (I extracted these from your uploaded landing.html code)
    const allowedFiles = [
      '/assets/ui/web.png',
      '/assets/ui/web.ico',
      '/assets/ui/apple-touch-icon.png',
      '/assets/ui/logo.png',
      '/styles/index1.css',
      '/styles/inline-styles.css',
      '/functions/login-client.js',
      '/src/components/navigation.js',
      '/favicon.ico',
      '/manifest.json' // Optional: if you have a PWA manifest
    ];

    // LIST B: API Endpoints needed for login to work
    const allowedStarts = [
      '/login',       // Needed to POST login data
      '/auth/'        // If you use Supabase auth callbacks
    ];

    // Check: Is the requested file in our allowed list?
    const isAllowedFile = allowedFiles.includes(lowerPath);
    // Check: Is it an allowed API endpoint?
    const isAllowedEndpoint = allowedStarts.some(prefix => lowerPath.startsWith(prefix));

    // THE TRAP: If it's not on the list, return 404 (Not Found)
    if (!isAllowedFile && !isAllowedEndpoint) {
      return new Response("Not Found", { status: 404 });
    }
  }

  // --- 5. PREMIUM USER PROTECTION ---
  // Even if they are premium, we don't want them browsing source folders in the address bar.
  // This block ensures they can load the app, but not navigate to folders.
  if (hasPremium) {
    const protectedFolders = ['/src', '/assets', '/functions', '/locales'];
    const isProtectedFolder = protectedFolders.some(folder => lowerPath.startsWith(folder));
    
    // Check if this is a "Navigation" (user typing URL in browser)
    const dest = request.headers.get("Sec-Fetch-Dest");
    const accept = request.headers.get("Accept");
    const isNavigation = dest === "document" || (accept && accept.includes("text/html"));

    // If they try to "visit" a folder, send them home
    if (isProtectedFolder && isNavigation) {
      return Response.redirect(new URL('/', request.url), 302);
    }
  }

  // --- 6. ALLOW ---
  // If we reached here, the request is either:
  // A) A Guest asking for a whitelisted file (logo.png)
  // B) A Premium User accessing the app normally
  return next();
}