export async function onRequest(context) {
  // 1. Check if AI binding exists
  if (!context.env.AI) {
    return new Response("Error: AI binding not found", { status: 500 });
  }

  try {
    // 2. Get the audio file from the request
    const formData = await context.request.formData();
    const audioFile = formData.get('file');

    if (!audioFile) {
      return new Response("No audio file uploaded", { status: 400 });
    }

    // 3. Convert File to ArrayBuffer for the AI
    const arrayBuffer = await audioFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer); // Cloudflare AI expects generic arrays or typed arrays

    // 4. Run OpenAI Whisper
    // We use the 'int8' generic model or specifically '@cf/openai/whisper'
    const response = await context.env.AI.run('@cf/openai/whisper-tiny-en', {
      audio: [...uint8Array] // Spread syntax to convert to standard array if needed by specific binding version
    });

    // 5. Return the text
    return new Response(JSON.stringify({ text: response.text }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
