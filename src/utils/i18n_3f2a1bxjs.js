/**
 * i18n Loader - Initializes translations and applies them to the page
 * This script must be loaded before other scripts that use translations
 */

(function() {
    'use strict';
    
    const SUPPORTED_LOCALES = ['en', 'ar', 'es', 'fr', 'he', 'zh'];
    const RTL_LOCALES = ['ar', 'he'];
    const DEFAULT_LOCALE = 'en';
    
    let currentLocale = DEFAULT_LOCALE;
    let translations = {};
    
    /**
     * Get current locale from URL path
     */
    function getCurrentLocale() {
        const path = window.location.pathname;
        const pathSegments = path.split('/').filter(Boolean);
        
        if (pathSegments.length > 0 && SUPPORTED_LOCALES.includes(pathSegments[0])) {
            return pathSegments[0];
        }
        
        return DEFAULT_LOCALE;
    }
    
    /**
     * Load translations for a locale
     */
    async function loadTranslations(locale) {
        if (!SUPPORTED_LOCALES.includes(locale)) {
            locale = DEFAULT_LOCALE;
        }
        
        try {
            // Use root-relative path for locales (works from any subpath)
            const localePath = `/locales/${locale}.json`;
            const response = await fetch(localePath);
            if (response.ok) {
                translations = await response.json();
                currentLocale = locale;
                
                // Update HTML lang and dir attributes
                document.documentElement.lang = locale;
                document.documentElement.dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
                
                return translations;
            }
        } catch (error) {
            console.warn(`Failed to load translations for ${locale}:`, error);
        }
        
        // Fallback to English
        if (locale !== DEFAULT_LOCALE) {
            return loadTranslations(DEFAULT_LOCALE);
        }
        
        return translations;
    }
    
    /**
     * Translate a key (supports nested keys with dot notation)
     */
    function t(key, params) {
        params = params || {};
        const keys = key.split('.');
        let value = translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                value = undefined;
                break;
            }
        }
        
        if (value === undefined || value === null) {
            console.warn(`Translation missing for key: ${key}`);
            return key;
        }
        
        // Simple parameter interpolation
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            return value.replace(/\{\{(\w+)\}\}/g, function(match, paramKey) {
                return params[paramKey] !== undefined ? params[paramKey] : match;
            });
        }
        
        return value;
    }
    
    /**
     * Apply translations to elements with data-i18n attributes
     */
    function applyTranslations() {
        // Apply to elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(function(el) {
            const key = el.getAttribute('data-i18n');
            const translation = t(key);
            if (translation) {
                el.textContent = translation;
            }
        });
        
        // Apply to elements with data-i18n-aria-label
        document.querySelectorAll('[data-i18n-aria-label]').forEach(function(el) {
            const key = el.getAttribute('data-i18n-aria-label');
            const translation = t(key);
            if (translation) {
                el.setAttribute('aria-label', translation);
            }
        });
        
        // Apply to meta tags
        const metaTitle = document.getElementById('i18n-title');
        if (metaTitle) {
            metaTitle.textContent = t('meta.title');
        }
        
        const metaDesc = document.getElementById('i18n-description');
        if (metaDesc) {
            metaDesc.setAttribute('content', t('meta.description'));
        }
        
        const ogTitle = document.getElementById('i18n-og-title');
        if (ogTitle) {
            ogTitle.setAttribute('content', t('meta.ogTitle'));
        }
        
        const ogDesc = document.getElementById('i18n-og-description');
        if (ogDesc) {
            ogDesc.setAttribute('content', t('meta.ogDescription'));
        }
    }
    
    /**
     * Initialize i18n system
     */
    async function initI18n() {
        currentLocale = getCurrentLocale();
        await loadTranslations(currentLocale);
        applyTranslations();
        
        // Make t and getLocale available globally
        window.t = t;
        window.getLocale = function() { return currentLocale; };
        window.getCurrentLocale = getCurrentLocale;
        
        // Dispatch event when translations are ready
        document.dispatchEvent(new CustomEvent('i18nReady', { detail: { locale: currentLocale } }));
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initI18n);
    } else {
        initI18n();
    }
    
})();