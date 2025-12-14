export async function onRequest(context) {
    const { request, env } = context;

    // --- CONFIGURATION ---
    const AI_MODEL = '@cf/meta/llama-3.1-70b-instruct'; 
    const CACHE_TTL = 86400; // 24 Hours

    // 1. CORS HEADERS
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    if (!query || query.length < 2) {
      return new Response(JSON.stringify([]), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 2. CACHE CHECK
    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (response) {
      const newHeaders = new Headers(response.headers);
      newHeaders.set("Access-Control-Allow-Origin", "*");
      return new Response(response.body, { status: response.status, headers: newHeaders });
    }

    // --- STEP 1: AI FILTER (Create Search Query) ---
    // We ask Llama to turn the user's natural language into a better Google keyword query
    let searchQuery = query;
    try {
        const filterResponse = await env.AI.run(AI_MODEL, {
            messages: [
                { 
                    role: 'system', 
                    content: 'You are a keyword optimizer. Convert the user input into a short, specific Google search query related to Islam/Quran. Return ONLY the raw query, no quotes.' 
                },
                { role: 'user', content: `Input: "${query}"` }
            ],
            temperature: 0,
        });
        searchQuery = filterResponse.response.trim();
    } catch (e) {
        // If this fails, just use the original query
        console.error("Filter 1 failed, using original query");
    }

    // --- STEP 2: SEARCH API (Google) ---
    // We fetch real data using the optimized query
    let searchContext = "";
    if (env.GOOGLE_API_KEY && env.GOOGLE_CX) {
        try {
            const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${env.GOOGLE_API_KEY}&cx=${env.GOOGLE_CX}&q=${encodeURIComponent(searchQuery)}`;
            const googleRes = await fetch(googleUrl);
            const googleData = await googleRes.json();
            
            // Extract snippets from the top 5 results
            if (googleData.items && googleData.items.length > 0) {
                searchContext = googleData.items.slice(0, 5).map(item => 
                    `Title: ${item.title}\nSnippet: ${item.snippet}`
                ).join("\n\n");
            }
        } catch (e) {
            console.error("Google Search failed:", e);
        }
    }

    // --- STEP 3: AI FILTER 2 (Final Logic) ---
    // Now we feed the Original Query + The Search Results to the AI
    const systemPrompt = `
      You are a Quranic Search Engine API.
      Your goal is to accept a User Query and Context from the web, and return the most relevant Surah numbers.
      
      Rules:
      1. You must return ONLY a raw JSON array of integers (Surah numbers 1-114).
      2. No markdown, no explanation, no conversational text.
      3. Use the provided "Search Context" to identify specific stories or names if the User Query is vague.
      4. Handle typos (e.g. "Alfatih" -> 1).
      5. Handle topics (e.g. "Alcohol" -> [5, 2, 4]).
      6. Don't limit results, list everything related even 0.1%.
    `;

    const userPrompt = `
      User Query: "${query}"
      Search Context (Real info from Google):
      ${searchContext || "No internet results available, rely on internal knowledge."}
    `;

    let aiResponse = null;
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
        try {
            aiResponse = await env.AI.run(AI_MODEL, {
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0, 
            });
            break; 
        } catch (error) {
            attempts++;
            if (attempts >= maxAttempts) {
                return new Response(JSON.stringify([]), { 
                    status: 200, 
                    headers: { ...corsHeaders, "Content-Type": "application/json" } 
                });
            }
        }
    }

    // Parsing
    const cleanData = extractAndValidateJson(aiResponse.response);

    response = new Response(JSON.stringify(cleanData), {
        headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Cache-Control": `public, max-age=${CACHE_TTL}`
        }
    });

    context.waitUntil(cache.put(cacheKey, response.clone()));

    return response;
}

function extractAndValidateJson(rawText) {
    try {
        const match = rawText.match(/\[[\d,\s]*\]/);
        if (!match) return [];
        let surahs = JSON.parse(match[0]);
        if (!Array.isArray(surahs)) return [];
        return [...new Set(surahs)]
            .map(num => parseInt(num))
            .filter(num => !isNaN(num) && num >= 1 && num <= 114);
    } catch (e) {
        return [];
    }
}
