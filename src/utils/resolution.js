// Copyright (c) Haykal M. Zaidi 2024-2026. All rights reserved. PROPRIETARY AND CONFIDENTIAL.
/**
 * Resolution Detection Utility
 * Detects screen resolution and updates UI badge with resolution label
 * @module utils/resolution
 */
(function() {
    'use strict';

    const SCREEN_WIDTH = Math.round(window.screen.width * window.devicePixelRatio);
    
    /**
     * Determines resolution label based on screen width
     * @returns {string} Resolution label (8K, 4K, UHD, FHD, HD, or empty string)
     */
    function getResolutionLabel() {
        if (SCREEN_WIDTH >= 7600) return '8K';
        if (SCREEN_WIDTH >= 3800) return '4K';
        if (SCREEN_WIDTH >= 2500) return 'UHD';
        if (SCREEN_WIDTH >= 1900) return 'FHD';
        if (SCREEN_WIDTH >= 1200) return 'HD';
        return '';
    }

    const resolutionLabel = getResolutionLabel();

    /**
     * Updates the resolution badge in the UI
     */
    function updateResolutionBadge() {
        const badgeElement = document.querySelector('.badge');
        if (!badgeElement || !resolutionLabel) {
            return;
        }

        const existingLabel = badgeElement.querySelector('.res-label');
        if (existingLabel) {
            existingLabel.remove();
        }

        const labelSpan = document.createElement('span');
        labelSpan.className = 'res-label';
        labelSpan.textContent = ' ' + resolutionLabel;
        badgeElement.appendChild(labelSpan);
    }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', updateResolutionBadge);
    } else {
        updateResolutionBadge();
    }
})();
