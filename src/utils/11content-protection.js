// Copyright (c) Haykal M. Zaidi 2024-2026. All rights reserved. PROPRIETARY AND CONFIDENTIAL.
/**
 * Content Protection Utility
 * Prevents unauthorized content copying, right-clicking, text selection, and dragging
 * @module utils/content-protection
 */
(function() {
    'use strict';

    /**
     * Prevents context menu (right-click) from appearing
     */
    document.addEventListener('contextmenu', function(event) {
        event.preventDefault();
    }, false);

    /**
     * Prevents text selection via mouse
     */
    document.addEventListener('selectstart', function(event) {
        event.preventDefault();
    }, false);

    /**
     * Prevents dragging of elements
     */
    document.addEventListener('dragstart', function(event) {
        event.preventDefault();
    }, false);

    /**
     * Prevents copy keyboard shortcuts (Ctrl+C / Cmd+C)
     */
    document.addEventListener('keydown', function(event) {
        const isCopyShortcut = (event.ctrlKey || event.metaKey) && 
                              (event.key === 'c' || event.key === 'C');
        
        if (isCopyShortcut) {
            event.preventDefault();
        }
    });
})();
