(function() {
    // --- CONFIGURATION ---
    const ANALYTICS_KEY = 'quran_user_analytics';
    // PASTE YOUR GOOGLE AI STUDIO API KEY HERE
    const GOOGLE_API_KEY = 'AIzaSyDGgu0j6-DpquGzbihdgQH-EelxF8uU2PA'; 
    const AI_MODEL = 'gemini-2.0-flash-exp'; // Using the latest experimental flash model
    
    // --- 1. GOOGLE GEMINI HELPER ---
    // Instead of loading a script, we use a direct fetch to the API to ensure 
    // we can strictly control the "Tools" (Web Search) for every request.
    async function callGemini(systemPrompt, userPrompt) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`;
        
        const payload = {
            // System instructions set the behavior (Search Engine, Validator, etc.)
            system_instruction: {
                parts: [{ text: systemPrompt }]
            },
            // The user's actual query
            contents: [{
                role: "user",
                parts: [{ text: userPrompt }]
            }],
            // >> FORCE WEB CONNECTION <<
            // This tool config forces Gemini to use Google Search
            tools: [
                { google_search: {} } 
            ]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Gemini API Error: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Extract text from Gemini's specific response structure
        // candidates[0].content.parts[0].text
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    }

    // --- 2. VIRTUAL BACKEND (INTERCEPTOR) ---
    const originalFetch = window.fetch;
    window.fetch = async function(input, init) {
        const url = typeof input === 'string' ? input : input.url;

        // >> INTERCEPT: SEARCH
        if (url.includes('/api/search') && url.includes('q=')) {
            const query = new URL('https://Quran-lite.pages.dev' + url).searchParams.get('q');
            return handleSearch(query);
        }

        // >> INTERCEPT: RECOMMENDATIONS
        if ((url.includes('/api/recommend') || url.includes('ai-recommendations')) && init && init.method === 'POST') {
            const body = JSON.parse(init.body);
            return handleRecommendations(body);
        }

        // >> INTERCEPT: NAME VALIDATION
        if (url.includes('/api/validate-name') && init && init.method === 'POST') {
            const body = JSON.parse(init.body);
            return handleValidateName(body.name);
        }

        return originalFetch(input, init);
    };

    // --- 3. AI LOGIC (Powered by Gemini 2.0 + Google Search) ---

    async function handleSearch(query) {
        if (!query || query.length < 2) return new Response("[]", { headers: { 'Content-Type': 'application/json' }});
        
        const systemPrompt = `
            You are a Quranic Search Engine connected to Google Search.
            Task: detailed search for "${query}" on the web to find relevant Quranic context, then map it to Surah numbers (1-114).
            Rules: Return ONLY a raw JSON array of integers. Example: [2, 18, 110].
        `;

        try {
            // We pass the query as the prompt to trigger the grounding
            const textResponse = await callGemini(systemPrompt, `Find Surahs related to: ${query}`);
            const cleanJson = extractJsonArray(textResponse);
            return new Response(JSON.stringify(cleanJson), { headers: { 'Content-Type': 'application/json' } });
        } catch (e) {
            console.error("Gemini Search Error:", e);
            return new Response("[]", { headers: { 'Content-Type': 'application/json' } });
        }
    }

    async function handleRecommendations(data) {
        const lastPlayed = data.last_played || 'None';
        const searchHistory = (data.search_history || []).join(', ');

        const systemPrompt = `
            You are a Quran Recommendation Engine with real-time web access.
            Task: Analyze this user history and use Google Search to find trending or topically relevant Surahs matches.
            User History -> Last Played: ${lastPlayed}. Searches: ${searchHistory}.
            Output: ONLY a raw JSON array of 3-5 integers. Example: [36, 67, 1]
        `;

        try {
            const textResponse = await callGemini(systemPrompt, "Recommend Surahs based on this history.");
            const cleanJson = extractJsonArray(textResponse);
            return new Response(JSON.stringify(cleanJson), { headers: { 'Content-Type': 'application/json' } });
        } catch (e) {
            console.error("Gemini Recs Error:", e);
            return new Response("[]", { headers: { 'Content-Type': 'application/json' } });
        }
    }

    async function handleValidateName(name) {
        const systemPrompt = `
            You are a Name Validator with access to Google Search.
            Task: Search the web to check if the name "${name}" has offensive, profane, or shirk meanings in English, Arabic, or Malay.
            Strictly allow common names like "Abdullah", "Muhammad".
            Output JSON ONLY: { "safe": boolean, "reason": "string" }
        `;

        try {
            const textResponse = await callGemini(systemPrompt, `Check this name: ${name}`);
            
            // Clean extraction of JSON
            const first = textResponse.indexOf('{');
            const last = textResponse.lastIndexOf('}');
            const jsonStr = (first !== -1 && last !== -1) ? textResponse.substring(first, last + 1) : JSON.stringify({ safe: true });

            return new Response(jsonStr, { headers: { 'Content-Type': 'application/json' } });
        } catch (e) {
            console.error("Gemini Validate Error:", e);
            return new Response(JSON.stringify({ safe: true }), { headers: { 'Content-Type': 'application/json' } });
        }
    }

    // --- 4. HELPERS ---
    function extractJsonArray(text) {
        if (typeof text !== 'string') return [];
        // Matches [1, 2, 3] or [ "1", "2" ] formats
        const match = text.match(/\[[\d,\s"']*\]/);
        if (match) {
            try {
                return JSON.parse(match[0]);
            } catch (e) { return []; }
        }
        return [];
    }

    // --- 5. UI LOGIC (Unchanged) ---
    async function initUI() {
        const AI_SECTION_ID = 'ai-section';
        const AI_ROW_ID = 'ai-row';
        const section = document.getElementById(AI_SECTION_ID);
        
        if (section) {
            const data = JSON.parse(localStorage.getItem(ANALYTICS_KEY)) || { reads: [], searches: [] };
            if (data.reads.length === 0 && data.searches.length === 0) return;

            try {
                const res = await fetch('/api/ai-recommendations', {
                    method: 'POST',
                    body: JSON.stringify({ last_played: data.reads.slice(-1)[0], search_history: data.searches })
                });
                const ids = await res.json();
                renderCards(ids, AI_ROW_ID);
                section.style.display = 'block';
            } catch(e) {}
        }
    }

    function renderCards(ids, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !window.quranData) return;
        container.innerHTML = '';
        ids.forEach(id => {
            const surah = window.quranData.find(s => s.chapterNumber === id);
            if (surah) {
                const card = document.createElement('div');
                card.className = 'surah-card ai-card-border';
                card.innerHTML = `<div class="card-title">${surah.title}</div>`;
                card.onclick = () => window.launchPlayer(surah.chapterNumber, 1);
                container.appendChild(card);
            }
        });
    }

    window.addEventListener('load', initUI);

})();
