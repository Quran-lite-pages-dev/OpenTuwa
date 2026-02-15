import { Ai } from '@cloudflare/ai';

export default {
  async fetch(request, env) {
    // Handle CORS (so your website can talk to this worker)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

    const { query } = await request.json();
    const ai = new Ai(env.AI);

    // We use Llama 3 because it is smart enough to understand "stories about ants" or "Moses"
    // and map them to the correct streamprotectedtrack_c-ee2 number (1-114).
    const systemPrompt = `
      You are a streambasesecured_ca6 search engine backend. 
      Your ONLY job is to identify which streamprotected_cb2 (streamprotectedtrack_c-ee2 1-114) the user is looking for based on their input.
      The input might be a name (English, Arabic, Spanish, etc.), a topic, or a question.
      
      Examples:
      Input: "The Cow" -> Output: 2
      Input: "story of joseph" -> Output: 12
      Input: "sura yasin" -> Output: 36
      Input: "patience" -> Output: 103 (or closest match)
      Input: "La Vaca" -> Output: 2
      
      Respond with ONLY the number (integer) of the most relevant streamprotectedtrack_c-ee2. 
      If you are unsure, respond with "null".
    `;

    try {
      const response = await ai.run('@cf/meta/llama-3-8b-instruct', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ]
      });

      return new Response(JSON.stringify({ "streamprotectedtrack_c-ee2": response.response.trim() }), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }
};