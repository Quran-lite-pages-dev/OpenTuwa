(function() {
    // --- CONFIGURATION ---
    const ANALYTICS_KEY = 'quran_user_analytics';
    const PUTER_SCRIPT_URL = 'https://js.puter.com/v2/';
    const AI_MODEL = 'gpt-5.2'; // Using the advanced model from your docs

    // --- 1. INJECT PUTER.JS ---
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

    // --- 2. VIRTUAL BACKEND (Fetch Interceptor) ---
    // This tricks your website into thinking it's talking to a server, 
    // but actually it's talking to Puter directly in the browser.
    const originalFetch = window.fetch;
    window.fetch = async function(input, init) {
        const url = typeof input === 'string' ? input : input.url;

        // >> ROUTE: SEARCH <<
        if (url.includes('/api/search') && url.includes('q=')) {
            const query = new URL('https://dummy.com' + url).searchParams.get('q');
            return handleSearch(query);
        }

        // >> ROUTE: RECOMMENDATIONS <<
        if (url.includes('/api/recommend') && init && init.method === 'POST') {
            const body = JSON.parse(init.body);
            return handleRecommendations(body);
        }

        // >> ROUTE: VALIDATE NAME <<
        if (url.includes('/api/validate-name') && init && init.method === 'POST') {
            const body = JSON.parse(init.body);
            return handleValidateName(body.name);
        }

        // Default: specific network calls go to real internet
        return originalFetch(input, init);
    };

    // --- 3. AI LOGIC HANDLERS ---

    async function handleSearch(query) {
        await loadPuter();
        const systemPrompt = `
            You are a Quranic Search Engine.
            Query: "${query}"
            Task: Return relevant Surah numbers (1-114).
            Rules:
            1. Return ONLY a raw JSON array of integers. Example: [2, 18, 110]
            2. Handle typos, topics, and stories.
            3. No text, no markdown. JSON only.
        `;

        try {
            const response = await puter.ai.chat(systemPrompt, { model: AI_MODEL, temperature: 0.0 });
            const cleanJson = extractJsonArray(response?.message?.content || response);
            return new Response(JSON.stringify(cleanJson), { headers: { 'Content-Type': 'application/json' } });
        } catch (e) {
            console.error("Puter Search Error:", e);
            return new Response("[]", { headers: { 'Content-Type': 'application/json' } });
        }
    }

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

    async function handleValidateName(name) {
        await loadPuter();
        const prompt = `
            Check if this name is offensive/profane/shirk in English/Arabic/Malay: "${name}".
            Strictly allow normal names like "Abdullah", "Muhammad".
            Output JSON: { "safe": boolean, "reason": "string" }
        `;

        try {
            const response = await puter.ai.chat(prompt, { 
                model: AI_MODEL, 
                response_format: { type: "json_object" } // GPT feature if supported, else regex fallback
            });
            const text = response?.message?.content || response || "{}";
            
            // Cleanup JSON
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

    // --- 5. ORIGINAL ANALYTICS & UI LOGIC (Preserved) ---
    const AI_SECTION_ID = 'ai-section';
    const AI_ROW_ID = 'ai-row';

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

    // Monkey-Patching (Keep your existing hook logic)
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
        const res = await fetch('/api/recommend', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        const ids = await res.json();
        if (ids.length > 0) renderCards(ids);
    }

    function renderCards(ids) {
        const container = document.getElementById(AI_ROW_ID);
        const section = document.getElementById(AI_SECTION_ID);
        if (!container || !section || !window.quranData) return;

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
