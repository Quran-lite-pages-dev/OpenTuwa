(function() {
    // --- CONFIGURATION ---
    const ANALYTICS_KEY = 'quran_user_analytics';
    const PUTER_SCRIPT_URL = 'https://js.puter.com/v2/';
    const AI_MODEL = 'gpt-5.2'; // Using the advanced model you wanted
    
    // --- 1. LOAD PUTER.JS DYNAMICALLY ---
    // Since we inject this script everywhere, we must ensure Puter loads first
    function loadPuter() {
        return new Promise((resolve, reject) => {
            if (window.puter) return resolve();
            const script = document.createElement('script');
            script.src = PUTER_SCRIPT_URL;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Puter.js"));
            document.head.appendChild(script);
        });
    }

    // --- 2. VIRTUAL BACKEND (INTERCEPTOR) ---
    // This catches requests from ANY page (Homepage, Reading, etc.)
    // and handles them right here in the browser.
    const originalFetch = window.fetch;
    window.fetch = async function(input, init) {
        const url = typeof input === 'string' ? input : input.url;

        // >> INTERCEPT: SEARCH (from your old search.js)
        if (url.includes('/api/search') && url.includes('q=')) {
            const query = new URL('https://Quran-lite.pages.dev' + url).searchParams.get('q');
            return handleSearch(query);
        }

        // >> INTERCEPT: RECOMMENDATIONS (from your old recommendations.js)
        // Your code calls '/api/ai-recommendations' or '/api/recommend'
        if ((url.includes('/api/recommend') || url.includes('ai-recommendations')) && init && init.method === 'POST') {
            const body = JSON.parse(init.body);
            return handleRecommendations(body);
        }

        // >> INTERCEPT: NAME VALIDATION (from your old validate-name.js)
        if (url.includes('/api/validate-name') && init && init.method === 'POST') {
            const body = JSON.parse(init.body);
            return handleValidateName(body.name);
        }

        // Default: Let normal requests (images, css) pass to the real internet
        return originalFetch(input, init);
    };

    // --- 3. AI LOGIC (Powered by Puter.js) ---

    async function handleSearch(query) {
        if (!query || query.length < 2) return new Response("[]", { headers: { 'Content-Type': 'application/json' }});
        
        await loadPuter();
        const systemPrompt = `
            You are a Quranic Search Engine. Query: "${query}"
            Task: Return relevant Surah numbers (1-114).
            Rules: Return ONLY a raw JSON array of integers. Example: [2, 18, 110]
        `;

        try {
            const response = await puter.ai.chat(systemPrompt, { model: AI_MODEL, temperature: 0.0 });
            const cleanJson = extractJsonArray(response?.message?.content || response);
            return new Response(JSON.stringify(cleanJson), { headers: { 'Content-Type': 'application/json' } });
        } catch (e) {
            return new Response("[]", { headers: { 'Content-Type': 'application/json' } });
        }
    }

    async function handleRecommendations(data) {
        await loadPuter();
        const lastPlayed = data.last_played || 'None';
        const searchHistory = (data.search_history || []).join(', ');

        const prompt = `
            You are a Quran Recommendation Engine.
            History: Last Played Surah: ${lastPlayed}. Searches: ${searchHistory}.
            Task: Recommend 3 to 5 relevant Surah numbers (1-114).
            Output: ONLY a raw JSON array of integers. Example: [36, 67, 1]
        `;

        try {
            const response = await puter.ai.chat(prompt, { model: AI_MODEL });
            const cleanJson = extractJsonArray(response?.message?.content || response);
            return new Response(JSON.stringify(cleanJson), { headers: { 'Content-Type': 'application/json' } });
        } catch (e) {
            return new Response("[]", { headers: { 'Content-Type': 'application/json' } });
        }
    }

    async function handleValidateName(name) {
        await loadPuter();
        const prompt = `
            Check if this name is offensive/profane/shirk in English/Arabic/Malay: "${name}".
            Strictly allow common names like "Abdullah", "Muhammad".
            Output JSON ONLY: { "safe": boolean, "reason": "string" }
        `;

        try {
            const response = await puter.ai.chat(prompt, { model: AI_MODEL });
            const text = response?.message?.content || response || "{}";
            
            // Clean extraction of JSON
            const first = text.indexOf('{');
            const last = text.lastIndexOf('}');
            const jsonStr = (first !== -1 && last !== -1) ? text.substring(first, last + 1) : JSON.stringify({ safe: true });

            return new Response(jsonStr, { headers: { 'Content-Type': 'application/json' } });
        } catch (e) {
            return new Response(JSON.stringify({ safe: true }), { headers: { 'Content-Type': 'application/json' } });
        }
    }

    // --- 4. HELPERS ---
    function extractJsonArray(text) {
        if (typeof text !== 'string') return [];
        const match = text.match(/\[[\d,\s]*\]/);
        return match ? JSON.parse(match[0]) : [];
    }

    // --- 5. UI LOGIC (Only runs if elements exist) ---
    // This part ensures AI2.js doesn't crash on pages that don't have the "AI Section"
    async function initUI() {
        const AI_SECTION_ID = 'ai-section';
        const AI_ROW_ID = 'ai-row';
        const section = document.getElementById(AI_SECTION_ID);
        
        if (section) {
            // Logic for the reading page or homepage that HAS the UI
            const data = JSON.parse(localStorage.getItem(ANALYTICS_KEY)) || { reads: [], searches: [] };
            if (data.reads.length === 0 && data.searches.length === 0) return;

            // This fetch is intercepted by our code above!
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
        if (!container || !window.quranData) return; // Requires your global data
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

    // Start everything when page loads
    window.addEventListener('load', initUI);

})();
