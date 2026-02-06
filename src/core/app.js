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
let SURAH_METADATA = [];
let TRANSLATIONS_CONFIG = {};
let RECITERS_CONFIG = {};

// --- 2. MULTI-PROFILE & LOGIC ---
const ACTIVE_PROFILE_ID = "1";
const STORAGE_KEY = `quranState_${ACTIVE_PROFILE_ID}`;

// --- NEW: VIRTUAL SILENT BACKING TRACK (ANTI-GLITCH) ---
// A minimal silent MP3 file (base64) to keep the Media Session active between verses
const SILENT_MP3_DATA = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD//////////////////////////////////////////////////////////////////wAAAAxMYXZjNTguNTQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAAGAAAAAAAAAAAAF//OEZAAAAAAAAAAAABhAAAAAAAAAAAAAAAIUAAABAAAAAAAAAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//OEZAAAAAAAAAAAABiAAAAAAAAAAAAAAAIUAAABAAAAAAAAAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

const virtualBackingTrack = new Audio(SILENT_MP3_DATA);
virtualBackingTrack.loop = true;
virtualBackingTrack.volume = 0; // Silent
// -------------------------------------------------------

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
    overlay: document.getElementById('loading-overlay'),
    spinner: document.querySelector('.loader-spinner'),
    loaderText: document.getElementById('loader-text'),
    startBtn: document.getElementById('start-btn'),
    quranAudio: document.getElementById('audio-player'),
    transAudio: document.getElementById('translation-audio-player'),
    previewAudio: document.getElementById('preview-audio'),
    bufferInd: document.getElementById('buffering-indicator'),
    selects: {
        chapter: document.getElementById('chapterSelectWrapper'),
        verse: document.getElementById('verseSelectWrapper'),
        trans: document.getElementById('translationSelectWrapper'),
        reciter: document.getElementById('reciterSelectWrapper'),
        transAudio: document.getElementById('translationAudioSelectWrapper')
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
    localStorage.removeItem('quran_user_analytics');
    const msg = window.t ? window.t('errors.userDataWiped') : 'User data wiped.';
    alert(msg);
    location.reload();
};

// mode: 1 = Show All (Default), 0 = Hide Chapter and Reciter
function initCustomSelects(mode = 0) {
    if (mode === 0) {
        document.body.classList.add('simple-mode');
    } else {
        document.body.classList.remove('simple-mode');
    }

    document.querySelectorAll('.custom-select-wrapper').forEach(wrapper => {
        const trigger = wrapper.querySelector('.custom-select-trigger');
        
        trigger.addEventListener('click', (e) => {
            e.stopPropagation(); 
            e.preventDefault();

            if (document.body.classList.contains('idle')) {
                document.body.classList.remove('idle');
                document.body.dispatchEvent(new Event('mousemove'));
                return;
            }

            const isOpen = wrapper.classList.contains('open');

            document.querySelectorAll('.custom-select-wrapper.open').forEach(other => {
                other.classList.remove('open');
            });
            
            if (!isOpen) {
                wrapper.classList.add('open');
                const selected = wrapper.querySelector('.custom-option.selected');
                if (selected) {
                    setTimeout(() => selected.scrollIntoView({ block: 'center' }), 10);
                } else {
                    const list = wrapper.querySelector('.custom-options');
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
        if (!e.target.closest('.custom-select-wrapper')) {
            document.querySelectorAll('.custom-select-wrapper.open').forEach(el => {
                el.classList.remove('open');
            });
        }
    });
}

function populateCustomSelect(wrapper, items, onChange) {
    const optionsContainer = wrapper.querySelector('.custom-options');
    optionsContainer.innerHTML = '';
    
    const fragment = document.createDocumentFragment();

    items.forEach(item => {
        const opt = document.createElement('div');
        opt.className = 'custom-option';
        opt.dataset.value = item.value;
        opt.textContent = item.text;
        opt.tabIndex = 0; 

        const handleSelection = (e) => {
            e.preventDefault();
            e.stopPropagation(); 

            setSelectValue(wrapper, item.value); 
            wrapper.classList.remove('open'); 
            
            setTimeout(() => {
                const trigger = wrapper.querySelector('.custom-select-trigger');
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
    const options = wrapper.querySelectorAll('.custom-option');
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
        const trigger = wrapper.querySelector('.custom-select-trigger');
        if(trigger) trigger.textContent = foundText;
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
            chapter: parseInt(parts[0]),
            verse: parseInt(parts[1]),
            reciter: parts[2],
            trans: parts[3],
            audio_trans: parts[4]
        };
    } catch (e) {
        console.error("Decoding failed", e);
        return null;
    }
}

function mergeMetadata(apiChapters) {
    return apiChapters.map((ch, idx) => {
        const meta = SURAH_METADATA.find(m => m.chapter === ch.chapterNumber);
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
        
        // Ensure the silent backing track is active if we are in cinema mode
        // (Though typically started by the Start button)
        virtualBackingTrack.play().catch(e => { /* Autoplay block handled by Start button */ });

        setTimeout(() => {
            const chapterTrigger = elements.selects.chapter.querySelector('.custom-select-trigger');
            if(chapterTrigger) chapterTrigger.focus();
        }, 150);
    } else {
        elements.views.cinema.classList.remove('active');
        elements.views.cinema.style.opacity = '0';
        elements.views.dashboard.classList.add('active');
        elements.sidebar.container.style.display = 'none';
        elements.quranAudio.pause();
        elements.transAudio.pause();
        
        // Pause the silent backing track when leaving cinema
        virtualBackingTrack.pause();
        
        refreshDashboard();
        document.getElementById('door-play-btn').focus();
    }
}

window.addEventListener('popstate', (event) => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('chapter') || params.has('stream')) {
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

        // 1. SECURE CONFIG FETCH (REPLACES HARDCODED DATA)
        try {
            const configResponse = await fetch('/api/config');
            if(configResponse.ok) {
                const configData = await configResponse.json();
                SURAH_METADATA = configData.chapters;
                TRANSLATIONS_CONFIG = configData.translations;
                RECITERS_CONFIG = configData.reciters;
            } else {
                throw new Error("Failed to load secure config");
            }
        } catch(e) {
            console.error("Config Load Failed", e);
            // Fallback could go here if needed
        }

        const jsonResponse = await fetch('https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@refs/heads/master/assets/data/translations/2TM3TM.json');
        if (!jsonResponse.ok) throw new Error("Failed to load Quran JSON");
        const jsonData = await jsonResponse.json();
        
        // Now it's safe to use mergeMetadata because SURAH_METADATA is loaded
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
        
        restoreState();

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('chapter') || urlParams.has('stream')) {
            switchView('cinema');
            populateVerseSelect(); 
            
            const savedVerse = getSavedVerseIndex();
            setSelectValue(elements.selects.verse, savedVerse);

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
        initSidebarNavigation();
        initSearchInterface();

    } catch (error) {
        console.error("Critical Init Error:", error);
        elements.loaderText.textContent = window.t ? window.t('errors.loadError') : "Error loading content. Please check connection.";
    }
}

// --- UPDATED: DASHBOARD LOGIC (SINGLE FISH MODE & INFINITE SCROLL) ---
function refreshDashboard() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const heroBtn = document.getElementById('door-play-btn');

    const allIndices = Array.from({length: 114}, (_, i) => i);
    const shortRowIndices = allIndices.slice(77, 114);
    const trendingIndices = [81, 82, 85, 54, 104, 81, 86, 69, 56, 88, 53].map(id => id - 1);

    const combinedIndices = [...trendingIndices, ...shortRowIndices, ...allIndices];
    fillRow('all-row', combinedIndices);

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
    if(!container) return; 
    
    const fragment = document.createDocumentFragment();
    
    indexArray.forEach(idx => {
        if(!quranData[idx]) return;
        const surah = quranData[idx];
        const card = document.createElement('div');
        card.className = 'surah-card';
        card.tabIndex = 0;
        
        let cardTitle = surah.english_name;
        if (window.t) {
            const translatedKey = 'surahNames.' + surah.english_name;
            const translatedName = window.t(translatedKey);
            if (translatedName && translatedName !== translatedKey) {
                cardTitle = translatedName;
            }
        }
        
        card.innerHTML = `
            <div class="card-bg-num">${surah.chapterNumber}</div>
            <div class="card-title">${cardTitle}</div>
            <div class="card-sub">${surah.title || ''}</div>
        `;
        card.onclick = () => launchPlayer(surah.chapterNumber, 1);
        card.onfocus = () => { schedulePreview(surah.chapterNumber); };
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

        const cards = Array.from(container.querySelectorAll('.surah-card'));
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
    const surah = quranData[chapterNum - 1];
    
    let heroTitle = surah.english_name;
    if (window.t) {
        const translatedName = window.t(`surahNames.${surah.english_name}`);
        if (translatedName && translatedName !== `surahNames.${surah.english_name}`) {
            heroTitle = translatedName;
        }
    }
    
    const doorz = document.getElementById('doorz-hero-title');
    if(doorz) {
        doorz.removeAttribute('data-i18n'); 
        doorz.textContent = heroTitle;
    }
    
    const doorHero = document.getElementById('door-hero-title');
    if (doorHero) {
        doorHero.textContent = heroTitle;
    }

    document.getElementById('door-hero-subtitle').textContent = surah.title;
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

async function updateHeroPreview(chapterNum, startVerse, reciterId, autoPlay) {
    previewSequence = [];
    previewSeqIndex = 0;
    
    const chIdx = chapterNum - 1;
    if (!quranData[chIdx]) return;
    
    const totalVerses = quranData[chIdx].verses.length;
    for (let i = 1; i <= totalVerses; i++) {
        previewSequence.push(i);
    }

    const verseNum = previewSequence[0];
    const imgUrl = `https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@refs/heads/master/assets/images/img/${chapterNum}_${verseNum}.png`;
    
    const tempImg = new Image();
    tempImg.src = imgUrl;
    tempImg.onload = () => {
        const heroImg = document.getElementById('door-hero-img');
        if (heroImg) heroImg.src = imgUrl;
    };

    const transId = getSelectValue(elements.selects.trans) || 'en';
    if (!translationCache[transId]) {
        await loadTranslationData(transId);
    }

    if (autoPlay) {
        playPreviewStep(chapterNum, reciterId);
    }
}

function playPreviewStep(chapterNum, reciterId) {
    if (previewSeqIndex >= previewSequence.length) return;
    const verseNum = previewSequence[previewSeqIndex];
    const padCh = String(chapterNum).padStart(3, '0');
    const padV = String(verseNum).padStart(3, '0');
    
    const imgLayer = document.getElementById('hero-preview-layer');
    const previewImg = document.getElementById('preview-img');
    const newSrc = `https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@master/assets/images/img/{chapterNum}_${verseNum}.png?raw=true$`;

    previewImg.style.opacity = 0;
    setTimeout(() => {
        previewImg.src = newSrc;
        previewImg.onload = () => {
            previewImg.style.opacity = 0.6;
            imgLayer.classList.add('active');
        };
    }, 200);

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const transId = saved.trans || 'en';
    const cache = translationCache[transId];
    /* --- START BRIDGE TO LYRICS ENGINE --- */
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
    /* --- END BRIDGE --- */
    const rPath = RECITERS_CONFIG[reciterId]?.path || RECITERS_CONFIG['alafasy'].path;
    const audioUrl = `https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@master/assets/cdn/${padCh}${padV}.mp3`;
    elements.previewAudio.src = audioUrl;
    elements.previewAudio.volume = 0.6;
    elements.previewAudio.onended = () => {
        previewSeqIndex++;
        playPreviewStep(chapterNum, reciterId);
    };
    elements.previewAudio.play().catch(e => console.log("Autoplay blocked"));
}

function launchPlayer(chapterNum, verseNum = 1) {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const browserLang = navigator.language.split('-')[0];

    let currentReciter = getSelectValue(elements.selects.reciter) || saved.reciter || 'alafasy';
    
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

    let streamData = null;
    if (urlParams.has('stream')) {
        streamData = decodeStream(urlParams.get('stream'));
    }

    let ch = 0;
    if (streamData) {
        ch = streamData.chapter - 1; 
    } else if (urlParams.has('chapter')) {
        ch = parseInt(urlParams.get('chapter')) - 1; 
    } else if (saved.chapter !== undefined) {
        ch = saved.chapter;
    }
    if (isNaN(ch) || ch < 0) ch = 0;
    setSelectValue(elements.selects.chapter, ch);

    let rec = 'alafasy';
    if (streamData && RECITERS_CONFIG[streamData.reciter]) {
        rec = streamData.reciter;
    } else if (urlParams.has('reciter') && RECITERS_CONFIG[urlParams.get('reciter')]) {
        rec = urlParams.get('reciter');
    } else if (saved.reciter) {
        rec = saved.reciter;
    }
    setSelectValue(elements.selects.reciter, rec);

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
        if (data) return data.verse - 1; 
    }
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    if (urlParams.has('verse')) return parseInt(urlParams.get('verse')) - 1;
    if (saved.verse !== undefined) return saved.verse;
    return 0;
}

function saveState() {
    const state = {
        chapter: parseInt(getSelectValue(elements.selects.chapter)),
        verse: parseInt(getSelectValue(elements.selects.verse)),
        reciter: getSelectValue(elements.selects.reciter),
        trans: getSelectValue(elements.selects.trans),
        audio_trans: getSelectValue(elements.selects.transAudio)
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    const chObj = quranData[state.chapter];
    const chNum = chObj.chapterNumber;
    const vNum = chObj.verses[state.verse].verseNumber;
    
    const streamToken = encodeStream(chNum, vNum, state.reciter, state.trans, state.audio_trans);
    const newUrl = `?stream=${streamToken}`;

    window.history.replaceState({path: newUrl, view: 'cinema'}, '', newUrl);

    const canonicalLink = document.getElementById('dynamic-canonical');
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
    const items = quranData.map((c, i) => {
        let title = c.english_name;
        if (window.t) {
            const translatedKey = 'surahNames.' + c.english_name;
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
    
    populateCustomSelect(elements.selects.chapter, items, (val) => {
        populateVerseSelect(); 
        loadVerse(true);
    });
}

function populateVerseSelect() {
    const chIdx = getSelectValue(elements.selects.chapter) || 0;
    currentChapterData = quranData[chIdx];
    
    const items = currentChapterData.verses.map((v, i) => ({
        value: i,
        text: `${v.verseNumber}`
    }));

    populateCustomSelect(elements.selects.verse, items, (val) => {
        loadVerse(true);
    });
}

function populateReciterSelect() {
    const items = Object.entries(RECITERS_CONFIG).map(([k, v]) => ({
        value: k,
        text: v.name
    }));
    populateCustomSelect(elements.selects.reciter, items, (val) => {
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
        const chIdx = getSelectValue(elements.selects.chapter);
        const vIdx = getSelectValue(elements.selects.verse);
        const ch = quranData[chIdx].chapterNumber;
        const v = quranData[chIdx].verses[vIdx].verseNumber;
        
        if (!elements.quranAudio.paused) {
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
        
        const chIdx = getSelectValue(elements.selects.chapter);
        const vIdx = getSelectValue(elements.selects.verse);
        const ch = quranData[chIdx].chapterNumber;
        const v = quranData[chIdx].verses[vIdx].verseNumber;
        updateTranslationText(ch, v);
        saveState();
    });
}

function toggleBuffering(show) {
    isBuffering = show;
    elements.bufferInd.style.display = show ? 'block' : 'none';
}

async function loadVerse(autoplay = true) {
    const chIdx = getSelectValue(elements.selects.chapter);
    const vIdx = getSelectValue(elements.selects.verse);
    
    currentChapterData = quranData[chIdx];

    const splashTitle = document.getElementById('doorz-hero-title');
    if (splashTitle) {
        let displayTitle = currentChapterData.english_name;
        if (window.t) {
            const translatedKey = 'surahNames.' + displayTitle;
            const translatedName = window.t(translatedKey);
            if (translatedName && translatedName !== translatedKey) {
                displayTitle = translatedName;
            }
        }
        splashTitle.textContent = displayTitle;
    }

    const verseData = currentChapterData.verses[vIdx];
    const chNum = currentChapterData.chapterNumber;
    const vNum = verseData.verseNumber;
    const verseKey = `${chNum}-${vNum}`;
    const isForbidden = forbiddenToTranslateSet.has(verseKey);

    elements.display.title.innerHTML = `${currentChapterData.title} <span class="chapter-subtitle">(${chNum}:${vNum})</span>`;
    
    const newSrc = `https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@refs/heads/master/assets/images/img/${chNum}_${vNum}.png`;
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

    const tid = getSelectValue(elements.selects.trans);
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
    updateMediaSession(currentChapterData.title, vNum, RECITERS_CONFIG[getSelectValue(elements.selects.reciter)].name);
    bufferNextResources(chIdx, parseInt(vIdx));
}

function bufferNextResources(currentChIdx, currentVIdx) {
    let nextChIdx = parseInt(currentChIdx);
    let nextVIdx = currentVIdx + 1;
    
    if (nextVIdx >= quranData[nextChIdx].verses.length) {
        nextChIdx = nextChIdx + 1;
        nextVIdx = 0;
    }

    if (nextChIdx >= quranData.length) return; 

    const nextCh = quranData[nextChIdx].chapterNumber;
    const nextV = quranData[nextChIdx].verses[nextVIdx].verseNumber;

    const img = new Image();
    img.src = `https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@refs/heads/master/assets/images/img/${nextCh}_${nextV}.png`;

    const rId = getSelectValue(elements.selects.reciter);
    const qPath = RECITERS_CONFIG[rId].path;
    const padCh = String(nextCh).padStart(3, '0');
    const padV = String(nextV).padStart(3, '0');
    const aud = new Audio();
    aud.src = `https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@master/assets/cdn/${padCh}${padV}.mp3`;
    aud.preload = 'auto'; 
}

function updateTranslationText(chNum, vNum) {
    const tid = getSelectValue(elements.selects.trans);
    if (!translationCache[tid]) return;
    
    if (RTL_CODES.has(tid)) elements.display.trans.dir = 'rtl';
    else elements.display.trans.dir = 'ltr';

    const sura = translationCache[tid].querySelector(`sura[index="${chNum}"]`);
    const aya = sura ? sura.querySelector(`aya[index="${vNum}"]`) : null;
    const unavailableText = window.t ? window.t('errors.translationUnavailable') : "Translation unavailable";
    elements.display.trans.textContent = aya ? aya.getAttribute('text') : unavailableText;
    adjustFontSize();
}

function updateQuranAudio(chNum, vNum, play) {
    const rId = getSelectValue(elements.selects.reciter);
    const path = RECITERS_CONFIG[rId].path;
    const padCh = String(chNum).padStart(3, '0');
    const padV = String(vNum).padStart(3, '0');
    
    elements.quranAudio.src = `https://cdn.jsdelivr.net/gh/Quran-lite-pages-dev/Quran-lite.pages.dev@master/assets/cdn/${padCh}${padV}.mp3`;
    if(play) elements.quranAudio.play().catch(e => console.log("Waiting for user interaction"));
}

async function updateTranslationAudio(chNum, vNum, play) {
    return;
}

function handleQuranEnd() {
    nextVerse();
}

function nextVerse() {
    const verseWrapper = elements.selects.verse;
    const totalV = verseWrapper.querySelectorAll('.custom-option').length;
    let cV = parseInt(getSelectValue(verseWrapper));
    
    if (cV + 1 < totalV) {
        setSelectValue(verseWrapper, cV + 1);
        loadVerse(true);
    } else {
        const chapterWrapper = elements.selects.chapter;
        let cC = parseInt(getSelectValue(chapterWrapper));
        const totalC = chapterWrapper.querySelectorAll('.custom-option').length;
        
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
        
        // --- START SILENT BACKING TRACK ON USER INTERACTION ---
        virtualBackingTrack.play().catch(e => console.log("Silent track blocked:", e));
        // -----------------------------------------------------
        
        loadVerse(true); 
    });

    elements.quranAudio.addEventListener('ended', handleQuranEnd);
    elements.transAudio.addEventListener('ended', nextVerse);

    ['mousemove', 'touchstart', 'click', 'keydown'].forEach(e => 
        window.addEventListener(e, () => {
            document.body.classList.remove('idle');
            clearTimeout(inactivityTimer);
            
            inactivityTimer = setTimeout(() => {
                if (!document.querySelector('.custom-select-wrapper.open')) {
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

let currentSurahTitle = "";

function updateMediaSession(surah, verse, artist) {
    if ('mediaSession' in navigator) {
        // We update metadata regardless of which audio is "really" playing
        // The silent backing track keeps the session alive.
        navigator.mediaSession.metadata = new MediaMetadata({
            title: `${currentChapterData.english_name} (Verse ${verse})`, // Updated to show verse in title
            artist: `The Sight | Original Series`,
            album: `Tuwa Audio`,
            artwork: [{ src: 'https://Quran-lite.pages.dev/social-preview.jpg', sizes: '512x512', type: 'image/jpeg' }]
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
            // Logic handled by app state (optional: trigger nextVerse())
        });
        
        // --- ADD HANDLERS TO SYNC PLAY/PAUSE FOR BOTH TRACKS ---
        navigator.mediaSession.setActionHandler('play', () => {
            virtualBackingTrack.play();
            elements.quranAudio.play();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
            virtualBackingTrack.pause();
            elements.quranAudio.pause();
        });
        // --------------------------------------------------------

        currentSurahTitle = surah;
    }
}

function initSearchInterface() {
    renderKeyboard();
    elements.search.resultsGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.surah-card');
        if(card) {
            const ch = parseInt(card.dataset.chapter);
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
        elements.search.resultsGrid.innerHTML = `<div class="no-results">${searchingText}</div>`;
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
    if (window.location.href.includes("chapter") || window.location.href.includes("stream")) {
        return; 
    }
    const row = document.getElementById("all-row");
    
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
    const targetId = 'island-search-wrapper';
    const keywords = ['stream', 'chapter'];

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
    const startBtn = e.target.closest('#start-btn');
    if (startBtn) {
        e.preventDefault();
        const fadeLayer = document.getElementById('transition-fade-layer');
        if (fadeLayer) {
            fadeLayer.classList.add('active');
            setTimeout(() => {
                console.log('Transition complete. Loading cinema...'); 
            }, 800); 
        }
    }
});

function forceRemoveFadeLayer() {
    const fadeLayer = document.getElementById('transition-fade-layer');
    if (fadeLayer) {
        fadeLayer.classList.remove('active');
        fadeLayer.style.opacity = '0';
        fadeLayer.style.pointerEvents = 'none';
        console.log('Fade layer reset.');
    }
}
document.addEventListener('DOMContentLoaded', forceRemoveFadeLayer);
window.addEventListener('pageshow', forceRemoveFadeLayer);
window.addEventListener('popstate', forceRemoveFadeLayer);
forceRemoveFadeLayer();

let pendingSeekOffset = null; 

elements.quranAudio.addEventListener('loadedmetadata', () => {
    if (pendingSeekOffset !== null) {
        const duration = elements.quranAudio.duration;
        let newTime = 0;

        if (pendingSeekOffset.direction === 'backward') {
            newTime = Math.max(0, duration - pendingSeekOffset.remainder);
        } else if (pendingSeekOffset.direction === 'forward') {
            newTime = Math.min(duration, pendingSeekOffset.remainder);
        }

        elements.quranAudio.currentTime = newTime;
        elements.quranAudio.play().catch(e => console.log("Auto-resume after seek"));
        pendingSeekOffset = null; 
    }
});

window.smartSeek = function(seconds) {
    const audio = elements.quranAudio;
    if (!audio || isNaN(audio.duration)) return;

    const currentT = audio.currentTime;
    const duration = audio.duration;
    const targetT = currentT + seconds;

    if (targetT >= 0 && targetT <= duration) {
        audio.currentTime = targetT;
        return;
    }

    if (targetT < 0) {
        const remainder = Math.abs(targetT); 
        const currentVIdx = getSelectValue(elements.selects.verse);
        const currentChIdx = getSelectValue(elements.selects.chapter); 

        if (currentVIdx > 0) {
            const prevVIdx = currentVIdx - 1;
            setSelectValue(elements.selects.verse, prevVIdx);
            pendingSeekOffset = { direction: 'backward', remainder: remainder };
            triggerVerseChange();
        } 
        else if (currentChIdx > 0) {
            const prevChIdx = currentChIdx - 1;
            setSelectValue(elements.selects.chapter, prevChIdx);
            const prevChapterData = quranData[prevChIdx]; 
            const lastVerseIdx = prevChapterData.verses.length - 1;
            populateVerseSelect(); 
            setSelectValue(elements.selects.verse, lastVerseIdx);
            pendingSeekOffset = { direction: 'backward', remainder: remainder };
            triggerVerseChange();
        } 
        else {
            audio.currentTime = 0;
        }
    }
    else if (targetT > duration) {
        const remainder = targetT - duration; 
        const currentVIdx = getSelectValue(elements.selects.verse);
        const currentChIdx = getSelectValue(elements.selects.chapter);
        const totalVersesInCh = quranData[currentChIdx].verses.length;

        if (currentVIdx < totalVersesInCh - 1) {
            setSelectValue(elements.selects.verse, currentVIdx + 1);
            pendingSeekOffset = { direction: 'forward', remainder: remainder };
            triggerVerseChange();
        } 
        else if (currentChIdx < quranData.length - 1) {
            const nextChIdx = currentChIdx + 1;
            setSelectValue(elements.selects.chapter, nextChIdx);
            populateVerseSelect(); 
            setSelectValue(elements.selects.verse, 0); 
            pendingSeekOffset = { direction: 'forward', remainder: remainder };
            triggerVerseChange();
        }
        else {
            console.log("End of Quran reached via seek");
        }
    }
};

function triggerVerseChange() {
    loadVerse(true); 
}