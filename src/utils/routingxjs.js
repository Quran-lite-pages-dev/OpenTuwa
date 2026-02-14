/**
 * Routing utility for language subpaths
 * Handles URL routing with locale support
 */

const SUPPORTED_LOCALES = ['en', 'ar', 'es', 'fr', 'he', 'zh'];
const DEFAULT_LOCALE = 'en';

/**
 * Get locale from current URL path
 */
export function getLocaleFromPath() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    const firstSegment = segments[0];
    
    if (SUPPORTED_LOCALES.includes(firstSegment)) {
        return firstSegment;
    }
    
    return DEFAULT_LOCALE;
}

/**
 * Get path without locale prefix
 */
export function getPathWithoutLocale() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    if (SUPPORTED_LOCALES.includes(segments[0])) {
        segments.shift();
    }
    
    return '/' + segments.join('/');
}

/**
 * Build URL with locale
 */
export function buildUrl(path, locale = null) {
    if (!locale) {
        locale = getLocaleFromPath();
    }
    
    // Remove leading slash if present
    path = path.replace(/^\/+/, '');
    
    // Remove locale prefix if present in path
    const pathSegments = path.split('/').filter(Boolean);
    if (SUPPORTED_LOCALES.includes(pathSegments[0])) {
        pathSegments.shift();
    }
    
    // Build new path
    let newPath = '';
    if (locale === DEFAULT_LOCALE) {
        newPath = '/' + pathSegments.join('/');
    } else {
        newPath = '/' + locale + '/' + pathSegments.join('/');
    }
    
    // Preserve query string
    const query = window.location.search;
    return newPath + query;
}

/**
 * Update all internal links to include locale
 */
export function updateInternalLinks() {
    const locale = getLocaleFromPath();
    const links = document.querySelectorAll('a[href^="/"], a[href^="?"]');
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            if (href.startsWith('?')) {
                // Query string - append to current path
                link.href = buildUrl(window.location.pathname + href, locale);
            } else if (href.startsWith('/')) {
                // Absolute path - add locale
                link.href = buildUrl(href, locale);
            }
        }
    });
}
