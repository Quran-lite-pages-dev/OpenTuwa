export async function onRequestPost(context) {
  const url = new URL(context.request.url);
  const isHttps = url.protocol === 'https:';
  
  // This is the magic ticket that the Middleware looks for
  const cookieVal = `TUWA_PREMIUM=true; Path=/; ${isHttps ? 'Secure;' : ''} HttpOnly; SameSite=Lax; Max-Age=31536000`;

  return new Response(JSON.stringify({ status: "activated" }), {
    headers: { 
      "Set-Cookie": cookieVal,
      "Content-Type": "application/json"
    }
  });
}