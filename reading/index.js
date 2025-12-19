const SURAH_METADATA = [
    { "chapter": 1, "english_name": "The Opening", "description": "Revealed in Mecca, this is the fundamental prayer of Islam, summarizing the core relationship between God and humanity. It is recited in every unit of prayer. (7 verses)" },
    { "chapter": 2, "english_name": "The Cow", "description": "The longest Surah, revealed in Medina. It establishes Islamic laws, recounts the stories of Moses (Peace be upon him), and guides the new Muslim community. (286 verses)" }
    // add more here
];

// --- 2. MULTI-PROFILE & LOGIC ---
const ACTIVE_PROFILE_ID = localStorage.getItem('quran_active_profile');
if (!ACTIVE_PROFILE_ID) {
    window.location.href = '../'; 
    throw new Error("Redirecting...");
}
const STORAGE_KEY = `quranState_${ACTIVE_PROFILE_ID}`;

const TRANSLATIONS_CONFIG = {
    'en': { name: 'English (Saheeh Intl) | Preferred', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/a/en.xml' },
    'sq': { name: 'Albanian (Sherif Ahmeti)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/a/sq.ahmeti.xml' },
    'ber': { name: 'Amazigh (At Mansour)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/a/ber.mensur.xml' }
    // add more
};

const RECITERS_CONFIG = {
    'alafasy': { name: 'Mishary Alafasy', path: 'Alafasy_128kbps' },
    'juhaynee': { name: 'Al Juhany', path: 'Abdullaah_3awwaad_Al-Juhaynee_128kbps' },
    'sudais': { name: 'As Sudais', path: 'Abdurrahmaan_As-Sudais_192kbps' },
    'ghamadi': { name: 'Al Ghamdi', path: 'Ghamadi_40kbps' },
    'abbad': { name: 'Fares Abbad', path: 'Fares_Abbad_64kbps' },
    'muaiqly': { name: 'Al Muaiqly', path: 'MaherAlMuaiqly128kbps' },
    'shuraym': { name: 'Ash Shuraym', path: 'Saood_ash-Shuraym_128kbps' },
    'basit': { name: 'Abdul Basit', path: 'Abdul_Basit_Murattal_192kbps' }
};

const TRANSLATION_AUDIO_CONFIG = {
    'none': { name: 'No Audio Translation' },
    'en_walk': { name: 'English (Ibrahim Walk)', path: 'English/Sahih_Intnl_Ibrahim_Walk_192kbps' },
    'id_ministry': { name: 'Indonesian (Ministry)', path: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/play/id' },
    'es': { name: 'Español', path: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/play' }
};

// --- ELEVENLABS CONFIGURATION ---
// PLEASE PASTE YOUR KEY BELOW
const ELEVENLABS_API_KEY = ''; 
const ELEVEN_MODEL_ID = 'eleven_multilingual_v2'; // Best for mixed languages
// "Rachel" is a versatile voice. You can change this ID if you prefer a different voice.
const DEFAULT_TTS_VOICE_ID = 'nPczCjzI2devNBz1zQrb'; 

const FTT_URL = 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/a/FTT.XML';
const RTL_CODES = new Set(['ar', 'dv', 'fa', 'he', 'ku', 'ps', 'sd', 'ur', 'ug']);

const elements = {
    overlay: document.getElementById('loading-overlay'),
    spinner: document.querySelector('.loader-spinner'),
    loaderText: document.getElementById('loader-text'),
    startBtn: document.getElementById('start-btn'),
    
    quranAudio: document.getElementById('audio-player'),
    transAudio: document.getElementById('translation-audio-player'),
    previewAudio: document.getElementById('preview-audio'),
    bufferInd: document.getElementById('buffering-indicator'),
    
    selects: {
        chapter: document.getElementById('chapterSelect'),
        verse: document.getElementById('verseSelect'),
        trans: document.getElementById('translationSelect'),
        reciter: document.getElementById('reciterSelect'),
        transAudio: document.getElementById('translationAudioSelect')
    },
    display: {
        title: document.getElementById('chapter-title'),
        verse: document.getElementById('verse-text'),
        verseNext: document.getElementById('verse-text-next'),
        trans: document.getElementById('translation-text'),
        container: document.getElementById('content-display')
    },
    views: {
        dashboard: document.getElementById('dashboard-view'),
        cinema: document.getElementById('cinema-view')
    },
    // TV Navigation Elements
    sidebar: {
        container: document.getElementById('tv-sidebar'),
        home: document.getElementById('nav-home'),
        search: document.getElementById('nav-search'),
        profile: document.getElementById('nav-profile')
    },
    search: {
        overlay: document.getElementById('search-overlay'),
        inputDisplay: document.getElementById('search-input-display'),
        keyboardGrid: document.getElementById('keyboard-grid'),
        resultsGrid: document.getElementById('search-results-grid')
    },
    subtitle: document.getElementById('hero-subtitle-overlay')
};

let quranData = []; 
let translationCache = {}; 
// Cache for generated TTS blobs to save quota (Free Forever Optimization)
let ttsCache = {}; 
let currentChapterData = {};
let inactivityTimer;
let forbiddenToTranslateSet = new Set();
let isBuffering = false;

// Preview Variables
let previewTimeout;
const PREVIEW_DELAY = 600; 
let previewSequence = []; 
let previewSeqIndex = 0;

// Search Variables
let searchString = "";
const KEYBOARD_KEYS = [
    'A','B','C','D','E','F',
    'G','H','I','J','K','L',
    'M','N','O','P','Q','R',
    'S','T','U','V','W','X',
    'Y','Z','1','2','3','4',
    '5','6','7','8','9','0',
    'SPACE', 'DEL', 'CLEAR'
];

// --- MERGE METADATA ---
function mergeMetadata(apiChapters) {
    return apiChapters.map((ch, idx) => {
        const meta = SURAH_METADATA.find(m => m.chapter === ch.chapterNumber);
        if (meta) {
            return { ...ch, english_name: meta.english_name, description: meta.description };
        }
        return ch;
    });
}

// --- ROUTER ---
function switchView(viewName) {
    if(viewName === 'cinema') {
        elements.views.dashboard.classList.remove('active');
        elements.views.cinema.classList.add('active');
        elements.views.cinema.style.opacity = '1';
        stopPreview();
        elements.sidebar.container.style.display = 'none'; // Hide sidebar in cinema
        setTimeout(() => document.getElementById('control-panel').focus(), 100);
    } else {
        elements.views.cinema.classList.remove('active');
        elements.views.cinema.style.opacity = '0';
        elements.views.dashboard.classList.add('active');
        elements.sidebar.container.style.display = 'flex'; // Show sidebar
        elements.quranAudio.pause();
        elements.transAudio.pause();
        refreshDashboard();
        document.getElementById('door-play-btn').focus();
    }
}

window.addEventListener('popstate', (event) => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('chapter')) {
        switchView('cinema');
        restoreState();
        loadVerse(false); // Using Old logic
    } else {
        switchView('dashboard');
    }
});

async function initializeApp() {
    try {
        const jsonResponse = await fetch('https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/a/2TM3TM.json');
        if (!jsonResponse.ok) throw new Error("Failed to load Quran JSON");
        const jsonData = await jsonResponse.json();
        quranData = mergeMetadata(jsonData.chapters);

        try {
            const fttResp = await fetch(FTT_URL);
            if (fttResp.ok) {
                const fttText = await fttResp.text();
                const fttDoc = new DOMParser().parseFromString(fttText, 'application/xml');
                fttDoc.querySelectorAll('Verse').forEach(v => {
                    const c = v.getAttribute('chapter')?.trim();
                    const n = v.getAttribute('number')?.trim();
                    if(c && n) forbiddenToTranslateSet.add(`${c}-${n}`);
                });
            }
        } catch (e) { console.warn("FTT load failed", e); }

        populateChapterSelect();
        populateReciterSelect();
        populateTranslationSelectOptions();
        populateTranslationAudioSelect(); // Called after Translations loaded

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('chapter')) {
            // Start in Cinema
            document.getElementById('intro-overlay').style.display = 'none'; // NEW: Hide intro if direct link
            switchView('cinema');
            restoreState();
            populateVerseSelect();
            const savedVerse = getSavedVerseIndex();
            if(savedVerse < elements.selects.verse.options.length) {
                elements.selects.verse.value = savedVerse;
            }
            const activeTransId = elements.selects.trans.value;
            await loadTranslationData(activeTransId);
            loadVerse(false); // Old Logic
            
            elements.spinner.style.display = 'none';
            elements.loaderText.style.display = 'none';
            elements.startBtn.style.display = 'block';
            elements.startBtn.textContent = "Continue";
            elements.startBtn.focus();
        } else {
            // Start in Dashboard
            switchView('dashboard');
            refreshDashboard();
            elements.overlay.style.display = 'none';
            playNetflixIntro(); // NEW: Trigger Intro
        }

        setupEventListeners();
        initSidebarNavigation();
        initSearchInterface();
        
        // --- ACTIVATING SPATIAL NAVIGATION FOR ANDROID TV ---
        initSpatialNavigation(); 

    } catch (error) {
        console.error("Critical Init Error:", error);
        elements.loaderText.textContent = "Error loading content. Please check connection.";
    }
}

// --- DASHBOARD FUNCTIONS ---
function refreshDashboard() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const heroBtn = document.getElementById('door-play-btn');

    const allIndices = Array.from({length: 114}, (_, i) => i);
    const shortRowIndices = allIndices.slice(77, 114);
    
    fillRow('trending-row', [36, 67, 18, 55, 1, 112, 113, 114].map(id => id-1));
    fillRow('short-row', shortRowIndices);
    fillRow('all-row', Array.from({length: 114}, (_, i) => i));

    if(saved.chapter !== undefined && quranData[saved.chapter]) {
        const chNum = quranData[saved.chapter].chapterNumber;
        const vNum = (saved.verse || 0) + 1;
        const reciter = saved.reciter || 'alafasy';
        updateHeroPreview(chNum, vNum, reciter, false);
        heroBtn.onclick = () => launchPlayer(chNum, vNum);
    } else {
        updateHeroPreview(1, 1, 'alafasy', false);
        heroBtn.onclick = () => launchPlayer(1, 1);
    }
}

function fillRow(elementId, indexArray) {
    const container = document.getElementById(elementId);
    const fragment = document.createDocumentFragment(); // Use fragment for speed
    
    indexArray.forEach(idx => {
        if(!quranData[idx]) return;
        const surah = quranData[idx];
        const card = document.createElement('div');
        card.className = 'surah-card';
        card.tabIndex = 0;
        card.innerHTML = `
            <div class="card-bg-num">${surah.chapterNumber}</div>
            <div class="card-title">${surah.title}</div>
            <div class="card-sub">${surah.english_name || ''}</div>
        `;
        
        // Use specialized TV events
        card.onclick = () => launchPlayer(surah.chapterNumber, 1);
        card.onfocus = () => {
            // Preview logic here
            schedulePreview(surah.chapterNumber);
        };
        
        fragment.appendChild(card);
    });
    
    container.innerHTML = '';
    container.appendChild(fragment);
}

function schedulePreview(chapterNum) {
    if (previewTimeout) clearTimeout(previewTimeout);
    stopPreview();
    const surah = quranData[chapterNum - 1];
    document.getElementById('door-hero-title').textContent = surah.title;
    document.getElementById('door-hero-subtitle').textContent = surah.english_name;
    document.getElementById('door-hero-desc').textContent = surah.description;
    document.getElementById('door-play-btn').onclick = () => launchPlayer(chapterNum, 1);

    previewTimeout = setTimeout(() => {
        updateHeroPreview(chapterNum, 1, 'alafasy', true); 
    }, PREVIEW_DELAY);
}

function stopPreview() {
    elements.previewAudio.pause();
    elements.previewAudio.onended = null;
    elements.subtitle.classList.remove('active');
    clearTimeout(previewTimeout);
    previewSequence = [];
}

function updateHeroPreview(chapterNum, startVerse, reciterId, isSequence) {
    const surah = quranData[chapterNum - 1];
    if (!surah) return;
    document.getElementById('door-hero-title').textContent = surah.title;
    document.getElementById('door-hero-subtitle').textContent = surah.english_name;
    document.getElementById('door-hero-desc').textContent = surah.description;

    if (isSequence) {
        previewSequence = [0, 1, 2].map(offset => startVerse + offset).filter(v => v <= surah.verses.length);
    } else {
        previewSequence = [startVerse]; 
    }
    previewSeqIndex = 0;
    
    // Pre-load translation logic for preview
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const trans = saved.trans || 'en';
    if (!translationCache[trans]) {
            loadTranslationData(trans).then(() => {
                // If still in preview mode, it will pick up next tick
            });
    }

    playPreviewStep(chapterNum, reciterId);
}

function playPreviewStep(chapterNum, reciterId) {
    if (previewSeqIndex >= previewSequence.length) return;
    const verseNum = previewSequence[previewSeqIndex];
    const padCh = String(chapterNum).padStart(3, '0');
    const padV = String(verseNum).padStart(3, '0');
    
    const imgLayer = document.getElementById('hero-preview-layer');
    const previewImg = document.getElementById('preview-img');
    const newSrc = `https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/img/${chapterNum}_${verseNum}.png`;

    previewImg.style.opacity = 0;
    setTimeout(() => {
        previewImg.src = newSrc;
        previewImg.onload = () => {
            previewImg.style.opacity = 0.6;
            imgLayer.classList.add('active');
        };
    }, 200);

    // Subtitle Update Logic
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const transId = saved.trans || 'en';
    const cache = translationCache[transId];
    if(cache) {
        const sura = cache.querySelector(`sura[index="${chapterNum}"]`);
        const aya = sura ? sura.querySelector(`aya[index="${verseNum}"]`) : null;
        const text = aya ? aya.getAttribute('text') : "";
        if(text) {
            elements.subtitle.textContent = text;
            elements.subtitle.classList.add('active');
            if (RTL_CODES.has(transId)) elements.subtitle.dir = 'rtl';
            else elements.subtitle.dir = 'ltr';
        }
    } else {
        elements.subtitle.classList.remove('active');
    }

    const rPath = RECITERS_CONFIG[reciterId]?.path || RECITERS_CONFIG['alafasy'].path;
    const audioUrl = `https://everyayah.com/data/${rPath}/${padCh}${padV}.mp3`;
    elements.previewAudio.src = audioUrl;
    elements.previewAudio.volume = 0.6;
    elements.previewAudio.onended = () => {
        previewSeqIndex++;
        playPreviewStep(chapterNum, reciterId);
    };
    elements.previewAudio.play().catch(e => console.log("Autoplay blocked"));
}

function launchPlayer(chapterNum, verseNum = 1) {
    const newUrl = `?chapter=${chapterNum}&verse=${verseNum}`;
    history.pushState({view: 'cinema'}, '', newUrl);
    switchView('cinema');
    
    elements.selects.chapter.value = chapterNum - 1;
    populateVerseSelect();
    elements.selects.verse.value = verseNum - 1;
    elements.overlay.style.display = 'none';
    loadVerse(true);
}

// --- OLD PLAYER LOGIC HELPERS ---
async function loadTranslationData(id) {
    if (translationCache[id]) return; 
    if (!TRANSLATIONS_CONFIG[id]) return;
    try {
        toggleBuffering(true);
        const res = await fetch(TRANSLATIONS_CONFIG[id].url);
        if (res.ok) {
            const txt = await res.text();
            translationCache[id] = new DOMParser().parseFromString(txt, 'application/xml');
        }
    } catch (e) {
        console.error("Failed to load translation:", id);
    } finally {
        toggleBuffering(false);
    }
}

function restoreState() {
    const urlParams = new URLSearchParams(window.location.search);
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const browserLang = navigator.language.split('-')[0];

    let ch = 0;
    if (urlParams.has('chapter')) ch = parseInt(urlParams.get('chapter')) - 1; 
    else if (saved.chapter !== undefined) ch = saved.chapter;
    elements.selects.chapter.value = ch;

    if (urlParams.has('reciter') && RECITERS_CONFIG[urlParams.get('reciter')]) {
        elements.selects.reciter.value = urlParams.get('reciter');
    } else if (saved.reciter) {
        elements.selects.reciter.value = saved.reciter;
    }

    let trans = 'en';
    if (urlParams.has('trans')) trans = urlParams.get('trans');
    else if (saved.trans) trans = saved.trans;
    else if (TRANSLATIONS_CONFIG[browserLang]) trans = browserLang; 
    
    if (!TRANSLATIONS_CONFIG[trans]) trans = 'en';
    elements.selects.trans.value = trans;

    if (urlParams.has('audio_trans')) {
        const param = urlParams.get('audio_trans');
        // Check if it's a valid config OR a tts: id
        if(TRANSLATION_AUDIO_CONFIG[param] || param.startsWith('tts:')) {
            elements.selects.transAudio.value = param;
        }
    } else if (saved.audio_trans && (TRANSLATION_AUDIO_CONFIG[saved.audio_trans] || saved.audio_trans.startsWith('tts:'))) {
        elements.selects.transAudio.value = saved.audio_trans;
    }
}

function getSavedVerseIndex() {
    const urlParams = new URLSearchParams(window.location.search);
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    if (urlParams.has('verse')) return parseInt(urlParams.get('verse')) - 1;
    if (saved.verse !== undefined) return saved.verse;
    return 0;
}

function saveState() {
    const state = {
        chapter: parseInt(elements.selects.chapter.value),
        verse: parseInt(elements.selects.verse.value),
        reciter: elements.selects.reciter.value,
        trans: elements.selects.trans.value,
        audio_trans: elements.selects.transAudio.value 
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    const chObj = quranData[state.chapter];
    const chNum = chObj.chapterNumber;
    const vNum = chObj.verses[state.verse].verseNumber;
    const transName = TRANSLATIONS_CONFIG[state.trans].name;
    const reciterName = RECITERS_CONFIG[state.reciter].name;

    const newUrl = `?chapter=${chNum}&verse=${vNum}&reciter=${state.reciter}&trans=${state.trans}&audio_trans=${state.audio_trans}`;
    
    window.history.replaceState({path: newUrl, view: 'cinema'}, '', newUrl);

    const canonicalLink = document.getElementById('dynamic-canonical');
    const fullUrl = `https://Quran-lite.pages.dev/reading/${newUrl}`;
    if (canonicalLink) {
        canonicalLink.href = fullUrl;
    }

    const pageTitle = `${chObj.title} - Verse ${vNum} | QuranLite`;
    document.title = pageTitle;
    
    const metaDesc = `Read and Listen to Surah ${chObj.title} Verse ${vNum}. Translation: ${transName}. Recitation by ${reciterName}.`;
    const metaDescTag = document.querySelector('meta[name="description"]');
    if(metaDescTag) metaDescTag.setAttribute("content", metaDesc);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if(ogUrl) ogUrl.content = fullUrl;

    updateGoogleSchema(chNum, vNum, chObj.title, transName, reciterName);
}

function updateGoogleSchema(chapterNum, verseNum, chapterName, transName, reciterName) {
    const oldSchema = document.getElementById('dynamic-schema-item');
    if (oldSchema) oldSchema.remove();

    const canonicalUrl = window.location.href; 
    const rootUrl = "https://Quran-lite.pages.dev/";
    const surahUrl = `https://Quran-lite.pages.dev/reading/?chapter=${chapterNum}`;
    const metaDesc = `Read and Listen to Surah ${chapterName} Verse ${verseNum}. Translation: ${transName}. Recitation by ${reciterName}.`;

    const schemaData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "itemListElement": [{
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Quran for Human", 
                    "item": rootUrl
                }, {
                    "@type": "ListItem",
                    "position": 2,
                    "name": `Surah ${chapterName}`,
                    "item": surahUrl
                }, {
                    "@type": "ListItem",
                    "position": 3,
                    "name": `Ayah ${verseNum}`,
                    "item": canonicalUrl 
                }]
            },
            {
                "@type": "WebPage", 
                "@id": canonicalUrl,
                "url": canonicalUrl,
                "name": `${chapterName} - Verse ${verseNum} | QuranLite`,
                "description": metaDesc, 
                "isPartOf": {
                    "@type": "WebSite",
                    "url": rootUrl,
                    "name": "Quran for Human"
                }
            }
        ]
    };

    const script = document.createElement('script');
    script.id = 'dynamic-schema-item';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaData);
    document.head.appendChild(script);
}

function populateChapterSelect() {
    elements.selects.chapter.innerHTML = '';
    quranData.forEach((c, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `${c.chapterNumber}. ${c.title} - ${c.english_name || ''}`;
        elements.selects.chapter.appendChild(opt);
    });
}

function populateVerseSelect() {
    elements.selects.verse.innerHTML = '';
    const chIdx = elements.selects.chapter.value || 0;
    currentChapterData = quranData[chIdx];
    currentChapterData.verses.forEach((v, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `Ayah ${v.verseNumber}`;
        elements.selects.verse.appendChild(opt);
    });
}

function populateReciterSelect() {
    elements.selects.reciter.innerHTML = '';
    Object.entries(RECITERS_CONFIG).forEach(([k, v]) => {
        const opt = document.createElement('option');
        opt.value = k; opt.textContent = v.name;
        elements.selects.reciter.appendChild(opt);
    });
}

function populateTranslationAudioSelect() {
    elements.selects.transAudio.innerHTML = '';
    
    // 1. Add Existing MP3 configs (Static)
    Object.entries(TRANSLATION_AUDIO_CONFIG).forEach(([k, v]) => {
        const opt = document.createElement('option');
        opt.value = k; 
        opt.textContent = v.name;
        elements.selects.transAudio.appendChild(opt);
    });

    // 2. Add AI TTS options for languages NOT in static list
    Object.entries(TRANSLATIONS_CONFIG).forEach(([code, config]) => {
        const opt = document.createElement('div'); // dummy
        const ttsValue = `tts:${code}`;
        
        const ttsOpt = document.createElement('option');
        ttsOpt.value = ttsValue;
        ttsOpt.textContent = `${config.name.split('|')[0].trim()} (AI Voice)`;
        elements.selects.transAudio.appendChild(ttsOpt);
    });
}

function populateTranslationSelectOptions() {
    elements.selects.trans.innerHTML = '';
    Object.entries(TRANSLATIONS_CONFIG).forEach(([id, config]) => {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = config.name;
        elements.selects.trans.appendChild(opt);
    });
}

function toggleBuffering(show) {
    isBuffering = show;
    elements.bufferInd.style.display = show ? 'block' : 'none';
}

async function loadVerse(autoplay = true) {
    const chIdx = elements.selects.chapter.value;
    const vIdx = elements.selects.verse.value;
    currentChapterData = quranData[chIdx];
    const verseData = currentChapterData.verses[vIdx];
    
    const chNum = currentChapterData.chapterNumber;
    const vNum = verseData.verseNumber;
    const verseKey = `${chNum}-${vNum}`;
    const isForbidden = forbiddenToTranslateSet.has(verseKey);

    elements.display.title.textContent = `${currentChapterData.title} (${chNum}:${vNum})`;
    
    const newSrc = `https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/img/${chNum}_${vNum}.png`;
    const img1 = elements.display.verse;
    const img2 = elements.display.verseNext;

    let imgReady = false;
    if(img1.src === newSrc || img2.src === newSrc) imgReady = true;

    const isImg1Active = img1.classList.contains('active-verse-img');
    const activeImg = isImg1Active ? img1 : img2;
    const nextImg = isImg1Active ? img2 : img1;

    if(!imgReady && autoplay) toggleBuffering(true);

    nextImg.src = newSrc;
    nextImg.onload = () => {
        activeImg.classList.remove('active-verse-img');
        nextImg.classList.add('active-verse-img');
        toggleBuffering(false); 
    };
    
    if (nextImg.complete && nextImg.naturalHeight !== 0) {
            activeImg.classList.remove('active-verse-img');
            nextImg.classList.add('active-verse-img');
            toggleBuffering(false);
    }

    const tid = elements.selects.trans.value;
    if(!translationCache[tid]) {
        await loadTranslationData(tid);
    }

    if (isForbidden) {
        elements.display.trans.textContent = '';
    } else {
        updateTranslationText(chNum, vNum);
    }

    updateQuranAudio(chNum, vNum, autoplay);
    
    if (isForbidden) {
        elements.transAudio.src = '';
    } else {
        updateTranslationAudio(chNum, vNum, false);
    }

    saveState(); 
    updateMediaSession(currentChapterData.title, vNum, RECITERS_CONFIG[elements.selects.reciter.value].name);
    
    bufferNextResources(chIdx, parseInt(vIdx));
}

function bufferNextResources(currentChIdx, currentVIdx) {
    let nextChIdx = currentChIdx;
    let nextVIdx = currentVIdx + 1;
    
    if (nextVIdx >= quranData[nextChIdx].verses.length) {
        nextChIdx = parseInt(nextChIdx) + 1;
        nextVIdx = 0;
    }

    if (nextChIdx >= quranData.length) return; 

    const nextCh = quranData[nextChIdx].chapterNumber;
    const nextV = quranData[nextChIdx].verses[nextVIdx].verseNumber;

    const img = new Image();
    img.src = `https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/img/${nextCh}_${nextV}.png`;

    const rId = elements.selects.reciter.value;
    const qPath = RECITERS_CONFIG[rId].path;
    const padCh = String(nextCh).padStart(3, '0');
    const padV = String(nextV).padStart(3, '0');
    const aud = new Audio();
    aud.src = `https://everyayah.com/data/${qPath}/${padCh}${padV}.mp3`;
    aud.preload = 'auto'; 

    const taId = elements.selects.transAudio.value;
    if (taId !== 'none' && !taId.startsWith('tts:')) {
        const config = TRANSLATION_AUDIO_CONFIG[taId];
        let tUrl;
        if (config.path.startsWith('httpIA')) tUrl = `${config.path.replace('httpIA', 'https')}/${padCh}${padV}.mp3`;
        else if (config.path.startsWith('http')) tUrl = `${config.path}/${padCh}${padV}.mp3`;
        else tUrl = `https://everyayah.com/data/${config.path}/${padCh}${padV}.mp3`;
        
        const tAud = new Audio();
        tAud.src = tUrl;
        tAud.preload = 'auto';
    }
}

function updateTranslationText(chNum, vNum) {
    const tid = elements.selects.trans.value;
    if (!translationCache[tid]) return;
    
    if (RTL_CODES.has(tid)) {
        elements.display.trans.dir = 'rtl';
    } else {
        elements.display.trans.dir = 'ltr';
    }

    const sura = translationCache[tid].querySelector(`sura[index="${chNum}"]`);
    const aya = sura ? sura.querySelector(`aya[index="${vNum}"]`) : null;
    elements.display.trans.textContent = aya ? aya.getAttribute('text') : "Translation unavailable";
    adjustFontSize();
}

function updateQuranAudio(chNum, vNum, play) {
    const rId = elements.selects.reciter.value;
    const path = RECITERS_CONFIG[rId].path;
    const padCh = String(chNum).padStart(3, '0');
    const padV = String(vNum).padStart(3, '0');
    
    elements.quranAudio.src = `https://everyayah.com/data/${path}/${padCh}${padV}.mp3`;
    if(play) elements.quranAudio.play().catch(e => console.log("Waiting for user interaction"));
}

async function updateTranslationAudio(chNum, vNum, play) {
    const taId = elements.selects.transAudio.value;
    
    if (taId === 'none') {
        elements.transAudio.src = '';
        return;
    }

    // --- 1. HANDLE STATIC MP3 FILES (Original Logic) ---
    if (!taId.startsWith('tts:')) {
        const config = TRANSLATION_AUDIO_CONFIG[taId];
        const padCh = String(chNum).padStart(3, '0');
        const padV = String(vNum).padStart(3, '0');
        
        let url;
        if (config.path.startsWith('httpIA')) url = `${config.path.replace('httpIA', 'https')}/${padCh}${padV}.mp3`;
        else if (config.path.startsWith('http')) url = `${config.path}/${padCh}${padV}.mp3`;
        else url = `https://everyayah.com/data/${config.path}/${padCh}${padV}.mp3`;

        if(!url.endsWith('.mp3')) url += `/${padCh}${padV}.mp3`;
        elements.transAudio.src = url;
        if(play) elements.transAudio.play();
        return;
    }

    // --- 2. HANDLE AI TTS (ElevenLabs Logic) ---
    const langCode = taId.split(':')[1];
    
    let textToSpeak = "";
    
    const currentTextId = elements.selects.trans.value;
    if (currentTextId === langCode) {
        textToSpeak = elements.display.trans.textContent;
    } else {
        if (!translationCache[langCode]) {
            await loadTranslationData(langCode);
        }
        const cache = translationCache[langCode];
        if(cache) {
            const sura = cache.querySelector(`sura[index="${chNum}"]`);
            const aya = sura ? sura.querySelector(`aya[index="${vNum}"]`) : null;
            textToSpeak = aya ? aya.getAttribute('text') : "";
        }
    }

    if (!textToSpeak || textToSpeak.length < 2) {
        console.warn("No text available for TTS");
        return;
    }

    const cacheKey = `${langCode}_${chNum}_${vNum}`;
    
    if (ttsCache[cacheKey]) {
        elements.transAudio.src = ttsCache[cacheKey];
        if(play) elements.transAudio.play();
        return;
    }

    try {
        if(!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY.includes('PASTE')) {
            console.error("ElevenLabs API Key missing");
            return;
        }

        toggleBuffering(true);

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_TTS_VOICE_ID}`, {
            method: 'POST',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: textToSpeak,
                model_id: ELEVEN_MODEL_ID,
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5
                }
            })
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("ElevenLabs API Error:", err);
            throw new Error("TTS Failed");
        }

        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        
        ttsCache[cacheKey] = audioUrl; // Save to Cache
        elements.transAudio.src = audioUrl;
        if(play) elements.transAudio.play();

    } catch (e) {
        console.error("TTS Stream Error", e);
    } finally {
        toggleBuffering(false);
    }
}

function handleQuranEnd() {
    if (elements.transAudio.src && elements.transAudio.src !== window.location.href) {
        elements.transAudio.play().catch(() => nextVerse());
    } else {
        nextVerse();
    }
}

function nextVerse() {
    const totalV = elements.selects.verse.options.length;
    let cV = parseInt(elements.selects.verse.value);
    
    if (cV + 1 < totalV) {
        elements.selects.verse.value = cV + 1;
        loadVerse(true);
    } else {
        let cC = parseInt(elements.selects.chapter.value);
        if (cC + 1 < elements.selects.chapter.options.length) {
            elements.selects.chapter.value = cC + 1;
            populateVerseSelect();
            elements.selects.verse.value = 0;
            loadVerse(true);
        }
    }
}

function adjustFontSize() {
    const el = elements.display.trans;
    if (window.innerWidth <= 768) return; 

    el.style.fontSize = '3.5rem';
    let iter = 0;
    while (el.scrollHeight > el.clientHeight && iter < 50) {
        let size = parseFloat(window.getComputedStyle(el).fontSize);
        if (size <= 16) break;
        el.style.fontSize = (size - 1) + 'px';
        iter++;
    }
}

function setupEventListeners() {
    elements.startBtn.addEventListener('click', () => {
        elements.overlay.style.opacity = 0;
        setTimeout(() => elements.overlay.style.display = 'none', 500);
        loadVerse(true); 
    });

    elements.selects.chapter.addEventListener('change', () => { populateVerseSelect(); loadVerse(true); });
    elements.selects.verse.addEventListener('change', () => loadVerse(true));
    elements.selects.reciter.addEventListener('change', () => { saveState(); loadVerse(true); });
    
    elements.selects.trans.addEventListener('change', async () => {
        const activeTransId = elements.selects.trans.value;
        await loadTranslationData(activeTransId); 
        
        const chIdx = elements.selects.chapter.value;
        const vIdx = elements.selects.verse.value;
        const ch = quranData[chIdx].chapterNumber;
        const v = quranData[chIdx].verses[vIdx].verseNumber;
        updateTranslationText(ch, v);
        saveState();
    });

    elements.selects.transAudio.addEventListener('change', () => {
        const chIdx = elements.selects.chapter.value;
        const vIdx = elements.selects.verse.value;
        const ch = quranData[chIdx].chapterNumber;
        const v = quranData[chIdx].verses[vIdx].verseNumber;
        if (!elements.quranAudio.paused) {
            updateTranslationAudio(ch, v, false); 
            saveState();
            return;
        }
        if (!elements.transAudio.paused) {
            updateTranslationAudio(ch, v, true);
            saveState();
            return;
        }
        updateTranslationAudio(ch, v, false);
        saveState();
    });

    elements.quranAudio.addEventListener('ended', handleQuranEnd);
    elements.transAudio.addEventListener('ended', nextVerse);

    ['mousemove', 'touchstart', 'click', 'keydown'].forEach(e => 
        window.addEventListener(e, () => {
            document.body.classList.remove('idle');
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => document.body.classList.add('idle'), 4000);
        })
    );

    window.addEventListener('resize', () => {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);
        adjustFontSize();
    });
}

function updateMediaSession(surah, verse, artist) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: `${surah} Ayah ${verse}`,
            artist: artist,
            album: `Surah ${surah}`,
            artwork: [{ src: 'https://Quran-lite.pages.dev/social-preview.jpg', sizes: '512x512', type: 'image/jpeg' }]
        });
        navigator.mediaSession.setActionHandler('nexttrack', nextVerse);
    }
}

// --- 3. SIDEBAR LOGIC ---
function initSidebarNavigation() {
    elements.sidebar.container.addEventListener('mouseenter', () => elements.sidebar.container.classList.add('expanded'));
    elements.sidebar.container.addEventListener('mouseleave', () => elements.sidebar.container.classList.remove('expanded'));

    elements.sidebar.home.addEventListener('click', (e) => {
        e.preventDefault();
        closeSearch();
        switchView('dashboard');
        setActiveNav(elements.sidebar.home);
    });

    elements.sidebar.search.addEventListener('click', (e) => {
        e.preventDefault();
        openSearch();
        setActiveNav(elements.sidebar.search);
    });
}

function setActiveNav(el) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
}

// --- 4. SEARCH & KEYBOARD LOGIC (AI POWERED) ---
let searchDebounceTimer;

function initSearchInterface() {
    renderKeyboard();
    
    // Results delegation
    elements.search.resultsGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.surah-card');
        if(card) {
            const ch = parseInt(card.dataset.chapter);
            closeSearch();
            launchPlayer(ch, 1);
        }
    });
}

// index.js - OTT Optimized Search Logic

let searchGrid = []; // To store rows for index-based jumping
let currentKeyRow = 0;
let currentKeyCol = 0;

function renderKeyboard() {
    const grid = elements.search.keyboardGrid;
    grid.innerHTML = '';
    
    // Group keys into rows of 6 for predictable D-Pad movement
    const keysPerRow = 6;
    searchGrid = [];
    
    for (let i = 0; i < KEYBOARD_KEYS.length; i += keysPerRow) {
        searchGrid.push(KEYBOARD_KEYS.slice(i, i + keysPerRow));
    }

    searchGrid.forEach((row, rowIndex) => {
        row.forEach((key, colIndex) => {
            const btn = document.createElement('div');
            btn.className = 'key';
            btn.textContent = key;
            btn.tabIndex = 0;
            btn.dataset.row = rowIndex;
            btn.dataset.col = colIndex;
            
            if (['SPACE', 'DEL', 'CLEAR'].includes(key)) {
                btn.classList.add('wide');
            }

            // GPU-Accelerated Focus
            btn.onfocus = () => {
                currentKeyRow = rowIndex;
                currentKeyCol = colIndex;
            };

            btn.onclick = () => handleKeyPress(key);
            
            // Explicit D-Pad overrides to stop "Ghost Scrolling"
            btn.onkeydown = (e) => {
                if (e.key === 'Enter') handleKeyPress(key);
                // When moving RIGHT from the end of a row, jump to results
                if (e.key === 'ArrowRight' && colIndex === row.length - 1) {
                    elements.search.resultsGrid.querySelector('.surah-card')?.focus();
                    e.preventDefault();
                }
            };

            grid.appendChild(btn);
        });
    });
}

function handleKeyPress(key) {
    // Add a small "haptic" scale effect for visual confirmation
    const activeKey = document.activeElement;
    activeKey.style.transform = 'scale(0.9)';
    setTimeout(() => activeKey.style.transform = 'scale(1.1)', 100);

    if (key === 'SPACE') searchString += ' ';
    else if (key === 'DEL') searchString = searchString.slice(0, -1);
    else if (key === 'CLEAR') searchString = "";
    else searchString += key;
    
    elements.search.inputDisplay.textContent = searchString;
    
    // Snappy AI Search Debounce
    clearTimeout(searchDebounceTimer);
    if (searchString.length > 2) {
        searchDebounceTimer = setTimeout(() => performAISearch(), 500);

    } else {
        elements.search.resultsGrid.innerHTML = '<div class="no-results">Type at least 3 characters...</div>';
    }
}

async function performAISearch() {
    const query = searchString.trim();
    const resultsContainer = elements.search.resultsGrid;

    if(!query) return;

    try {
        // Call Cloudflare Workers AI Endpoint
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error("AI Search failed");
        
        // Expecting array of Chapter Numbers: e.g., [1, 2, 55]
        const chapterIds = await response.json();

        resultsContainer.innerHTML = '';

        if (!chapterIds || chapterIds.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">No relevant Surahs found.</div>';
            return;
        }

        // Map AI results (Integers) to your Local MetaData
        // We map Chapter Number (1-based) to Array Index (0-based)
        const foundSurahs = chapterIds
            .map(num => quranData.find(s => s.chapterNumber === num))
            .filter(Boolean); // Remove nulls if AI hallucinates a number > 114

        if (foundSurahs.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">No matches found.</div>';
            return;
        }

        foundSurahs.forEach(surah => {
            const card = document.createElement('div');
            card.className = 'surah-card';
            card.tabIndex = 0;
            card.dataset.chapter = surah.chapterNumber;
            // Visual cue that this is an AI result
            card.style.borderColor = 'rgba(0, 255, 187, 0.3)'; 
            
            card.innerHTML = `
                <div class="card-bg-num">${surah.chapterNumber}</div>
                <div class="card-title">${surah.title}</div>
                <div class="card-sub">${surah.english_name || ''}</div>
            `;
            card.onclick = () => { closeSearch(); launchPlayer(surah.chapterNumber, 1); };
            card.onkeydown = (e) => { if(e.key === 'Enter') card.click(); };
            resultsContainer.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        resultsContainer.innerHTML = '<div class="no-results">Search service unavailable.</div>';
    }
}

function openSearch() {
    elements.search.overlay.classList.add('active');
    searchString = "";
    elements.search.inputDisplay.textContent = "";
    elements.search.resultsGrid.innerHTML = '<div class="no-results">Use the keyboard to describe a topic...<br><span style="font-size:1.2rem;color:#444">(e.g. "Story of Joseph", "Laws of inheritance")</span></div>';
    
    setTimeout(() => {
        const firstKey = elements.search.keyboardGrid.querySelector('.key');
        if(firstKey) firstKey.focus();
    }, 100);
}

function closeSearch() {
    elements.search.overlay.classList.remove('active');
    setActiveNav(elements.sidebar.home);
    document.getElementById('door-play-btn').focus();
}

// NEW: Netflix-style Intro Logic
function playNetflixIntro() {
    const intro = document.getElementById('intro-overlay');
    const audio = document.getElementById('intro-sound');
    if(!intro || !audio) return;
    
    intro.style.display = 'flex'; // Ensure visible
    
    // Attempt autoplay (might be blocked by browser without interaction)
    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("Intro autoplay blocked by policy - user must interact first");
            // Optionally force hide if blocked to avoid stuck screen, 
            // or leave it for the animation to handle.
        });
    }

    // Sync fade out with audio length (approx 3-4s)
    setTimeout(() => {
        intro.classList.add('intro-fade-out');
        setTimeout(() => {
            intro.style.display = 'none';
        }, 1000);
    }, 10000); 
}

// --- SPATIAL NAVIGATION (D-Pad Logic for Android TV) ---
function initSpatialNavigation() {
    // 1. Define what elements can be focused (buttons, cards, inputs)
    const focusableSelector = '.nav-item, .surah-card, .dash-btn, input, button, .key, [tabindex="0"]';

    window.addEventListener('keydown', (e) => {
        // Map Android TV keys
        const key = e.key;
        const validKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

        if (!validKeys.includes(key)) return;

        // 2. STOP the default scrolling behavior!
        e.preventDefault();

        // 3. Find currently focused element
        const current = document.activeElement;
        
        // Get all focusable items currently visible on screen
        const allFocusable = Array.from(document.querySelectorAll(focusableSelector))
            .filter(el => {
                // Only interact with visible elements that aren't hidden/disabled
                return el.offsetParent !== null && !el.disabled && el.style.display !== 'none'; 
            });

        // If nothing is focused (or focus is lost), start at the first item
        if (!current || !allFocusable.includes(current)) {
            // Prefer the "Continue/Play" button if visible, else the first card
            const startBtn = document.getElementById('door-play-btn');
            if(startBtn && startBtn.offsetParent !== null) startBtn.focus();
            else allFocusable[0]?.focus();
            return;
        }

        // 4. Calculate the best candidate to move to
        const nextElement = findNextFocus(current, key, allFocusable);

        if (nextElement) {
            nextElement.focus();
            // Smoothly scroll the page to keep the focused item in view
            nextElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }
    });
}

// Math logic to find the "nearest neighbor" in the direction you pressed
function findNextFocus(current, direction, candidates) {
    const curRect = current.getBoundingClientRect();
    const curCenter = {
        x: curRect.left + curRect.width / 2,
        y: curRect.top + curRect.height / 2
    };

    let bestCandidate = null;
    let minDistance = Infinity;

    candidates.forEach(cand => {
        if (cand === current) return;

        const candRect = cand.getBoundingClientRect();
        const candCenter = {
            x: candRect.left + candRect.width / 2,
            y: candRect.top + candRect.height / 2
        };

        // Check if the candidate is generally in the correct direction
        let isValid = false;
        switch (direction) {
            case 'ArrowRight':
                // Must be to the right (x > x) and allow slight vertical overlap
                isValid = candRect.left >= curRect.left + (curRect.width * 0.5); 
                break;
            case 'ArrowLeft':
                isValid = candRect.right <= curRect.right - (curRect.width * 0.5);
                break;
            case 'ArrowDown':
                isValid = candRect.top >= curRect.top + (curRect.height * 0.5);
                break;
            case 'ArrowUp':
                isValid = candRect.bottom <= curRect.bottom - (curRect.height * 0.5);
                break;
        }

        if (isValid) {
            // Calculate distance to this candidate
            const dx = candCenter.x - curCenter.x;
            const dy = candCenter.y - curCenter.y;
            // Euclidean distance (straight line)
            const dist = Math.sqrt(dx * dx + dy * dy);

            // PENALTY: Prefer items directly in line with the current one.
            // If pressing UP/DOWN, penalize items that are far to the left/right.
            // If pressing LEFT/RIGHT, penalize items that are far up/down.
            let penalty = 0;
            if (direction === 'ArrowUp' || direction === 'ArrowDown') {
                penalty = Math.abs(dx) * 2.5; // High penalty for horizontal misalignment
            } else {
                penalty = Math.abs(dy) * 2.5; // High penalty for vertical misalignment
            }

            const totalScore = dist + penalty;

            if (totalScore < minDistance) {
                minDistance = totalScore;
                bestCandidate = cand;
            }
        }
    });

    return bestCandidate;
}

document.addEventListener('DOMContentLoaded', initializeApp);
