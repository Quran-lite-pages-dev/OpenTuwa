// Copyright (c) Haykal M. Zaidi 2024-2026. All rights reserved. PROPRIETARY AND CONFIDENTIAL.
/**
 * Google Analytics Configuration
 * Initializes and configures Google Analytics tracking
 * @module utils/analytics
 */
(function() {
    'use strict';

    window.dataLayer = window.dataLayer || [];

    /**
     * Google Analytics tracking function
     * @param {...*} args - Arguments to pass to dataLayer
     */
    function gtag() {
        window.dataLayer.push(arguments);
    }

    gtag('js', new Date());
    gtag('config', 'G-PDWXFDCQRH', { 'send_page_view': false });
})();
