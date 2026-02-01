export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  // --- CONFIGURATION ---
  // Folders containing source code or backend logic that must NEVER be public.
  // CAUTION: Ensure your public CSS/Images are NOT in these folders, or they will break.
  const protectedPaths = ['/src', '/functions', '/locales']; 
  
  // Note: I removed '/assets' and '/style' from the list above. 
  // If your website tries to load <img src="/assets/logo.png"> and you protect '/assets', 
  // the image will break. Only add folders here that contain pure source code.

  // Check for Premium Cookie
  const cookieHeader = request.headers.get("Cookie");
  const hasPremium = cookieHeader && cookieHeader.includes("TUWA_PREMIUM=true");
  
  // Decide which page acts as the "Mask"
  const maskPage = hasPremium ? '/app.html' : '/landing.html';

  // --- 1. STRICT SECURITY BLOCK (HIGHEST PRIORITY) ---
  
  const isProtectedPath = protectedPaths.some(path => url.pathname.startsWith(path));
  
  // Check if this is a browser navigation (address bar)
  const isNavigation = request.headers.get("Sec-Fetch-Dest") === "document";

  if (isProtectedPath) {
    // SCENARIO A: The user types '/src/config.js' in the browser bar.
    // We don't want to show them a 403 error page; we want to redirect/mask 
    // them to the App/Landing page so it feels seamless.
    if (isNavigation) {
      return env.ASSETS.fetch(new URL(maskPage, request.url));
    }

    // SCENARIO B: A script, bot, or hacker tries to fetch '/src/config.js' directly.
    // We STRICTLY BLOCK this. Do not serve the file.
    return new Response("403 Forbidden: Access to source code denied.", { status: 403 });
  }

  // --- 2. STATIC ASSETS & LOGIN ---
  
  // Now that we have handled the protected paths above, we can safely allow standard files.
  // This logic now only applies to folders NOT in 'protectedPaths'.
  if (url.pathname.match(/\.(css|js|png|jpg|ico|xml|mp3|json|woff2)$/) || url.pathname === '/login') {
    return next();
  }

  // --- 3. ROUTING LOGIC (Root Path / SPA Handling) ---

  // A. User is NOT Premium (serve landing)
  if (!hasPremium) {
    if (url.pathname === '/' || url.pathname === '/index.html') {
       return env.ASSETS.fetch(new URL('/landing.html', request.url));
    }
    // Fallback for 404s or unknown routes -> Landing
    return env.ASSETS.fetch(new URL('/landing.html', request.url));
  }

  // B. User IS Premium
  if (hasPremium) {
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return env.ASSETS.fetch(new URL('/app.html', request.url));
    }
    // Fallback for 404s or unknown routes -> App
    // (Optional: You might want to let the App handle routing client-side)
    return env.ASSETS.fetch(new URL('/app.html', request.url));
  }

  return next();
}