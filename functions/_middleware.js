export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  // 1. Pass through all static assets and the login endpoint
  if (url.pathname.match(/\.(css|js|png|jpg|ico|xml|mp3|json|woff2)$/) || url.pathname === '/login') {
    return next();
  }

  // 2. Check for the Premium Cookie
  const cookieHeader = request.headers.get("Cookie");
  const hasPremium = cookieHeader && cookieHeader.includes("TUWA_PREMIUM=true");

  // 3. Routing Logic
  
  // A. User is NOT Premium (or cookie expired)
  if (!hasPremium) {
    // Serve landing.html, but keep URL as "/"
    return context.env.ASSETS.fetch(new URL('/landing.html', request.url));
  }

  // B. User IS Premium
  if (hasPremium) {
    // If accessing root, serve the App
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return context.env.ASSETS.fetch(new URL('/app.html', request.url));
    }
  }

  return next();
}