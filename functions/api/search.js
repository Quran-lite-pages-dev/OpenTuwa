import { Ai } from '@cloudflare/ai';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // 1. Check if AI Binding exists
    if (!env.AI) {
        throw new Error("FATAL: 'AI' binding is missing in Cloudflare Dashboard!");
    }

    const { query } = await request.json();

    // 2. Debug Log (Visible in Cloudflare Logs)
    console.log("Received Query:", query);

    const ai = new Ai(env.AI);
    
    const systemPrompt = `
      You are a helper. Return ONLY the chapter number (1-114) for the user's input.
      Input: "The Cow" -> Output: 2
      If unsure, return "null".
    `;

    const response = await ai.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ]
    });

    // 3. Check what AI actually returned
    console.log("AI Raw Response:", response);

    return new Response(JSON.stringify({ 
        chapter: response.response.trim(),
        debug_status: "success" 
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    // Return the error to the browser so you can see it in Network Tab
    return new Response(JSON.stringify({ 
        error: e.message, 
        stack: e.stack 
    }), { status: 500 });
  }
}