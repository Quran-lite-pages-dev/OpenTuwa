export default {
  async fetch(request, env) {
    const { query } = await request.json();

    // 1. Convert user query (e.g., "verse about patience") into a vector (embedding)
    const userVector = await env.AI.run('@cf/baai/bge-small-en-v1.5', {
      text: [query]
    });

    // 2. Search your database (Vectorize or D1) for the closest match
    // For a simple version, we can compare the query against a list of Surah descriptions
    // If you have many verses, use Cloudflare Vectorize.
    
    // Simple logic: return AI-refined keywords to the frontend
    const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
      prompt: `Identify the Quranic Surah or Chapter number for: "${query}". 
               Return ONLY the chapter number as a single integer.`
    });

    return new Response(JSON.stringify({ chapter: aiResponse.response.trim() }));
  }
}