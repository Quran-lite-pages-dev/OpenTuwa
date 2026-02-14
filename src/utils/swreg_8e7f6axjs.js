// Copyright (c) Haykal M. Zaidi 2024-2026. All rights reserved. PROPRIETARY AND CONFIDENTIAL.
/**
 * Service Worker Registration
 * Registers the service worker for offline functionality and caching
 * @module utils/service-worker-registration
 */
(function() {
    'use strict';

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/swxjs.js', { scope: '/' })
            .then(function(registration) {
                // Service worker registered successfully
            })
            .catch(function(error) {
                // Service worker registration failed
            });
    }
})();
