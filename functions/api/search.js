export async function onRequest(context) {
    const { request, env } = context;

    // --- CONFIGURATION ---
    // Use the newest 8b model for better reasoning, or stick to llama-3 if preferred
    const AI_MODEL = '@cf/meta/llama-3.1-8b-instruct'; 
    const CACHE_TTL = 86400; // Cache results for 24 Hours (Important for stability)

    // 1. CORS HEADERS
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // 2. PREFLIGHT CHECK
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    // Fast exit for empty queries
    if (!query || query.length < 2) {
      return new Response(JSON.stringify([]), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 3. CACHE CHECK (The "Overload" Preventer)
    // If this query exists in cache, return it immediately.
    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (response) {
      // Re-apply CORS headers to cached response
      const newHeaders = new Headers(response.headers);
      newHeaders.set("Access-Control-Allow-Origin", "*");
      return new Response(response.body, {
        status: response.status,
        headers: newHeaders
      });
    }

    // 4. SYSTEM PROMPT (Strictly Unchanged Rules, reinforced structure)
    const systemPrompt = `
      You are a Quranic Search Engine API.
      Your goal is to accept a User Query (which might be a topic, a story, a specific name with typos, or a concept) and return the most relevant Surah numbers.
      
      Rules:
      1. You must return ONLY a raw JSON array of integers (Surah numbers 1-114).
      2. No markdown, no explanation, no conversational text.
      3. Handle typos (e.g. "Alfatih" -> 1).
      4. Handle topics (e.g. "Alcohol" -> [5, 2, 4]).
      5. Handle stories (e.g. "Moses sea" -> [26, 20, 10]).
      6. Don't limit any results, list as much as you can and what you think must be related even 0.1%.
      7. Handle any outside box things such theory conspiracies or etc that really much related.
      8. Handle any questions even the question really billion hard that can relate to any chapters.
    `;

    const userPrompt = `User Query: "${query}"`;

    // 5. RUN AI WITH RETRY LOGIC (The "Service Unavailable" Fix)
    let aiResponse = null;
    let attempts = 0;
    const maxAttempts = 2; // Try twice before giving up

    while (attempts < maxAttempts) {
        try {
            aiResponse = await env.AI.run(AI_MODEL, {
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                // CRITICAL FIX: Temperature 0 forces the AI to be "Deterministic"
                // This stops the results from changing (3 results -> 15 results -> 6 results)
                temperature: 0, 
            });
            break; // If successful, exit loop
        } catch (error) {
            attempts++;
            console.error(`Attempt ${attempts} failed:`, error);
            if (attempts >= maxAttempts) {
                // If all retries fail, return empty array cleanly (don't crash the frontend)
                return new Response(JSON.stringify([]), { 
                    status: 200, 
                    headers: { ...corsHeaders, "Content-Type": "application/json" } 
                });
            }
        }
    }

    // 6. ROBUST PARSING (The "Cant Display" Fix)
    // We clean the output so "Here is the list [1,2]" becomes just [1,2]
    const cleanData = extractAndValidateJson(aiResponse.response);

    // 7. RETURN & CACHE
    response = new Response(JSON.stringify(cleanData), {
        headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Cache-Control": `public, max-age=${CACHE_TTL}`
        }
    });

    // Save to Cloudflare cache so we don't ask AI next time
    context.waitUntil(cache.put(cacheKey, response.clone()));

    return response;
}

/**
 * HELPER: Extracts array from text and ensures valid Surah numbers (1-114)
 */
function extractAndValidateJson(rawText) {
    try {
        // Regex finds the first JSON array in the text
        const match = rawText.match(/\[[\d,\s]*\]/);
        if (!match) return [];

        let surahs = JSON.parse(match[0]);
        
        if (!Array.isArray(surahs)) return [];

        // Filter: Must be number, 1-114, remove duplicates
        return [...new Set(surahs)]
            .map(num => parseInt(num))
            .filter(num => !isNaN(num) && num >= 1 && num <= 114);

    } catch (e) {
        return [];
    }
}
