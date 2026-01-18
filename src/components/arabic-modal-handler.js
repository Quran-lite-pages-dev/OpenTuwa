// Copyright (c) Haykal M. Zaidi 2024-2026. All rights reserved. PROPRIETARY AND CONFIDENTIAL.
/**
 * Arabic Modal Handler Component
 * Intercepts player launch to show Arabic reading capability modal
 * @module components/arabic-modal-handler
 */
(function() {
    'use strict';

    const STORAGE_KEY = 'quran_arabic_pref';

    // Helper to apply CSS based on preference
    function applyCssPreference(pref) {
        const mainCssLinkElement = document.getElementById('main-css');
        if (mainCssLinkElement) {
            // Logic based on your original file:
            // 'no' (cannot read) -> uses index1.css
            // 'yes' (can read) -> uses index.css
            if (pref === 'no') {
                mainCssLinkElement.href = 'styles/index1.css';
            } else if (pref === 'yes') {
                mainCssLinkElement.href = 'styles/index.css';
            }
        }
    }

    // 1. Immediate Check on Script Run (Restores state on Page Reload)
    const savedPref = localStorage.getItem(STORAGE_KEY);
    if (savedPref) {
        applyCssPreference(savedPref);
    }

    window.addEventListener('load', function() {
        const originalLaunchPlayerFunction = window.launchPlayer;

        if (!originalLaunchPlayerFunction) {
            return;
        }

        /**
         * Shows modal and handles user's Arabic reading capability preference
         * @param {number} chapterNumber - Chapter number to play
         * @param {number} verseNumber - Verse number to start from
         */
        window.launchPlayer = function(chapterNumber, verseNumber) {
            // Check storage again in case it changed
            const currentPref = localStorage.getItem(STORAGE_KEY);
            
            // If we already have a preference, skip modal and launch directly
            if (currentPref) {
                applyCssPreference(currentPref);
                originalLaunchPlayerFunction(chapterNumber, verseNumber);
                return;
            }

            const modalElement = document.getElementById('arabic-modal');
            // Note: Variables naming preserved from original file logic
            // yesButtonElement was linked to 'btn-arabic-no' in your code
            const yesButtonElement = document.getElementById('btn-arabic-no'); 
            // noButtonElement was linked to 'btn-arabic-yes' in your code
            const noButtonElement = document.getElementById('btn-arabic-yes'); 
            const mainCssLinkElement = document.getElementById('main-css');

            if (!modalElement || !yesButtonElement || !noButtonElement) {
                originalLaunchPlayerFunction(chapterNumber, verseNumber);
                return;
            }

            modalElement.style.display = 'flex';

            // User clicks "No" (Cannot read Arabic) -> Load index1.css
            yesButtonElement.onclick = function() {
                localStorage.setItem(STORAGE_KEY, 'no'); // Save preference
                modalElement.style.display = 'none';
                if (mainCssLinkElement) {
                    mainCssLinkElement.href = 'styles/index1.css';
                }
                originalLaunchPlayerFunction(chapterNumber, verseNumber);
            };

            // User clicks "Yes" (Can read Arabic) -> Load index.css
            noButtonElement.onclick = function() {
                localStorage.setItem(STORAGE_KEY, 'yes'); // Save preference
                modalElement.style.display = 'none';
                if (mainCssLinkElement) {
                    mainCssLinkElement.href = 'styles/index.css';
                }
                originalLaunchPlayerFunction(chapterNumber, verseNumber);
            };
        };
    });
})();