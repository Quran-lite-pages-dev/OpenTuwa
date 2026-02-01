import { Ai } from '@cloudflare/ai';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    if (!env.AI) throw new Error("FATAL: 'AI' binding missing.");

    // 1. Safe Parse Input
    let query;
    try {
      const body = await request.json();
      query = body.query;
    } catch (e) {
      return new Response("Invalid JSON", { status: 400 });
    }

    // 2. AI Prompt - Asks for Multiple Results
    const ai = new Ai(env.AI);
    const systemPrompt = `
      You are a Quran search engine.
      Task: Return a JSON Array of chapter numbers (1-114) that match the user's topic.
      - If specific (e.g., "Joseph"), return one: [12]
      - If broad (e.g., "Prophets"), return all relevant: [21, 12, 11, 10, ... ]
      - Order by relevance.
      - STRICTLY return ONLY the JSON array. No text.
    `;

    const response = await ai.run('@cf/meta/llama-4-scout-17b-16e-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ]
    });

    // 3. Clean & Parse AI Output
    let raw = response.response.trim();
    // Remove markdown code blocks if present (e.g. ```json ... ```)
    raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();

    let chapters = [];
    try {
      chapters = JSON.parse(raw);
      // Ensure it's actually an array of numbers
      if (!Array.isArray(chapters)) chapters = [parseInt(raw)];
    } catch (e) {
      // Fallback: try to find any numbers in the string
      const match = raw.match(/\d+/g);
      if (match) chapters = match.map(n => parseInt(n));
    }

    // Filter valid Quran chapters (1-114)
    chapters = chapters.map(n => parseInt(n)).filter(n => !isNaN(n) && n >= 1 && n <= 114);

    return new Response(JSON.stringify({ 
        chapters: chapters, // Return the list
        debug_status: "success" 
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}