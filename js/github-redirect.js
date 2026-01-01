// Redirect GitHub.io traffic to Pages.dev
(function() {
    'use strict';
    if (window.location.hostname.includes('github.io')) {
        const newUrl = window.location.href.replace('github.io', 'pages.dev');
        window.location.replace(newUrl);
    }
})();

