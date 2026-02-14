export async function onRequestPost(context) {
  const url = new URL(context.request.url);
  const isHttps = url.protocol === 'https:';
  
  // 1. Set the Premium Cookie
  const cookieVal = `TUWA_PREMIUM=true; Path=/; ${isHttps ? 'Secure;' : ''} HttpOnly; SameSite=Lax; Max-Age=31536000`;

  return new Response(JSON.stringify({ status: "activated" }), {
    headers: { 
      "Set-Cookie": cookieVal,
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache"
    }
  });
}