// Copyright (c) Haykal M. Zaidi 2024-2026. All rights reserved. PROPRIETARY AND CONFIDENTIAL.
/**
 * Voice Search Bridge Component
 * Connects voice search functionality to AI search system
 * @module components/search/voice-search-bridge
 */
(function() {
    'use strict';

    window.searchString = '';

    /**
     * Performs AI search using the current search string from voice input
     */
    window.performAISearch = function() {
        const searchInputElement = document.getElementById('search-input');

        if (searchInputElement) {
            searchInputElement.value = window.searchString;
            searchInputElement.dispatchEvent(new Event('input', { bubbles: true }));

            const enterKeyEvent = new KeyboardEvent('keyup', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true
            });
            searchInputElement.dispatchEvent(enterKeyEvent);
        }
    };
})();
