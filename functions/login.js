export async function onRequestPost(context) {
  const url = new URL(context.request.url);
  // Always use Secure if on HTTPS. 
  // If you are on localhost (http), the browser simply ignores 'Secure', which is safer than complex logic.
  const isHttps = url.protocol === 'https:';
  
  // 1. Force Path=/ to ensure it covers the whole site
  // 2. Use SameSite=Lax to allow top-level navigation usage
  const cookieVal = `TUWA_PREMIUM=true; Path=/; ${isHttps ? 'Secure;' : ''} HttpOnly; SameSite=Lax; Max-Age=31536000`;

  return new Response(JSON.stringify({ status: "activated" }), {
    headers: { 
      "Set-Cookie": cookieVal,
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache"
    }
  });
}