// Content Protection - Prevents right-click, text selection, dragging, and copying
(function() {
    'use strict';

    // Block Right Click (Context Menu)
    document.addEventListener('contextmenu', function(event) {
        event.preventDefault();
    }, false);

    // Block Text Selection (Mouse based)
    document.addEventListener('selectstart', function(event) {
        event.preventDefault();
    }, false);

    // Block Dragging
    document.addEventListener('dragstart', function(event) {
        event.preventDefault();
    }, false);

    // Block Copying (Ctrl+C / Cmd+C)
    document.addEventListener('keydown', function(event) {
        if ((event.ctrlKey || event.metaKey) && (event.key === 'c' || event.key === 'C')) {
            event.preventDefault();
        }
    });
})();

