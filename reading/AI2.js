(function() {
    // --- CONFIGURATION ---
    const ANALYTICS_KEY = 'quran_user_analytics';
    const AI_SECTION_ID = 'ai-section';
    const AI_ROW_ID = 'ai-row';
    const PUTER_SCRIPT_URL = 'https://js.puter.com/v2/';
    const AI_MODEL = 'gpt-5.2'; // Using the advanced model as requested

    // --- 1. LOAD PUTER.JS DYNAMICALLY ---
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

    // --- 2. VIRTUAL BACKEND (The "Interceptor") ---
    // This replaces the need for search.js, validate-name.js, and recommendations.js
    const originalFetch = window.fetch;
    window.fetch = async function(input, init) {
        const url = typeof input === 'string' ? input : input.url;

        // >> LOGIC FROM OLD "search.js"
        if (url.includes('/api/search') && url.includes('q=')) {
            const query = new URL('https://Quran-lite.pages.dev' + url).searchParams.get('q');
            if (!query || query.length < 2) return new Response("[]");
            return handleSearch(query);
        }

        // >> LOGIC FROM OLD "recommendations.js"
        if (url.includes('/api/recommend') && init && init.method === 'POST') {
            const body = JSON.parse(init.body);
            return handleRecommendations(body);
        }

        // >> LOGIC FROM OLD "validate-name.js"
        if (url.includes('/api/validate-name') && init && init.method === 'POST') {
            const body = JSON.parse(init.body);
            return handleValidateName(body.name);
        }

        // Default: specific network calls go to real internet
        return originalFetch(input, init);
    };

    // --- 3. AI HANDLERS (GPT-5.2 Logic) ---

    // HANDLER 1: SEARCH
    const searchCache = new Map();
    async function handleSearch(query) {
        if (searchCache.has(query)) return new Response(JSON.stringify(searchCache.get(query)));

        await loadPuter();
        const systemPrompt = `
            You are a Quranic Search Engine.
            Query: "${query}"
            Task: Return relevant Surah numbers (1-114).
            Rules:
            1. Return ONLY a raw JSON array of integers. Example: [2, 18, 110]
            2. Handle typos, topics (e.g. "Moses"), and stories.
            3. No text, no markdown. JSON only.
        `;

        try {
            const response = await puter.ai.chat(systemPrompt, { model: AI_MODEL, temperature: 0.0 });
            const cleanJson = extractJsonArray(response?.message?.content || response);
            searchCache.set(query, cleanJson); // Cache the result
            return new Response(JSON.stringify(cleanJson), { headers: { 'Content-Type': 'application/json' } });
        } catch (e) {
            console.error("Puter Search Error:", e);
            return new Response("[]", { headers: { 'Content-Type': 'application/json' } });
        }
    }

    // HANDLER 2: RECOMMENDATIONS
    async function handleRecommendations(data) {
        await loadPuter();
        const lastPlayed = data.last_played || 'None';
        const searchHistory = (data.search_history || []).join(', ');

        const prompt = `
            You are a Quran Recommendation Engine.
            User History:
            - Last Played Surah: ${lastPlayed}
            - Recent Searches: ${searchHistory}
            
            Task: Recommend 3 to 5 relevant Surah numbers (1-114).
            Output: ONLY a raw JSON array. Example: [36, 67, 1]
        `;

        try {
            const response = await puter.ai.chat(prompt, { model: AI_MODEL });
            const cleanJson = extractJsonArray(response?.message?.content || response);
            return new Response(JSON.stringify(cleanJson), { headers: { 'Content-Type': 'application/json' } });
        } catch (e) {
            return new Response("[]", { headers: { 'Content-Type': 'application/json' } });
        }
    }

    // HANDLER 3: VALIDATE NAME
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
            
            // Robust JSON extraction
            const first = text.indexOf('{');
            const last = text.lastIndexOf('}');
            const jsonStr = (first !== -1 && last !== -1) ? text.substring(first, last + 1) : JSON.stringify({ safe: true });

            return new Response(jsonStr, { headers: { 'Content-Type': 'application/json' } });
        } catch (e) {
            // Fail safe (allow) if AI fails
            return new Response(JSON.stringify({ safe: true }), { headers: { 'Content-Type': 'application/json' } });
        }
    }

    // --- 4. UTILITIES ---
    function extractJsonArray(text) {
        if (typeof text !== 'string') return [];
        const match = text.match(/\[[\d,\s]*\]/); // Find [1, 2, 3]
        if (!match) return [];
        try {
            return JSON.parse(match[0]);
        } catch(e) { return []; }
    }

    // --- 5. ANALYTICS & UI LOGIC (Preserved from original AI2.js) ---
    function getAnalytics() {
        return JSON.parse(localStorage.getItem(ANALYTICS_KEY)) || { reads: [], searches: [] };
    }

    function saveAnalytics(data) {
        if (data.reads.length > 20) data.reads = data.reads.slice(-20);
        if (data.searches.length > 10) data.searches = data.searches.slice(-10);
        localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
    }

    window.trackSurahRead = function(chapterNum) {
        const data = getAnalytics();
        data.reads = data.reads.filter(r => r !== chapterNum);
        data.reads.push(chapterNum);
        saveAnalytics(data);
    };

    window.trackSearchQuery = function(query) {
        if (!query || query.length < 3) return;
        const data = getAnalytics();
        if (data.searches[data.searches.length - 1] !== query) {
            data.searches.push(query);
            saveAnalytics(data);
        }
    };

    // Monkey-Patching Global Functions (from your original file)
    const patchInterval = setInterval(() => {
        if (typeof window.launchPlayer === 'function' && !window.launchPlayer.isPatched) {
            const originalLaunch = window.launchPlayer;
            window.launchPlayer = function(chapter, verse) {
                window.trackSurahRead(parseInt(chapter));
                return originalLaunch(chapter, verse);
            };
            window.launchPlayer.isPatched = true;
        }
        if (typeof window.performAISearch === 'function' && !window.performAISearch.isPatched) {
            const originalSearch = window.performAISearch;
            window.performAISearch = function() {
                if (typeof searchString !== 'undefined') window.trackSearchQuery(searchString);
                return originalSearch();
            };
            window.performAISearch.isPatched = true;
        }
    }, 1000);
    setTimeout(() => clearInterval(patchInterval), 10000);

    // UI Renderer
    async function loadAIRecommendations() {
        const data = getAnalytics();
        if (data.reads.length === 0) return;

        // This fetch call is now intercepted by the code above!
        try {
            const res = await fetch('/api/recommend', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            const ids = await res.json();
            if (ids.length > 0) renderCards(ids);
        } catch(e) { console.log("AI Loading skipped"); }
    }

    function renderCards(ids) {
        const container = document.getElementById(AI_ROW_ID);
        const section = document.getElementById(AI_SECTION_ID);
        // Ensure quranData exists (from your main app)
        if (!container || !section || typeof window.quranData === 'undefined') return;

        container.innerHTML = '';
        ids.forEach(id => {
            const surah = window.quranData.find(s => s.chapterNumber === id);
            if (!surah) return;
            
            const card = document.createElement('div');
            card.className = 'surah-card ai-card-border';
            card.innerHTML = `
                <div class="card-bg-num" style="color:rgba(0,255,187,0.05)">${surah.chapterNumber}</div>
                <div class="card-title">${surah.title}</div>
                <div class="card-sub">${surah.english_name || ''}</div>
            `;
            card.onclick = () => window.launchPlayer(surah.chapterNumber, 1);
            container.appendChild(card);
        });
        section.style.display = 'block';
    }

    window.addEventListener('load', () => setTimeout(loadAIRecommendations, 1500));

})();
