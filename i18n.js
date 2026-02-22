// i18n.js
const defaultLang = 'en';

const langNames = {
    'en': 'English',
    'zh': '中文 (Chinese)',
    'hi': 'हिन्दी (Hindi)',
    'es': 'Español (Spanish)',
    'fr': 'Français (French)',
    'ar': 'العربية (Arabic)',
    'ar-EG': 'العربية (Arabic - Egypt)',
    'bn': 'বাংলা (Bengali)',
    'ru': 'Русский (Russian)',
    'pt': 'Português (Portuguese)',
    'ur': 'اردو (Urdu)'
};

function setLanguage(lang) {
    if (!translations[lang]) lang = defaultLang;
    
    // Save preference
    localStorage.setItem('tuwa_lang', lang);
    
    // Update Document Language and Direction (for Arabic/Urdu RTL support)
    document.documentElement.lang = lang;
    const rtlLangs = ['ar', 'ar-EG', 'ur'];
    document.documentElement.dir = rtlLangs.includes(lang) ? 'ltr' : 'ltr';

    // Update Dropdown Button Text
    const displayElement = document.getElementById('currentLangDisplay');
    if (displayElement) {
        displayElement.innerText = langNames[lang];
    }

    // Apply Translations to HTML elements with data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    // Close Dropdown Menu securely
    const dropdown = document.getElementById('langDropdown');
    const btn = document.getElementById('langDropdownBtn');
    if(dropdown) dropdown.classList.remove('active');
    if(btn) btn.setAttribute('aria-expanded', 'false');
}

// Initialize Language on Page Load
window.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('tuwa_lang') || defaultLang;
    setLanguage(savedLang);
});