// Copyright (c) Haykal M. Zaidi 2024-2026. All rights reserved. PROPRIETARY AND CONFIDENTIAL.
/**
 * Arabic Modal Handler Component
 * Intercepts player launch to show Arabic reading capability modal
 * @module components/arabic-modal-handler
 */
(function() {
    'use strict';

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
            const modalElement = document.getElementById('arabic-modal');
            const yesButtonElement = document.getElementById('btn-arabic-yes');
            const noButtonElement = document.getElementById('btn-arabic-no');
            const mainCssLinkElement = document.getElementById('main-css');

            if (!modalElement || !yesButtonElement || !noButtonElement) {
                originalLaunchPlayerFunction(chapterNumber, verseNumber);
                return;
            }

            modalElement.style.display = 'flex';

            yesButtonElement.onclick = function() {
                modalElement.style.display = 'none';
                if (mainCssLinkElement) {
                    mainCssLinkElement.href = 'styles/index.css';
                }
                originalLaunchPlayerFunction(chapterNumber, verseNumber);
            };

            noButtonElement.onclick = function() {
                modalElement.style.display = 'none';
                if (mainCssLinkElement) {
                    mainCssLinkElement.href = 'styles/index1.css';
                }
                originalLaunchPlayerFunction(chapterNumber, verseNumber);
            };
        };
    });
})();
