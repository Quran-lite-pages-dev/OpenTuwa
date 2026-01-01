// Service Worker Registration
(function() {
    'use strict';
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .then(function(registration) {
                console.log('Service Worker Registered with scope:', registration.scope);
            })
            .catch(function(err) {
                console.log('SW Failed:', err);
            });
    }
})();

