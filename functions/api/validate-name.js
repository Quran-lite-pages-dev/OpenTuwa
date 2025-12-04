export async function onRequestPost(context) {
    const { request, env } = context;

    // 1. Get User Input
    let body;
    try {
        body = await request.json();
    } catch (e) {
        return new Response(JSON.stringify({ safe: false, reason: "Invalid JSON input" }), { headers: { "Content-Type": "application/json" }});
    }
    const nameToCheck = body.name || "";

    // 2. The Instructions (System Prompt)
    const systemPrompt = `
    You are a content safety filter.
    Task: specific check of the user's name.

    FORBIDDEN CATEGORIES:
    1. Profanity/Insults (English, Arabic, Malay).
    2. Polytheism/Shirk (e.g. "I am God", "Allah", "Lat", "Uzza", "Hubal", "Zeus").
    3. Disrespect toward religion.
    
    Strictly allow common names like "Abdullah", "Muslim", "Muhammad" unless used offensively.

    OUTPUT:
    Return ONLY raw JSON. No markdown formatting. No intro text.
    Format: { "safe": boolean, "reason": "short explanation" }
    `;

    try {
        // 3. Ask the AI
        const aiResult = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Check this name: "${nameToCheck}"` }
            ]
        });

        // --- THE FIX STARTS HERE ---
        
        // The AI result comes wrapped in a "response" string. 
        // Example: { response: "{\n \"safe\": true ... }" }
        const rawText = aiResult.response || "";

        // We use a "Substring" trick to find the JSON inside the text.
        // This handles cases where the AI says "Here is the JSON: { ... }"
        const firstCurly = rawText.indexOf('{');
        const lastCurly = rawText.lastIndexOf('}');

        if (firstCurly !== -1 && lastCurly !== -1) {
            // Extract just the clean JSON part
            const cleanJsonString = rawText.substring(firstCurly, lastCurly + 1);
            
            // Send ONLY the clean JSON to your website
            return new Response(cleanJsonString, {
                headers: { "Content-Type": "application/json" }
            });
        } else {
            // Fallback: If AI spoke nonsense, fail safely (or block it)
            return new Response(JSON.stringify({ safe: true, reason: "AI output unclear, allowing." }), {
                headers: { "Content-Type": "application/json" }
            });
        }
        // --- THE FIX ENDS HERE ---

    } catch (err) {
        // If the AI service is down completely
        return new Response(JSON.stringify({ safe: true, warning: "AI_OFFLINE" }), {
            headers: { "Content-Type": "application/json" }
        });
    }
}
