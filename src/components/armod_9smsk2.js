// Copyright (c) Haykal M. Zaidi 2024-2026. All rights reserved. PROPRIETARY AND CONFIDENTIAL.
/**
 * Arabic Modal Handler Component
 * Intercepts player launch to show Arabic reading capability modal
 * @module components/arabic-modal-handler
 */
(function() {
    'use strict';

    // ==========================================
    // DEVELOPER CONFIGURATION
    // 0 = Bypass Mode: Force index1.css, no modal, direct launch.
    // 1 = Standard Mode: Check preference, show modal if needed.
    const DEVELOPER_MODE = 0; 
    // ==========================================

    const STORAGE_KEY = 'quran_arabic_pref';
    const mainCssLinkElement = document.getElementById('main-css');

    // --- LOGIC FOR BYPASS (MODE 0) ---
    if (DEVELOPER_MODE === 0) {
        // Force the default specific CSS
        if (mainCssLinkElement) {
            mainCssLinkElement.href = 'styles/a1b2c3d4e5f.css';
        }
        // We return early here. This prevents the event listener 
        // from overwriting 'launchPlayer', allowing the app to 
        // proceed directly to the next step without the modal.
        return;
    }

    // --- LOGIC FOR STANDARD (MODE 1) ---

    // Helper to apply CSS based on preference
    function applyCssPreference(pref) {
        if (mainCssLinkElement) {
            // 'no' (cannot read) -> uses index1.css
            // 'yes' (can read) -> uses index.css
            if (pref === 'no') {
                mainCssLinkElement.href = 'styles/a1b2c3d4e5f.css';
            } else if (pref === 'yes') {
                mainCssLinkElement.href = 'styles/b1c2d3e4f5a.css';
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

            if (!modalElement || !yesButtonElement || !noButtonElement) {
                originalLaunchPlayerFunction(chapterNumber, verseNumber);
                return;
            }

            modalElement.style.display = 'flex';

            // User clicks "No" (Cannot read Arabic) -> Load index1.css
            yesButtonElement.onclick = function() {
                localStorage.setItem(STORAGE_KEY, 'no'); // Save preference
                modalElement.style.display = 'none';
                applyCssPreference('no');
                originalLaunchPlayerFunction(chapterNumber, verseNumber);
            };

            // User clicks "Yes" (Can read Arabic) -> Load index.css
            noButtonElement.onclick = function() {
                localStorage.setItem(STORAGE_KEY, 'yes'); // Save preference
                modalElement.style.display = 'none';
                applyCssPreference('yes');
                originalLaunchPlayerFunction(chapterNumber, verseNumber);
            };
        };
    });
})();