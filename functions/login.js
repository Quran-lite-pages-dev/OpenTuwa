export async function onRequestPost(context) {
  const headers = new Headers();
  
  // CHANGED: SameSite=Lax (Better for navigation)
  // NOTE: If you are testing on localhost (http), remove "; Secure" manually, 
  // or the cookie will be rejected by the browser.
  const cookieVal = `TUWA_PREMIUM=true; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=31536000`;

  headers.set("Set-Cookie", cookieVal);
  
  return new Response(JSON.stringify({ status: "activated" }), {
    headers: { 
      ...headers, 
      "Content-Type": "application/json",
      // Add these to force the browser to not cache the response
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    }
  });
}