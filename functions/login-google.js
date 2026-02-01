export async function onRequestPost(context) {
  const { request } = context;

  // 1. Parse the Token sent from Android
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response("Bad Request: No JSON found", { status: 400 });
  }

  const idToken = body.token;
  if (!idToken) {
    return new Response("Missing Token", { status: 401 });
  }

  // 2. Verify the Token with Google
  const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
  const googleResponse = await fetch(googleVerifyUrl);

  if (!googleResponse.ok) {
    return new Response(JSON.stringify({ error: "Invalid Token" }), { 
      status: 403,
      headers: { "Content-Type": "application/json" } 
    });
  }

  const googleData = await googleResponse.json();

  // Security Check: Ensure this token was issued for YOUR specific Client ID
  // Replace with your actual Client ID
  const myClientId = "355325321586-gp3o4kiepb7elfrtb0ljq98h06vqvktp.apps.googleusercontent.com";
  
  if (googleData.aud !== myClientId) {
    return new Response(JSON.stringify({ error: "Token Client ID Mismatch" }), { 
      status: 403, 
      headers: { "Content-Type": "application/json" }
    });
  }

  // 3. Success: Create the Premium Cookie
  const url = new URL(request.url);
  const isHttps = url.protocol === 'https:';
  
  const cookieVal = `TUWA_PREMIUM=true; Path=/; ${isHttps ? 'Secure;' : ''} HttpOnly; SameSite=Lax; Max-Age=31536000`;

  return new Response(JSON.stringify({ status: "activated", email: googleData.email }), {
    headers: { 
      "Set-Cookie": cookieVal,
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache"
    }
  });
}