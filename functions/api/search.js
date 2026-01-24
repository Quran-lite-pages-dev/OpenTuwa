// File: functions/api/search.js
// This runs on Cloudflare's server, not the user's browser.

import { Ai } from '@cloudflare/ai';

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { query } = await request.json();

    // If query is empty, return null
    if (!query) return new Response(JSON.stringify({ chapter: null }));

    const ai = new Ai(env.AI);
    
    // Smart Prompt: Teaches the AI how to map "stories" to "numbers"
    const systemPrompt = `
      You are a Quran navigation assistant. 
      Map the user's input to the correct Surah Chapter Number (1-114).
      
      Rules:
      - Input: "The Cow" -> Output: 2
      - Input: "Joseph" -> Output: 12
      - Input: "La Vaca" -> Output: 2 (Handle multiple languages)
      - Input: "Which surah has the ant?" -> Output: 27
      - Input: "Heart of Quran" -> Output: 36
      
      Return ONLY the integer number. If you are unsure or it's gibberish, return "null".
    `;

    const response = await ai.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ]
    });

    const chapterNum = response.response.trim();
    
    return new Response(JSON.stringify({ chapter: chapterNum }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}