/**
 * GitHub Redirect Utility
 * Redirects traffic from GitHub.io to Pages.dev domain
 * @module utils/github-redirect
 */
(function() {
    'use strict';

    if (window.location.hostname.includes('github.io')) {
        const redirectUrl = window.location.href.replace('github.io', 'pages.dev');
        window.location.replace(redirectUrl);
    }
})();
