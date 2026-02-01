export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  // 1. ROBUST STATIC ASSET CHECK (Case Insensitive)
  // Added fonts, svgs, and webp to be safe
  const isStatic = /\.(css|js|png|jpg|jpeg|ico|xml|mp3|json|woff2|woff|ttf|svg|webp)$/i.test(url.pathname);
  
  if (isStatic || url.pathname === '/login') {
    return next();
  }

  // 2. Check for the Premium Cookie
  const cookieHeader = request.headers.get("Cookie");
  const hasPremium = cookieHeader && cookieHeader.includes("TUWA_PREMIUM=true");

  // 3. Routing Logic
  
  // A. User is NOT Premium -> Serve Landing
  if (!hasPremium) {
    return env.ASSETS.fetch(new URL('/landing.html', request.url));
  }

  // B. User IS Premium -> Serve App
  if (hasPremium) {
    // Intercept root requests and serve app.html
    if (url.pathname === '/' || url.pathname === '/index.html') {
      // ENSURE app.html EXISTS in your project root!
      return env.ASSETS.fetch(new URL('/app.html', request.url));
    }
  }

  return next();
}