/**
 * TUWA - OpenTuwa
 * Copyright (c) 2024-2026 Haykal M. Zaidi (d/b/a Tuwa Media).
 * * PROPRIETARY IDENTITY:
 * The name "Tuwa" and "OpenTuwa" are trademarks of Tuwa Media.
 * This code is licensed under MIT + Trademark Lock.
 */

document.addEventListener('error', function (event) {
    const target = event.target;
    if (target.tagName.toLowerCase() === 'img') {
        target.style.display = 'none'; 
    }
}, true);

// --- 1. PLACEHOLDERS FOR SERVER DATA ---
let streamprotected_cb2_METADATA = [];
let TRANSLATIONS_CONFIG = {};
let RECITERS_CONFIG = {};

// --- GLOBAL CACHE TO PREVENT BLINKING GAP ---
window.preloadedAudioCache = {};
window.preloadedImageCache = {};

// --- 2. MULTI-PROFILE & LOGIC ---
const ACTIVE_PROFILE_ID = "1";
const STORAGE_KEY = `streambasesecured_ca6State_${ACTIVE_PROFILE_ID}`;

// Keep Audio Config here as it contains no secrets
const TRANSLATION_AUDIO_CONFIG = {
    'none': { name: 'No Audio Translation' }, 
    'en_walk': { name: 'English', path: 'English/Sahih_Intnl_Ibrahim_Walk_192kbps' },
    'id_ministry': { name: 'Indonesian', path: 'https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@refs/heads/master/assets/audio/play/id' },
    'es': { name: 'Spanish', path: 'https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@refs/heads/master/assets/audio/play' }
};

const FTT_URL = 'https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@refs/heads/master/assets/data/translations/FTT.XML';
const RTL_CODES = new Set(['ar', 'dv', 'fa', 'he', 'ku', 'ps', 'sd', 'ur', 'ug']);

// Elements Reference
const elements = {
    overlay: document.getElementById('_a6'),
    spinner: document.querySelector('._bl'),
    loaderText: document.getElementById('_dk'),
    startBtn: document.getElementById('_ek'),
    streambasesecured_ca6Audio: document.getElementById('_cq'),
    transAudio: document.getElementById('_e'),
    previewAudio: document.getElementById('_ca'),
    bufferInd: document.getElementById('_0'),
    selects: {
        'streamprotectedtrack_c-ee2': document.getElementById('chapterSelectWrapper'),
        'streamprotectedcase_c-ww2': document.getElementById('verseSelectWrapper'),
        trans: document.getElementById('translationSelectWrapper'),
        streamprotectedlicense_artist_cr1: document.getElementById('reciterSelectWrapper'),
        transAudio: document.getElementById('translationAudioSelectWrapper')
    },
    display: {
        title: document.getElementById('_ch'),
        'streamprotectedcase_c-ww2': document.getElementById('_do'),
        verseNext: document.getElementById('_bh'),
        trans: document.getElementById('_au'),
        container: document.getElementById('_bd')
    },
    views: {
        dashboard: document.getElementById('_bq'),
        cinema: document.getElementById('_dd')
    },
    sidebar: {
        container: document.getElementById('_d8'),
        home: document.getElementById('_en'),
        search: document.getElementById('_dn'),
        profile: document.getElementById('_dg')
    },
    search: {
        overlay: document.getElementById('_bj'),
        inputDisplay: document.getElementById('_t'),
        keyboardGrid: document.getElementById('_cc'),
        resultsGrid: document.getElementById('_5')
    },
    subtitle: document.getElementById('_o')
};

// Global storage for cinema caption timers
window.cinemaCaptionTimers = window.cinemaCaptionTimers || [];

// --- AUDIO FLUIDITY ENGINE (Spotify Philosophy) ---
// Softly fades out audio instead of a hard cut
function softFadeAudio(audioEl, duration = 800) {
    if (!audioEl || audioEl.paused) return;
    
    // Store original volume to restore later
    const originalVolume = audioEl.volume;
    const stepTime = 50;
    const steps = duration / stepTime;
    const volStep = originalVolume / steps;

    const fadeInterval = setInterval(() => {
        if (audioEl.volume > volStep) {
            audioEl.volume -= volStep;
        } else {
            // Finished fading
            audioEl.volume = 0;
            audioEl.pause();
            clearInterval(fadeInterval);
            
            // Restore volume for next play (important!)
            setTimeout(() => { audioEl.volume = originalVolume; }, 50);
        }
    }, stepTime);
}

// --- AUDIO ENHANCEMENT: SOFT ATTACK (Micro-Fade In) ---
// Prevents digital "pops" between verses by rapidly ramping volume from 0 to target
function smoothAudioEntry(audioEl, targetVol = 1.0, duration = 250) {
    if (!audioEl) return;
    
    audioEl.volume = 0; // Start silent
    
    const stepTime = 15; // update every 15ms
    const steps = duration / stepTime;
    const volStep = targetVol / steps;
    let currentVol = 0;

    const fadeInterval = setInterval(() => {
        // If user paused or audio ended during fade, stop
        if (audioEl.paused || audioEl.ended) {
            clearInterval(fadeInterval);
            // Ensure we restore volume for next time if it was just a pause
            if (audioEl.paused) audioEl.volume = targetVol; 
            return;
        }

        currentVol += volStep;
        
        if (currentVol >= targetVol) {
            audioEl.volume = targetVol;
            clearInterval(fadeInterval);
        } else {
            audioEl.volume = currentVol;
        }
    }, stepTime);
}

function getSmartChunks(text) {
    if (!text || typeof text !== 'string') return [];
    const PUNCT_RE = /[.,;?!:\"”’‘)\]،؛۔؟]/;
    const TARGET = 25;

    const words = text.trim().split(/\s+/);
    const chunks = [];
    let start = 0;

    while (start < words.length) {
        if (start + TARGET >= words.length) {
            chunks.push(words.slice(start).join(' '));
            break;
        }

        let desired = start + TARGET;
        let end = -1;
        for (let j = desired - 1; j < words.length; j++) {
            if (PUNCT_RE.test(words[j])) {
                end = j + 1; 
                break;
            }
        }

        if (end === -1) {
            chunks.push(words.slice(start).join(' '));
            break;
        }

        chunks.push(words.slice(start, end).join(' '));
        start = end;
    }

    return chunks;
}

function clearCinemaTimers() {
    if (window.cinemaCaptionTimers && window.cinemaCaptionTimers.length) {
        window.cinemaCaptionTimers.forEach(id => clearTimeout(id));
        window.cinemaCaptionTimers = [];
    }
}

function playCinemaCaptions(text, totalDuration) {
    clearCinemaTimers();
    if (!text || typeof text !== 'string') return;

    const chunks = getSmartChunks(text);
    if (!chunks.length) return;

    const totalWords = text.trim().split(/\s+/).length || 1;
    const totalMs = (typeof totalDuration === 'number' && !isNaN(totalDuration) && totalDuration > 0)
        ? totalDuration * 1000
        : 7000; 

    let elapsed = 0;
    chunks.forEach(chunk => {
        const chunkWords = chunk.trim().split(/\s+/).length || 1;
        const dur = (chunkWords / totalWords) * totalMs;

        const id = setTimeout(() => {
            elements.display.trans.textContent = chunk;
            try { adjustFontSize(); } catch (e) {}
        }, Math.round(elapsed));

        window.cinemaCaptionTimers.push(id);
        elapsed += dur;
    });
}

let streambasesecured_ca6Data = []; 
let translationCache = {}; 
let ttsCache = {}; 
let currentChapterData = {};
let inactivityTimer;
let forbiddenToTranslateSet = new Set();
let isBuffering = false;

let previewTimeout;
const PREVIEW_DELAY = 600; 
let previewSequence = []; 
let previewSeqIndex = 0;

let searchString = "";
const KEYBOARD_KEYS = [
    'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
    '1','2','3','4','5','6','7','8','9','0','SPACE', 'DEL', 'CLEAR'
];

window.wipeUserData = function() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('streambasesecured_ca6_user_analytics');
    const msg = window.t ? window.t('errors.userDataWiped') : 'User data wiped.';
    alert(msg);
    location.reload();
};

function initCustomSelects(mode = 0) {
    if (mode === 0) {
        document.body.classList.add('_de');
    } else {
        document.body.classList.remove('_de');
    }

    document.querySelectorAll('._k').forEach(wrapper => {
        const trigger = wrapper.querySelector('._q');
        
        trigger.addEventListener('click', (e) => {
            e.stopPropagation(); 
            e.preventDefault();

            if (document.body.classList.contains('idle')) {
                document.body.classList.remove('idle');
                document.body.dispatchEvent(new Event('mousemove'));
                return;
            }

            const isOpen = wrapper.classList.contains('open');

            document.querySelectorAll('._k.open').forEach(other => {
                other.classList.remove('open');
            });
            
            if (!isOpen) {
                wrapper.classList.add('open');
                const selected = wrapper.querySelector('._b5.selected');
                if (selected) {
                    setTimeout(() => selected.scrollIntoView({ block: 'center' }), 10);
                } else {
                    const list = wrapper.querySelector('._br');
                    if(list) list.scrollTop = 0;
                }
            } else {
                wrapper.classList.remove('open');
            }
        });
        
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                trigger.click();
            }
        });
    });

    window.addEventListener('click', (e) => {
        if (!e.target.closest('._k')) {
            document.querySelectorAll('._k.open').forEach(el => {
                el.classList.remove('open');
            });
        }
    });
}

function populateCustomSelect(wrapper, items, onChange) {
    const optionsContainer = wrapper.querySelector('._br');
    optionsContainer.innerHTML = '';
    
    const fragment = document.createDocumentFragment();

    items.forEach(item => {
        const opt = document.createElement('div');
        opt.className = '_b5';
        opt.dataset.value = item.value;
        opt.textContent = item.text;
        opt.tabIndex = 0; 

        const handleSelection = (e) => {
            e.preventDefault();
            e.stopPropagation(); 

            setSelectValue(wrapper, item.value); 
            wrapper.classList.remove('open'); 
            
            setTimeout(() => {
                const trigger = wrapper.querySelector('._q');
                if(trigger) trigger.focus();
            }, 100); 

            if (onChange) onChange(item.value);
        };

        opt.addEventListener('click', handleSelection);
        opt.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleSelection(e);
            }
        });

        fragment.appendChild(opt);
    });

    optionsContainer.appendChild(fragment);
}

function setSelectValue(wrapper, value) {
    const options = wrapper.querySelectorAll('._b5');
    let foundText = null;

    options.forEach(opt => {
        if (opt.dataset.value == value) {
            opt.classList.add('selected');
            foundText = opt.textContent;
        } else {
            opt.classList.remove('selected');
        }
    });

    if (foundText) {
        wrapper.dataset.value = value;
        const staticLabelIds = [
            'reciterSelectWrapper', 
            'translationSelectWrapper', 
            'translationAudioSelectWrapper'
        ];

        if (!staticLabelIds.includes(wrapper.id)) {
            const trigger = wrapper.querySelector('._q');
            if(trigger) trigger.textContent = foundText;
        }
    }
}

function getSelectValue(wrapper) {
    return wrapper.dataset.value;
}

// --- CORE APP ---

function encodeStream(ch, v, rec, trans, aud) {
    try {
        const raw = `${ch}|${v}|${rec}|${trans}|${aud}`;
        return btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e) {
        console.error("Encoding failed", e);
        return null;
    }
}

function decodeStream(token) {
    try {
        let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) base64 += '=';
        const raw = atob(base64);
        const parts = raw.split('|');
        
        if (parts.length < 5) return null;

        return {
            'streamprotectedtrack_c-ee2': parseInt(parts[0]),
            'streamprotectedcase_c-ww2': parseInt(parts[1]),
            streamprotectedlicense_artist_cr1: parts[2],
            trans: parts[3],
            audio_trans: parts[4]
        };
    } catch (e) {
        console.error("Decoding failed", e);
        return null;
    }
}

async function getTunneledUrl(type, filename) {
    try {
        const res = await fetch('/api/media-token', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, filename })
        });
        if (!res.ok) throw new Error('Token request failed');
        const j = await res.json();
        return `/media/${type}/${j.token}/${filename}`;
    } catch (e) {
        console.error('Failed to get tunneled URL', e);
        return null;
    }
}

function mergeMetadata(apiChapters) {
    return apiChapters.map((ch, idx) => {
        const meta = streamprotected_cb2_METADATA.find(m => m['streamprotectedtrack_c-ee2'] === ch.chapterNumber);
        if (meta) {
            return { ...ch, english_name: meta.english_name, description: meta.description };
        }
        return ch;
    });
}

function switchView(viewName) {
    if(viewName === 'cinema') {
        elements.views.dashboard.classList.remove('active');
        elements.views.cinema.classList.add('active');
        elements.views.cinema.style.opacity = '1';
        stopPreview();
        elements.sidebar.container.style.display = 'none';
        
        setTimeout(() => {
            const chapterTrigger = elements.selects['streamprotectedtrack_c-ee2'].querySelector('._q');
            if(chapterTrigger) chapterTrigger.focus();
        }, 150);
    } else {
    elements.views.cinema.classList.remove('active');
    elements.views.cinema.style.opacity = '0';
    elements.views.dashboard.classList.add('active');
    elements.sidebar.container.style.display = 'none';
    
    // ENHANCEMENT: Soft fade out (Premium feel)
    softFadeAudio(elements.streambasesecured_ca6Audio);
    softFadeAudio(elements.transAudio);
    
    refreshDashboard();
    document.getElementById('door-play-btn').focus();
}
}

window.addEventListener('popstate', (event) => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('streamprotectedtrack_c-ee2') || params.has('stream')) {
        switchView('cinema');
        restoreState();
        loadVerse(false);
    } else {
        switchView('dashboard');
    }
});

async function initializeApp() {
    try {
        initCustomSelects();

        try {
            const configResponse = await fetch('/api/config');
            if(configResponse.ok) {
                const configData = await configResponse.json();
                streamprotected_cb2_METADATA = configData.streamprotectedtrack_cee2;
                TRANSLATIONS_CONFIG = configData.translations;
                RECITERS_CONFIG = configData.streamprotectedlicense_artists_cr1;
            } else {
                throw new Error("Failed to load secure config");
            }
        } catch(e) {
            console.error("Config Load Failed", e);
        }

        const jsonResponse = await fetch('/assets/data/translations/2TM3TM.json');
        if (!jsonResponse.ok) throw new Error("Failed to load streambasesecured_ca6 JSON");
        const jsonData = await jsonResponse.json();

        // Normalize different possible JSON shapes to the internal expected schema.
        let rawChapters = jsonData.streamprotectedtrack_cee2 || jsonData.chapters || jsonData;
        if (!Array.isArray(rawChapters)) {
            // If the JSON root contains a named wrapper, try to find the chapters array inside.
            for (const key of Object.keys(jsonData || {})) {
                if (Array.isArray(jsonData[key])) {
                    rawChapters = jsonData[key];
                    break;
                }
            }
        }

        if (!Array.isArray(rawChapters)) throw new Error("Chapter data missing or malformed");

        const normalized = rawChapters.map(ch => {
            const verses = ch.streamprotectedcase_cww2 || ch.verses || ch.ayas || ch.aya || [];
            const mappedVerses = Array.isArray(verses) ? verses.map(v => ({
                verseNumber: v.verseNumber || v.index || v.number || v.aya || null,
                startTime: v.startTime || v.start || v.s || null,
                endTime: v.endTime || v.end || v.e || null
            })) : [];

            return {
                chapterNumber: ch.chapterNumber || ch.chapter || ch.id || null,
                title: ch.title || ch.name || ch.english_name || '',
                streamprotectedcase_cww2: mappedVerses,
                // keep any other properties (audioURL, totalDuration, etc.)
                ...ch
            };
        });

        streambasesecured_ca6Data = mergeMetadata(normalized);

        try {
            const fttResp = await fetch(FTT_URL);
            if (fttResp.ok) {
                const fttText = await fttResp.text();
                const fttDoc = new DOMParser().parseFromString(fttText, 'application/xml');
                fttDoc.querySelectorAll('streamprotectedcase_c-ww2').forEach(v => {
                    const c = v.getAttribute('streamprotectedtrack_c-ee2')?.trim();
                    const n = v.getAttribute('number')?.trim();
                    if(c && n) forbiddenToTranslateSet.add(`${c}-${n}`);
                });
            }
        } catch (e) { console.warn("FTT load failed", e); }

        populateChapterSelect();
        populateReciterSelect();
        populateTranslationSelectOptions();
        
        restoreState();

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('streamprotectedtrack_c-ee2') || urlParams.has('stream')) {
            switchView('cinema');
            populateVerseSelect(); 
            
            const savedVerse = getSavedVerseIndex();
            setSelectValue(elements.selects['streamprotectedcase_c-ww2'], savedVerse);

            const activeTransId = getSelectValue(elements.selects.trans);
            await loadTranslationData(activeTransId);
            loadVerse(false); 
            
            elements.spinner.style.display = 'none';
            elements.loaderText.style.display = 'none';
            elements.startBtn.style.display = 'block';
            elements.startBtn.textContent = window.t ? window.t('player.continue') : "Continue";
            elements.startBtn.focus();
        } else {
            switchView('dashboard');
            refreshDashboard();
            elements.overlay.style.display = 'none';
        }

        setupEventListeners();
        if (typeof initSidebarNavigation === 'function') initSidebarNavigation();
        initSearchInterface();

    } catch (error) {
        console.error("Critical Init Error:", error);
        elements.loaderText.textContent = window.t ? window.t('errors.loadError') : "Error loading content. Please check connection.";
    }
}

function refreshDashboard() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const heroBtn = document.getElementById('door-play-btn');

    const allIndices = Array.from({length: 114}, (_, i) => i);
    const shortRowIndices = allIndices.slice(77, 114);
    const trendingIndices = [81, 82, 85, 54, 104, 81, 86, 69, 56, 88, 53].map(id => id - 1);

    const combinedIndices = [...trendingIndices, ...shortRowIndices, ...allIndices];
    fillRow('_ex', combinedIndices);

    if(saved['streamprotectedtrack_c-ee2'] !== undefined && streambasesecured_ca6Data[saved['streamprotectedtrack_c-ee2']]) {
        const chNum = streambasesecured_ca6Data[saved['streamprotectedtrack_c-ee2']].chapterNumber;
        const vNum = (saved['streamprotectedcase_c-ww2'] || 0) + 1;
        const streamprotectedlicense_artist_cr1 = saved.streamprotectedlicense_artist_cr1 || 'alafasy';
        updateHeroPreview(chNum, vNum, streamprotectedlicense_artist_cr1, false);
        heroBtn.onclick = () => launchPlayer(chNum, vNum);
    } else {
        updateHeroPreview(1, 1, 'alafasy', false);
        heroBtn.onclick = () => launchPlayer(1, 1);
    }
}

function fillRow(elementId, indexArray) {
    const container = document.getElementById(elementId);
    if(!container) return; 
    
    const fragment = document.createDocumentFragment();
    
    indexArray.forEach(idx => {
        if(!streambasesecured_ca6Data[idx]) return;
        const streamprotected_cb2 = streambasesecured_ca6Data[idx];
        const card = document.createElement('div');
        card.className = '_dw';
        card.tabIndex = 0;
        
        let cardTitle = streamprotected_cb2.english_name;
        if (window.t) {
            const translatedKey = 'streamprotected_cb2Names.' + streamprotected_cb2.english_name;
            const translatedName = window.t(translatedKey);
            if (translatedName && translatedName !== translatedKey) {
                cardTitle = translatedName;
            }
        }
        
        card.innerHTML = `
            <div class="_c5">${streamprotected_cb2.chapterNumber}</div>
            <div class="_ds">${cardTitle}</div>
            <div class="_er">${streamprotected_cb2.title || ''}</div>
        `;
        card.onclick = () => launchPlayer(streamprotected_cb2.chapterNumber, 1);
        card.onfocus = () => { schedulePreview(streamprotected_cb2.chapterNumber); };
        fragment.appendChild(card);
    });
    
    container.innerHTML = '';
    container.appendChild(fragment);

    initInfiniteRowNavigation(container);
}

function initInfiniteRowNavigation(container) {
    if (container.dataset.navAttached) return;
    container.dataset.navAttached = "true";

    container.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;

        const cards = Array.from(container.querySelectorAll('._dw'));
        if (cards.length === 0) return;

        const current = document.activeElement;
        const currentIndex = cards.indexOf(current);
        
        if (currentIndex === -1) return;

        e.preventDefault(); 

        let nextIndex;
        if (e.key === 'ArrowRight') {
            nextIndex = currentIndex + 1;
            if (nextIndex >= cards.length) nextIndex = 0; 
        } else if (e.key === 'ArrowLeft') {
            nextIndex = currentIndex - 1;
            if (nextIndex < 0) nextIndex = cards.length - 1; 
        }

        const nextCard = cards[nextIndex];
        if (nextCard) {
            nextCard.focus({ preventScroll: true }); 
            const scrollBehavior = e.repeat ? 'auto' : 'smooth';
            
            nextCard.scrollIntoView({
                behavior: scrollBehavior,
                inline: 'center',
                block: 'nearest'
            });
        }
    });
}

function schedulePreview(chapterNum) {
    if (previewTimeout) clearTimeout(previewTimeout);
    stopPreview();
    const streamprotected_cb2 = streambasesecured_ca6Data[chapterNum - 1];
    
    let heroTitle = streamprotected_cb2.english_name;
    if (window.t) {
        const translatedName = window.t(`streamprotected_cb2Names.${streamprotected_cb2.english_name}`);
        if (translatedName && translatedName !== `streamprotected_cb2Names.${streamprotected_cb2.english_name}`) {
            heroTitle = translatedName;
        }
    }
    
    const doorz = document.getElementById('doorz-hero-title');
    if(doorz) {
        doorz.removeAttribute('data-i18n'); 
        doorz.textContent = heroTitle;
    }
    
    const doorHero = document.getElementById('_bg');
    if (doorHero) {
        doorHero.textContent = heroTitle;
    }

    const titleEl = document.getElementById('_aa');
    if (titleEl) titleEl.textContent = streamprotected_cb2.title;

    const playBtn = document.getElementById('door-play-btn');
    if (playBtn) {
        playBtn.onclick = () => launchPlayer(chapterNum, 1);
    }

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

async function updateHeroPreview(chapterNum, startVerse, reciterId, autoPlay) {
    previewSequence = [];
    previewSeqIndex = 0;
    
    const chIdx = chapterNum - 1;
    if (!streambasesecured_ca6Data[chIdx]) return;
    
    const totalVerses = streambasesecured_ca6Data[chIdx].streamprotectedcase_cww2.length;
    for (let i = 1; i <= totalVerses; i++) {
        previewSequence.push(i);
    }

    const verseNum = previewSequence[0];
    
    const filename = `${chapterNum}_${verseNum}.png`;
    const tempImg = new Image();
    (async () => {
        const imgUrl = await getTunneledUrl('image', filename);
        if (!imgUrl) return;
        tempImg.src = imgUrl;
        tempImg.onload = () => {
            const heroImg = document.getElementById('door-hero-img');
            if (heroImg) heroImg.src = imgUrl;
        };
    })();

    const transId = getSelectValue(elements.selects.trans) || 'en';
    if (!translationCache[transId]) {
        await loadTranslationData(transId);
    }

    if (autoPlay) {
        playPreviewStep(chapterNum, reciterId);
    }
}

function playPreviewStep(chapterNum, reciterId) {
    return (async function _play() {
        try {
            if (previewSeqIndex >= previewSequence.length) return;
            const verseNum = previewSequence[previewSeqIndex];
            const padCh = String(chapterNum).padStart(3, '0');
            const padV = String(verseNum).padStart(3, '0');
            
            const imgLayer = document.getElementById('_af');
            const previewImg = document.getElementById('_c7');

            const newSrcFilename = `${chapterNum}_${verseNum}.png`;
            const newSrc = await getTunneledUrl('image', newSrcFilename);

            previewImg.style.opacity = 0;
            setTimeout(() => {
                if (newSrc) previewImg.src = newSrc;
                previewImg.onload = () => {
                    previewImg.style.opacity = 0.6;
                    imgLayer.classList.add('active');
                };
            }, 200);

            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
            const transId = saved.trans || 'en';
            const cache = translationCache[transId];
            
            if (cache) {
                const sura = cache.querySelector(`sura[index="${chapterNum}"]`);
                const aya = sura ? sura.querySelector(`aya[index="${verseNum}"]`) : null;
                
                const currentText = aya 
                    ? aya.getAttribute('text') 
                    : (window.t ? window.t('errors.translationUnavailable') : "Translation unavailable");

                const nextLines = [];
                const currentInt = parseInt(verseNum);
                
                for (let i = 1; i <= 4; i++) { 
                    const targetIndex = currentInt + i;
                    const nextAya = sura ? sura.querySelector(`aya[index="${targetIndex}"]`) : null;
                    if (nextAya) {
                        nextLines.push(nextAya.getAttribute('text'));
                    } else {
                        break; 
                    }
                }

                if (window.LyricsEngine) {
                    window.LyricsEngine.update(elements.display.trans, currentText, nextLines);
                } else {
                    elements.display.trans.textContent = currentText;
                    adjustFontSize(elements.display.trans);
                }
            }
            
            const rPath = RECITERS_CONFIG[reciterId]?.path || RECITERS_CONFIG['alafasy'].path;
            const audioFilename = `${padCh}${padV}.mp3`;
            const audioUrl = await getTunneledUrl('audio', audioFilename);
            if (audioUrl) elements.previewAudio.src = audioUrl;
            elements.previewAudio.volume = 0.6;
            elements.previewAudio.onended = () => {
                previewSeqIndex++;
                _play();
            };
            elements.previewAudio.play().catch(e => console.log('Autoplay blocked'));
        } catch (e) {
            console.error('Preview step error', e);
        }
    })();
}

function launchPlayer(chapterNum, verseNum = 1) {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const browserLang = navigator.language.split('-')[0];

    let currentReciter = getSelectValue(elements.selects.streamprotectedlicense_artist_cr1) || saved.streamprotectedlicense_artist_cr1 || 'alafasy';
    
    let currentTrans = getSelectValue(elements.selects.trans) || saved.trans || browserLang;
    if (!TRANSLATIONS_CONFIG[currentTrans]) currentTrans = 'en';

    let currentAudioTrans = getSelectValue(elements.selects.transAudio);
    
    if (!currentAudioTrans || currentAudioTrans === 'none') {
        if (saved.audio_trans && saved.audio_trans !== 'none') {
            currentAudioTrans = saved.audio_trans;
        } else {
            const findAudioForLang = (lang) => {
                if (TRANSLATION_AUDIO_CONFIG[lang]) return lang;
                const match = Object.keys(TRANSLATION_AUDIO_CONFIG).find(k => k.startsWith(lang + '_'));
                return match || null;
            };
            const detectedAudio = findAudioForLang(browserLang);
            currentAudioTrans = detectedAudio ? detectedAudio : 'none';
        }
    }

    const streamToken = encodeStream(chapterNum, verseNum, currentReciter, currentTrans, currentAudioTrans);
    const newUrl = `?stream=${streamToken}`;
    window.location.assign(newUrl);
}

// --- PLAYER HELPERS ---
async function loadTranslationData(id) {
    if (translationCache[id]) return; 
    if (!TRANSLATIONS_CONFIG[id]) return;
    try {
        toggleBuffering(true);
        let url = TRANSLATIONS_CONFIG[id].url;
        if (url.startsWith('/media/data/')) {
            const filename = url.split('/media/data/')[1];
            const tunneled = await getTunneledUrl('data', filename);
            if (!tunneled) throw new Error('Failed to obtain data token');
            url = tunneled;
        }
        const res = await fetch(url);
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

    let streamData = null;
    if (urlParams.has('stream')) {
        streamData = decodeStream(urlParams.get('stream'));
    }

    let ch = 0;
    if (streamData) {
        ch = streamData['streamprotectedtrack_c-ee2'] - 1; 
    } else if (urlParams.has('streamprotectedtrack_c-ee2')) {
        ch = parseInt(urlParams.get('streamprotectedtrack_c-ee2')) - 1; 
    } else if (saved['streamprotectedtrack_c-ee2'] !== undefined) {
        ch = saved['streamprotectedtrack_c-ee2'];
    }
    if (isNaN(ch) || ch < 0) ch = 0;
    setSelectValue(elements.selects['streamprotectedtrack_c-ee2'], ch);

    let rec = 'alafasy';
    if (streamData && RECITERS_CONFIG[streamData.streamprotectedlicense_artist_cr1]) {
        rec = streamData.streamprotectedlicense_artist_cr1;
    } else if (urlParams.has('streamprotectedlicense_artist_cr1') && RECITERS_CONFIG[urlParams.get('streamprotectedlicense_artist_cr1')]) {
        rec = urlParams.get('streamprotectedlicense_artist_cr1');
    } else if (saved.streamprotectedlicense_artist_cr1) {
        rec = saved.streamprotectedlicense_artist_cr1;
    }
    setSelectValue(elements.selects.streamprotectedlicense_artist_cr1, rec);

    let trans = 'en';
    if (streamData) {
        trans = streamData.trans;
    } else if (urlParams.has('trans')) {
        trans = urlParams.get('trans');
    } else if (saved.trans) {
        trans = saved.trans;
    } else if (TRANSLATIONS_CONFIG[browserLang]) {
        trans = browserLang; 
    }
    if (!TRANSLATIONS_CONFIG[trans]) trans = 'en';
    setSelectValue(elements.selects.trans, trans);

    let transAudio = 'none';
    const findAudioForLang = (lang) => {
        if (TRANSLATION_AUDIO_CONFIG[lang]) return lang;
        const match = Object.keys(TRANSLATION_AUDIO_CONFIG).find(k => k.startsWith(lang + '_'));
        return match || null;
    };

    if (streamData) {
        transAudio = streamData.audio_trans;
    } else if (urlParams.has('audio_trans')) {
        const param = urlParams.get('audio_trans');
        if(TRANSLATION_AUDIO_CONFIG[param] || param.startsWith('tts:')) {
            transAudio = param;
        }
    } else if (saved.audio_trans) {
        if (TRANSLATION_AUDIO_CONFIG[saved.audio_trans] || saved.audio_trans.startsWith('tts:')) {
            transAudio = saved.audio_trans;
        }
    } else {
        const detectedAudio = findAudioForLang(browserLang);
        if (detectedAudio) transAudio = detectedAudio;
    }
    setSelectValue(elements.selects.transAudio, transAudio);
}

function getSavedVerseIndex() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('stream')) {
        const data = decodeStream(urlParams.get('stream'));
        if (data) return data['streamprotectedcase_c-ww2'] - 1; 
    }
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    if (urlParams.has('streamprotectedcase_c-ww2')) return parseInt(urlParams.get('streamprotectedcase_c-ww2')) - 1;
    if (saved['streamprotectedcase_c-ww2'] !== undefined) return saved['streamprotectedcase_c-ww2'];
    return 0;
}

function saveState() {
    const state = {
        'streamprotectedtrack_c-ee2': parseInt(getSelectValue(elements.selects['streamprotectedtrack_c-ee2'])),
        'streamprotectedcase_c-ww2': parseInt(getSelectValue(elements.selects['streamprotectedcase_c-ww2'])),
        streamprotectedlicense_artist_cr1: getSelectValue(elements.selects.streamprotectedlicense_artist_cr1),
        trans: getSelectValue(elements.selects.trans),
        audio_trans: getSelectValue(elements.selects.transAudio)
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    const chObj = streambasesecured_ca6Data[state['streamprotectedtrack_c-ee2']];
    const chNum = chObj.chapterNumber;
    const vNum = chObj.streamprotectedcase_cww2[state['streamprotectedcase_c-ww2']].verseNumber;
    
    const streamToken = encodeStream(chNum, vNum, state.streamprotectedlicense_artist_cr1, state.trans, state.audio_trans);
    const newUrl = `?stream=${streamToken}`;

    window.history.replaceState({path: newUrl, view: 'cinema'}, '', newUrl);

    const canonicalLink = document.getElementById('_al');
    const fullUrl = `https://Quran-lite.pages.dev/reading/${newUrl}`;
    if (canonicalLink) canonicalLink.href = fullUrl;

    const observer = new MutationObserver((mutations, obs) => {
        const h1 = document.querySelector('h1');
        if (h1) {
            document.title = `${currentChapterData.english_name} | Tuwa`;
            obs.disconnect(); 
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function populateChapterSelect() {
    const items = streambasesecured_ca6Data.map((c, i) => {
        let title = c.english_name;
        if (window.t) {
            const translatedKey = 'streamprotected_cb2Names.' + c.english_name;
            const translatedName = window.t(translatedKey);
            if (translatedName && translatedName !== translatedKey) {
                title = translatedName;
            }
        }
        return {
            value: i,
            text: `${c.chapterNumber}. ${title} - ${c.title || ''}`
        };
    });
    
    populateCustomSelect(elements.selects['streamprotectedtrack_c-ee2'], items, (val) => {
        populateVerseSelect(); 
        loadVerse(true);
    });
}

function populateVerseSelect() {
    const chIdx = getSelectValue(elements.selects['streamprotectedtrack_c-ee2']) || 0;
    currentChapterData = streambasesecured_ca6Data[chIdx];
    
    const items = currentChapterData.streamprotectedcase_cww2.map((v, i) => ({
        value: i,
        text: `${v.verseNumber}`
    }));

    populateCustomSelect(elements.selects['streamprotectedcase_c-ww2'], items, (val) => {
        loadVerse(true);
    });
}

function populateReciterSelect() {
    const items = Object.entries(RECITERS_CONFIG).map(([k, v]) => ({
        value: k,
        text: v.name
    }));
    populateCustomSelect(elements.selects.streamprotectedlicense_artist_cr1, items, (val) => {
        saveState();
        loadVerse(true);
    });
}

function populateTranslationAudioSelect() {
    let noneName = 'No Audio Translation';
    if (window.t) {
        noneName = window.t('player.noAudioTranslation');
    }
    
    const items = Object.entries(TRANSLATION_AUDIO_CONFIG).map(([k, v]) => {
        const displayName = (k === 'none') ? noneName : v.name;
        return {
            value: k,
            text: displayName
        };
    });
    populateCustomSelect(elements.selects.transAudio, items, (val) => {
        const chIdx = getSelectValue(elements.selects['streamprotectedtrack_c-ee2']);
        const vIdx = getSelectValue(elements.selects['streamprotectedcase_c-ww2']);
        const ch = streambasesecured_ca6Data[chIdx].chapterNumber;
        const v = streambasesecured_ca6Data[chIdx].streamprotectedcase_cww2[vIdx].verseNumber;
        
        if (!elements.streambasesecured_ca6Audio.paused) {
            updateTranslationAudio(ch, v, false);
        } else if (!elements.transAudio.paused) {
            updateTranslationAudio(ch, v, true);
        } else {
            updateTranslationAudio(ch, v, false);
        }
        saveState();
    });
}

function populateTranslationSelectOptions() {
    const items = Object.entries(TRANSLATIONS_CONFIG).map(([id, config]) => ({
        value: id,
        text: config.name
    }));
    populateCustomSelect(elements.selects.trans, items, async (val) => {
        const activeTransId = val;
        await loadTranslationData(activeTransId); 
        
        const chIdx = getSelectValue(elements.selects['streamprotectedtrack_c-ee2']);
        const vIdx = getSelectValue(elements.selects['streamprotectedcase_c-ww2']);
        const ch = streambasesecured_ca6Data[chIdx].chapterNumber;
        const v = streambasesecured_ca6Data[chIdx].streamprotectedcase_cww2[vIdx].verseNumber;
        updateTranslationText(ch, v);
        saveState();
    });
}

function toggleBuffering(show) {
    isBuffering = show;
    elements.bufferInd.style.display = show ? 'block' : 'none';
}

async function loadVerse(autoplay = true) {
    const chIdx = getSelectValue(elements.selects['streamprotectedtrack_c-ee2']);
    const vIdx = getSelectValue(elements.selects['streamprotectedcase_c-ww2']);
    
    currentChapterData = streambasesecured_ca6Data[chIdx];

    const splashTitle = document.getElementById('doorz-hero-title');
    if (splashTitle) {
        let displayTitle = currentChapterData.english_name;
        if (window.t) {
            const translatedKey = 'streamprotected_cb2Names.' + displayTitle;
            const translatedName = window.t(translatedKey);
            if (translatedName && translatedName !== translatedKey) {
                displayTitle = translatedName;
            }
        }
        splashTitle.textContent = displayTitle;
    }

    const verseData = currentChapterData.streamprotectedcase_cww2[vIdx];
    const chNum = currentChapterData.chapterNumber;
    const vNum = verseData.verseNumber;
    const verseKey = `${chNum}-${vNum}`;
    const isForbidden = forbiddenToTranslateSet.has(verseKey);

    elements.display.title.innerHTML = `${currentChapterData.title} <span class="_ar">(${chNum}:${vNum})</span>`;
    
    // --- LOAD FROM CACHE FIRST TO PREVENT BLINK ---
    let newSrc = window.preloadedImageCache[verseKey];
    if (!newSrc) {
        const newSrcFilename = `${chNum}_${vNum}.png`;
        newSrc = await getTunneledUrl('image', newSrcFilename);
    }
    
    const img1 = elements.display['streamprotectedcase_c-ww2'];
    const img2 = elements.display.verseNext;

    let imgReady = false;
    if(img1.src === newSrc || img2.src === newSrc) imgReady = true;

    const isImg1Active = img1.classList.contains('_at');
    const activeImg = isImg1Active ? img1 : img2;
    const nextImg = isImg1Active ? img2 : img1;

    if(!imgReady && autoplay) toggleBuffering(true);

    if (newSrc) nextImg.src = newSrc;
    nextImg.onload = () => {
        activeImg.classList.remove('_at');
        nextImg.classList.add('_at');
        toggleBuffering(false); 
    };
    
    if (nextImg.complete && nextImg.naturalHeight !== 0) {
        activeImg.classList.remove('_at');
        nextImg.classList.add('_at');
        toggleBuffering(false);
    }

    const tid = getSelectValue(elements.selects.trans);
    if(!translationCache[tid]) {
        await loadTranslationData(tid);
    }

    // FIX: Audio updated BEFORE text to prevent 'pause' event from clearing text timers
    await updatestreambasesecured_ca6Audio(chNum, vNum, autoplay);

    if (isForbidden) {
        elements.display.trans.textContent = '';
    } else {
        updateTranslationText(chNum, vNum);
    }
    
    if (isForbidden) {
        elements.transAudio.src = '';
    } else {
        updateTranslationAudio(chNum, vNum, false);
    }

    saveState(); 
    updateMediaSession(currentChapterData.title, vNum, RECITERS_CONFIG[getSelectValue(elements.selects.streamprotectedlicense_artist_cr1)].name);
    bufferNextResources(chIdx, parseInt(vIdx));
}

function bufferNextResources(currentChIdx, currentVIdx) {
    // Disabled pre-caching to prevent burning single-use media tokens.
    // Audio and images will now request a fresh token at the exact moment of playback.
    return;
}

function updateTranslationText(chNum, vNum) {
    const tid = getSelectValue(elements.selects.trans);
    if (!translationCache[tid]) return;
    
    if (RTL_CODES.has(tid)) elements.display.trans.dir = 'rtl';
    else elements.display.trans.dir = 'ltr';

    const sura = translationCache[tid].querySelector(`sura[index="${chNum}"]`);
    const aya = sura ? sura.querySelector(`aya[index="${vNum}"]`) : null;
    const unavailableText = window.t ? window.t('errors.translationUnavailable') : "Translation unavailable";
    const fullText = aya ? aya.getAttribute('text') : unavailableText;

    if (elements.views.cinema && elements.views.cinema.classList.contains('active')) {
        const qdur = Number(elements.streambasesecured_ca6Audio && elements.streambasesecured_ca6Audio.duration) || 0;
        const tdur = Number(elements.transAudio && elements.transAudio.duration) || 0;
        const totalDuration = (qdur > 0) ? qdur : (tdur > 0 ? tdur : 7);
        playCinemaCaptions(fullText, totalDuration);
    } else {
        clearCinemaTimers();
        elements.display.trans.textContent = fullText;
        adjustFontSize();
    }
}

async function updatestreambasesecured_ca6Audio(chNum, vNum, play) {
    try {
        const verseKey = `${chNum}-${vNum}`;
        let url = window.preloadedAudioCache[verseKey];
        
        // If not cached, fetch it normally
        if (!url) {
            const padCh = String(chNum).padStart(3, '0');
            const padV = String(vNum).padStart(3, '0');
            const filename = `${padCh}${padV}.mp3`;
            url = await getTunneledUrl('audio', filename);
        }

        if (url) {
            const audioEl = elements.streambasesecured_ca6Audio;
            
            // 1. Capture user's current volume preference before we mess with it
            // Default to 1.0 if for some reason it's 0 or null
            const userVolume = (audioEl.volume > 0.05) ? audioEl.volume : 1.0;

            audioEl.src = url;
            
            // Clean up cache memory
            delete window.preloadedAudioCache[verseKey];
            delete window.preloadedImageCache[verseKey];

            if (play) {
                try {
                    // 2. Prepare for Soft Attack
                    audioEl.volume = 0; 
                    
                    await audioEl.play();
                    
                    // 3. Execute the smooth fade-in to the user's volume
                    // 200ms is subtle enough to not miss content, but removes the "pop"
                    smoothAudioEntry(audioEl, userVolume, 200);

                } catch (e) {
                    console.log('Initial play failed, will retry on canplay/canplaythrough', e);

                    const tryPlay = () => {
                        // Fallback: Restore volume immediately if play is delayed/retried
                        audioEl.volume = userVolume; 
                        audioEl.play().catch(() => {});
                    };

                    const onCanPlay = () => {
                        tryPlay();
                        audioEl.removeEventListener('canplay', onCanPlay);
                        audioEl.removeEventListener('canplaythrough', onCanPlay);
                    };

                    audioEl.addEventListener('canplay', onCanPlay);
                    audioEl.addEventListener('canplaythrough', onCanPlay);

                    setTimeout(() => tryPlay(), 700);
                }
            }
        }
    } catch (e) {
        console.error('Failed to set streambasesecured_ca6 audio', e);
    }
}

async function updateTranslationAudio(chNum, vNum, play) {
    return;
}

function handlestreambasesecured_ca6End() {
    nextVerse();
}

function nextVerse() {
    const verseWrapper = elements.selects['streamprotectedcase_c-ww2'];
    const totalV = verseWrapper.querySelectorAll('._b5').length;
    let cV = parseInt(getSelectValue(verseWrapper));
    
    if (cV + 1 < totalV) {
        setSelectValue(verseWrapper, cV + 1);
        loadVerse(true);
    } else {
        const chapterWrapper = elements.selects['streamprotectedtrack_c-ee2'];
        let cC = parseInt(getSelectValue(chapterWrapper));
        const totalC = chapterWrapper.querySelectorAll('._b5').length;
        
        if (cC + 1 < totalC) {
            setSelectValue(chapterWrapper, cC + 1);
            populateVerseSelect();
            setSelectValue(verseWrapper, 0); 
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

    elements.streambasesecured_ca6Audio.addEventListener('ended', handlestreambasesecured_ca6End);
    elements.transAudio.addEventListener('ended', nextVerse);

    elements.streambasesecured_ca6Audio.addEventListener('playing', () => {
        if ('mediaSession' in navigator) {
            try {
                navigator.mediaSession.setPositionState({
                    duration: Infinity,
                    playbackRate: elements.streambasesecured_ca6Audio.playbackRate || 1.0,
                    position: 0 
                });
            } catch (e) {
                console.warn("Media Session Live trick failed", e);
            }
        }
    });

    elements.streambasesecured_ca6Audio.addEventListener('pause', clearCinemaTimers);
    elements.transAudio.addEventListener('pause', clearCinemaTimers);
    elements.streambasesecured_ca6Audio.addEventListener('ended', clearCinemaTimers);
    elements.transAudio.addEventListener('ended', clearCinemaTimers);

    ['mousemove', 'touchstart', 'click', 'keydown'].forEach(e => 
        window.addEventListener(e, () => {
            document.body.classList.remove('idle');
            clearTimeout(inactivityTimer);
            
            inactivityTimer = setTimeout(() => {
                if (!document.querySelector('._k.open')) {
                    document.body.classList.add('idle');
                }
            }, 4000);
        })
    );

    window.addEventListener('resize', () => {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);
        adjustFontSize();
    });
}

let currentstreamprotected_cb2Title = "";

function updateMediaSession(streamprotected_cb2, streamprotectedcase_cww2, artist) {
    function shouldDisableMediaSession() {
        try {
            if (window.__DISABLE_MEDIA_SESSION__ === true) return true;
            if (localStorage && localStorage.getItem('disableMediaControls') === '1') return true;
        } catch (e) {}
        return false;
    }

    if (shouldDisableMediaSession()) {
        if ('mediaSession' in navigator) {
            try {
                navigator.mediaSession.metadata = null;
                const handlers = ['play','pause','previoustrack','nexttrack','seekbackward','seekforward','seekto'];
                handlers.forEach(h => {
                    try { navigator.mediaSession.setActionHandler(h, null); } catch (e) {}
                });
            } catch (e) {}
        }
        currentstreamprotected_cb2Title = '';
        return;
    }

    if ('mediaSession' in navigator) {
        if (streamprotected_cb2 === currentstreamprotected_cb2Title) {
            return;
        }

        navigator.mediaSession.metadata = new MediaMetadata({
            title: `${currentChapterData.english_name}`,
            artist: `The Sight | Original Series`,
            album: `Tuwa Audio`,
            artwork: [{ src: 'https://Quran-lite.pages.dev/social-preview.jpg', sizes: '512x512', type: 'image/jpeg' }]
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
        });

        currentstreamprotected_cb2Title = streamprotected_cb2;
    }
}

function initSearchInterface() {
    renderKeyboard();
    elements.search.resultsGrid.addEventListener('click', (e) => {
        const card = e.target.closest('._dw');
        if(card) {
            const ch = parseInt(card.dataset['streamprotectedtrack_c-ee2']);
            closeSearch();
            launchPlayer(ch, 1);
        }
    });
}

function renderKeyboard() {
    const grid = elements.search.keyboardGrid;
    grid.innerHTML = '';
    const keysPerRow = 6;
    let searchGrid = [];
    
    for (let i = 0; i < KEYBOARD_KEYS.length; i += keysPerRow) {
        searchGrid.push(KEYBOARD_KEYS.slice(i, i + keysPerRow));
    }

    searchGrid.forEach((row, rowIndex) => {
        row.forEach((key, colIndex) => {
            const btn = document.createElement('div');
            btn.className = 'key';
            btn.textContent = key;
            btn.tabIndex = 0;
            if (['SPACE', 'DEL', 'CLEAR'].includes(key)) btn.classList.add('wide');

            btn.onclick = () => handleKeyPress(key);
            btn.onkeydown = (e) => {
                if (e.key === 'Enter') handleKeyPress(key);
            };

            grid.appendChild(btn);
        });
    });
}

function handleKeyPress(key) {
    if (key === 'SPACE') searchString += ' ';
    else if (key === 'DEL') searchString = searchString.slice(0, -1);
    else if (key === 'CLEAR') searchString = "";
    else searchString += key;
    
    elements.search.inputDisplay.textContent = searchString;
    
    if (searchString.length > 2) {
        const searchingText = window.t ? window.t('dashboard.searching') : "Searching...";
        elements.search.resultsGrid.innerHTML = `<div class="_dq">${searchingText}</div>`;
    }
}

function openSearch() {
    elements.search.overlay.classList.add('active');
    setTimeout(() => {
        const firstKey = elements.search.keyboardGrid.querySelector('.key');
        if(firstKey) firstKey.focus();
    }, 100);
}

function closeSearch() {
    elements.search.overlay.classList.remove('active');
    document.getElementById('door-play-btn').focus();
}

document.addEventListener('DOMContentLoaded', initializeApp);

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.href.includes("streamprotectedtrack_c-ee2") || window.location.href.includes("stream")) {
        return; 
    }
    const row = document.getElementById("_ex");
    
    if (row) {
        window.addEventListener("wheel", (e) => {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.preventDefault();
                row.scrollLeft += e.deltaY;
            }
        }, { passive: false });

        let touchStartY = 0;
        let touchStartX = 0;

        window.addEventListener("touchstart", (e) => {
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
        }, { passive: false });

        window.addEventListener("touchmove", (e) => {
            const touchCurrentY = e.touches[0].clientY;
            const touchCurrentX = e.touches[0].clientX;
            const deltaY = touchStartY - touchCurrentY;
            const deltaX = touchStartX - touchCurrentX;

            if (Math.abs(deltaY) > Math.abs(deltaX)) {
                e.preventDefault(); 
                row.scrollLeft += deltaY; 
                touchStartY = touchCurrentY;
                touchStartX = touchCurrentX;
            }
        }, { passive: false });
    }
});
(function() {
    const targetId = '_j';
    const keywords = ['stream', 'streamprotectedtrack_c-ee2'];

    const hideElement = () => {
        const url = window.location.href.toLowerCase();
        const shouldHide = keywords.some(key => url.includes(key));
        const el = document.getElementById(targetId);

        if (el) {
            if (shouldHide) {
                el.style.setProperty('display', 'none', 'important');
                el.style.setProperty('visibility', 'hidden', 'important');
                el.style.setProperty('opacity', '0', 'important');
                el.style.setProperty('pointer-events', 'none', 'important');
            } else {
                el.style.removeProperty('display');
            }
        }
    };
    hideElement();
    const observer = new MutationObserver(() => hideElement());
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
    window.addEventListener('popstate', hideElement);
    window.addEventListener('hashchange', hideElement);
})();

document.addEventListener('click', function(e) {
    const startBtn = e.target.closest('#_ek');
    if (startBtn) {
        e.preventDefault();
        const fadeLayer = document.getElementById('_m');
        if (fadeLayer) {
            fadeLayer.classList.add('active');
            setTimeout(() => {
                console.log(''); 
            }, 800); 
        }
    }
});

function forceRemoveFadeLayer() {
    const fadeLayer = document.getElementById('_m');
    if (fadeLayer) {
        fadeLayer.classList.remove('active');
        fadeLayer.style.opacity = '0';
        fadeLayer.style.pointerEvents = 'none';
        console.log('');
    }
}
document.addEventListener('DOMContentLoaded', forceRemoveFadeLayer);
window.addEventListener('pageshow', forceRemoveFadeLayer);
window.addEventListener('popstate', forceRemoveFadeLayer);
forceRemoveFadeLayer();

let pendingSeekOffset = null; 
let seekCooldown = false; // Debounce flag to prevent rapid mashing crashes

elements.streambasesecured_ca6Audio.addEventListener('loadedmetadata', () => {
    if (pendingSeekOffset !== null) {
        const duration = elements.streambasesecured_ca6Audio.duration;
        let newTime = 0;

        if (pendingSeekOffset.direction === 'backward') {
            newTime = Math.max(0, duration - pendingSeekOffset.remainder);
        } else if (pendingSeekOffset.direction === 'forward') {
            newTime = Math.min(duration, pendingSeekOffset.remainder);
        }

        elements.streambasesecured_ca6Audio.currentTime = newTime;
        elements.streambasesecured_ca6Audio.play().catch(e => console.log("Auto-resume after seek"));
        pendingSeekOffset = null; 
    }

    try {
        const disabled = (window.__DISABLE_MEDIA_SESSION__ === true) || (localStorage && localStorage.getItem('disableMediaControls') === '1');
        if (disabled && 'mediaSession' in navigator) {
            try {
                navigator.mediaSession.metadata = null;
                const handlers = ['play','pause','previoustrack','nexttrack','seekbackward','seekforward','seekto'];
                handlers.forEach(h => { try { navigator.mediaSession.setActionHandler(h, null); } catch (e) {} });
            } catch (e) {}
        }
    } catch (e) {}
});

window.smartSeek = function(seconds) {
    // 1. Debounce check: Exit immediately if a seek just happened
    if (seekCooldown) return;
    
    const audio = elements.streambasesecured_ca6Audio;
    if (!audio || isNaN(audio.duration)) return;

    // 2. Lock seeking for 250ms
    seekCooldown = true;
    setTimeout(() => { seekCooldown = false; }, 250);

    const currentT = audio.currentTime;
    const duration = audio.duration;
    const targetT = currentT + seconds;

    if (targetT >= 0 && targetT <= duration) {
        audio.currentTime = targetT;
        return;
    }

    // THE FIX: Parse strings into integers so math (+ 1) works correctly.
    const currentVIdx = parseInt(getSelectValue(elements.selects['streamprotectedcase_c-ww2']), 10);
    const currentChIdx = parseInt(getSelectValue(elements.selects['streamprotectedtrack_c-ee2']), 10);

    if (targetT < 0) {
        const remainder = Math.abs(targetT); 

        if (currentVIdx > 0) {
            const prevVIdx = currentVIdx - 1;
            setSelectValue(elements.selects['streamprotectedcase_c-ww2'], prevVIdx);
            pendingSeekOffset = { direction: 'backward', remainder: remainder };
            triggerVerseChange();
        } 
        else if (currentChIdx > 0) {
            const prevChIdx = currentChIdx - 1;
            setSelectValue(elements.selects['streamprotectedtrack_c-ee2'], prevChIdx);
            const prevChapterData = streambasesecured_ca6Data[prevChIdx]; 
            const lastVerseIdx = prevChapterData.streamprotectedcase_cww2.length - 1;
            populateVerseSelect(); 
            setSelectValue(elements.selects['streamprotectedcase_c-ww2'], lastVerseIdx);
            pendingSeekOffset = { direction: 'backward', remainder: remainder };
            triggerVerseChange();
        } 
        else {
            audio.currentTime = 0;
        }
    }
    else if (targetT > duration) {
        const remainder = targetT - duration; 
        const totalVersesInCh = streambasesecured_ca6Data[currentChIdx].streamprotectedcase_cww2.length;

        if (currentVIdx < totalVersesInCh - 1) {
            setSelectValue(elements.selects['streamprotectedcase_c-ww2'], currentVIdx + 1);
            pendingSeekOffset = { direction: 'forward', remainder: remainder };
            triggerVerseChange();
        } 
        else if (currentChIdx < streambasesecured_ca6Data.length - 1) {
            const nextChIdx = currentChIdx + 1;
            setSelectValue(elements.selects['streamprotectedtrack_c-ee2'], nextChIdx);
            populateVerseSelect(); 
            setSelectValue(elements.selects['streamprotectedcase_c-ww2'], 0); 
            pendingSeekOffset = { direction: 'forward', remainder: remainder };
            triggerVerseChange();
        }
        else {
            console.log("End of media reached via seek");
        }
    }
};

function triggerVerseChange() {
    loadVerse(true); 
}

let lastKnownSrc = null;

function showInteractionFeedback(type) {
    if (!elements.views.cinema.classList.contains('active')) return;

    const iconId = `icon-${type}`;
    const icon = document.getElementById(iconId);
    
    if (icon) {
        icon.classList.remove('animate');
        void icon.offsetWidth; 
        icon.classList.add('animate');
    }
}

if (elements.streambasesecured_ca6Audio) {
    elements.streambasesecured_ca6Audio.addEventListener('play', () => {
        const currentSrc = elements.streambasesecured_ca6Audio.src;
        if (currentSrc === lastKnownSrc) {
            showInteractionFeedback('play');
        } 
        lastKnownSrc = currentSrc;
    });

    elements.streambasesecured_ca6Audio.addEventListener('pause', () => {
        if (!elements.streambasesecured_ca6Audio.ended && elements.streambasesecured_ca6Audio.readyState > 2) {
             showInteractionFeedback('pause');
        }
    });
}

// --- FIXED KEYBOARD & TV REMOTE CONTROLS ---
document.addEventListener('keydown', (e) => {
    if (document.activeElement.tagName === 'INPUT') return;

    const isCinemaActive = elements.views.cinema && elements.views.cinema.classList.contains('active');
    if (!isCinemaActive) return;

    const audio = elements.streambasesecured_ca6Audio;
    if (!audio) return;

    // Handle Play/Pause (Spacebar or Enter/OK on TV)
    if (e.key === ' ' || e.key === 'Enter') {
        const isButtonFocused = document.activeElement.tagName === 'BUTTON' || document.activeElement.closest('._k');
        
        if (!isButtonFocused) {
            e.preventDefault();
            if (audio.paused) {
                audio.play().catch(err => console.log('Play blocked', err));
                showInteractionFeedback('play');
            } else {
                audio.pause();
                showInteractionFeedback('pause');
            }
        }
    }
    // NOTE: Arrow keys are handled EXCLUSIVELY by nav_7c6b5axjs.js to prevent "crazy" behavior.
    // MediaPlayPause keys are intentionally left out to let the TV/Browser natively toggle audio without double-firing.
});

// --- FIXED MOBILE DOUBLE-TAP TO SEEK / PAUSE ---
let tapCount = 0;
let tapTimer = null;

if (elements.views.cinema) {
    elements.views.cinema.addEventListener('touchstart', (e) => {
        // Ignore multi-touch (e.g., pinch to zoom)
        if (e.touches.length > 1) return;
        
        // STRICT CHECK: Ignore taps on UI elements
        if (e.target.closest('button') || e.target.closest('._k') || e.target.closest('nav')) {
            return;
        }

        tapCount++;
        
        if (tapCount === 1) {
            tapTimer = setTimeout(() => {
                tapCount = 0; // Reset after 300ms if a second tap doesn't happen
            }, 300);
        } else if (tapCount === 2) {
            clearTimeout(tapTimer);
            tapCount = 0;
            
            if (e.cancelable) e.preventDefault(); // Stop screen zoom
            
            const touchX = e.touches[0].clientX;
            const screenWidth = window.innerWidth;
            const audio = elements.streambasesecured_ca6Audio;

            if (touchX < screenWidth / 3) {
                // Left 33%: Rewind
                showInteractionFeedback('backward');
                if (window.smartSeek) window.smartSeek(-10);
            } else if (touchX > (screenWidth * 2) / 3) {
                // Right 33%: Forward
                showInteractionFeedback('forward');
                if (window.smartSeek) window.smartSeek(10);
            } else {
                // Center 33%: Play/Pause
                if (audio) {
                    if (audio.paused) {
                        audio.play().catch(err => console.log('Play blocked', err));
                        showInteractionFeedback('play');
                    } else {
                        audio.pause();
                        showInteractionFeedback('pause');
                    }
                }
            }
        }
    }, { passive: false });
}
/**
 * SYSTEM: CINEMA NAVIGATION & IDLE CONTROL (NATIVE ECOSYSTEM BLEND)
 * Verifies Cinema DOM, Injects Controls, Handles History States, and Auto-Fade.
 */
(function initCinemaSystem() {
    // 1. CONFIGURATION
    const IDLE_TIMEOUT_MS = 5000;
    const CINEMA_ID = '_dd';
    
    // 2. INJECTION & NAVIGATION LOGIC
    function injectControls() {
        const cinemaView = document.getElementById(CINEMA_ID);
        if (!cinemaView) return;

        // Prevent Duplicate Injection
        if (document.getElementById('cinema-nav-container')) return;

        const navContainer = document.createElement('div');
        navContainer.id = 'cinema-nav-container';

        // Polished Standard Arrowheads (Native Ecosystem Blend)
        navContainer.innerHTML = `
            <button class="cinema-nav-btn" id="cinema-back-btn" aria-label="Go Back">
                <svg viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
            </button>
            <button class="cinema-nav-btn" id="cinema-forward-btn" aria-label="Go Forward">
                <svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
            </button>
        `;

        cinemaView.appendChild(navContainer);

        const backBtn = document.getElementById('cinema-back-btn');
        const fwdBtn = document.getElementById('cinema-forward-btn');

        // Event Binding (Stop Propagation to prevent triggering Video Play/Pause)
        backBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.history.back();
        });

        fwdBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.history.forward();
        });

        // --- STATE EVALUATION LOGIC ---
        const evaluateNavState = () => {
            if (window.navigation) {
                // Modern browsers
                const canGoBack = window.navigation.canGoBack;
                const canGoForward = window.navigation.canGoForward;

                backBtn.disabled = !canGoBack;
                backBtn.classList.toggle('disabled', !canGoBack);
                
                fwdBtn.disabled = !canGoForward;
                fwdBtn.classList.toggle('disabled', !canGoForward);
            } else {
                // Safari/Legacy Fallback
                const hasHistory = window.history.length > 1;
                backBtn.disabled = !hasHistory;
                backBtn.classList.toggle('disabled', !hasHistory);
                
                fwdBtn.disabled = true; 
                fwdBtn.classList.add('disabled');
            }
        };

        // Listeners for Native Browser Navigation
        window.addEventListener('popstate', evaluateNavState);

        // --- THE SPA PATCH ---
        // Crucial for OpenTuwa router changes to update buttons instantly
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function() {
            originalPushState.apply(this, arguments);
            evaluateNavState();
        };

        history.replaceState = function() {
            originalReplaceState.apply(this, arguments);
            evaluateNavState(); 
        };

        // Initial Assessment on Load
        evaluateNavState();
    }

    // 3. IDLE TIMER LOGIC (The "Plumbing")
    let idleTimer = null;

    function resetIdleTimer() {
        // If we were idle, wake up
        if (document.body.classList.contains('idle')) {
            document.body.classList.remove('idle');
        }

        // Clear existing timer
        if (idleTimer) clearTimeout(idleTimer);

        // Set new timer to fade out after 5 seconds
        idleTimer = setTimeout(() => {
            // Safety Check: Don't go idle if a custom select dropdown is open
            if (!document.querySelector('._k.open')) {
                document.body.classList.add('idle');
            }
        }, IDLE_TIMEOUT_MS);
    }

    // 4. GLOBAL LISTENERS
    // Detects any movement/interaction to reset the timer
    const events = ['mousemove', 'mousedown', 'touchstart', 'click', 'keydown', 'scroll'];
    events.forEach(evt => window.addEventListener(evt, resetIdleTimer, { passive: true }));

    // 5. INITIALIZE
    // Run immediately and also wait for DOM if script loads early
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectControls();
            resetIdleTimer();
        });
    } else {
        injectControls();
        resetIdleTimer();
    }

})();