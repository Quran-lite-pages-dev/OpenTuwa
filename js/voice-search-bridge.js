// Voice Search Bridge - Connects voice search to AI search functionality
(function() {
    'use strict';
    window.searchString = "";

    window.performAISearch = function() {
        console.log("Voice search triggered for:", window.searchString);
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

