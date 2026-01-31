export async function onRequestPost(context) {
  const headers = new Headers();
  
  // Set a secure, HTTP-only cookie that JavaScript cannot access or delete
  const cookieVal = `TUWA_PREMIUM=true; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=31536000`;

  headers.set("Set-Cookie", cookieVal);
  
  return new Response(JSON.stringify({ status: "activated" }), {
    headers: { ...headers, "Content-Type": "application/json" }
  });
}