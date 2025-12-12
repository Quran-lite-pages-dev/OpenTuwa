/* offline-ui.js */

(function() {
    // 1. Create the CSS for the banner and the new close button
    const style = document.createElement('style');
    style.innerHTML = `
        #offline-banner {
            position: fixed;
            bottom: -100px; /* Hidden by default */
            left: 0;
            width: 100%;
            background-color: #333;
            color: white;
            text-align: center;
            padding: 16px;
            font-family: Arial, sans-serif;
            font-size: 16px;
            transition: bottom 0.5s ease;
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
        }
        #offline-banner.visible {
            bottom: 0; /* Slide up */
        }
        #offline-banner button {
            background: transparent;
            border: 1px solid white;
            color: white;
            padding: 5px 10px;
            cursor: pointer;
            border-radius: 4px;
        }

        /* NEW: Styles for the Close Button */
        #offline-close-btn {
            position: absolute; /* Position it relative to the banner */
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: white;
            font-size: 20px; /* Make the 'x' visible */
            line-height: 1; /* Keep it centered */
            cursor: pointer;
            padding: 0;
            opacity: 0.7; /* Make it slightly transparent */
            transition: opacity 0.2s;
        }
        #offline-close-btn:hover {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);

    // 2. Create the HTML Banner
    const banner = document.createElement('div');
    banner.id = 'offline-banner';
    banner.innerHTML = `
        <span>No Internet Connection</span>
        <button onclick="window.location.reload()">Retry</button>
        <button id="offline-close-btn" aria-label="Close message">×</button>
    `;
    document.body.appendChild(banner);

    // NEW: 3. Logic to hide the banner permanently (until next page load)
    const closeButton = document.getElementById('offline-close-btn');

    closeButton.addEventListener('click', function() {
        // This completely removes the banner element from the page's HTML structure
        banner.remove();
        // Or, if you want it to just disappear without being removed:
        // banner.style.display = 'none'; 
    });


    // 4. Logic to handle connection changes
    function updateStatus() {
        // Only show if the banner hasn't been removed (i.e., if it's still in the DOM)
        if (document.body.contains(banner)) {
            if (!navigator.onLine) {
                banner.classList.add('visible');
            } else {
                banner.classList.remove('visible');
            }
        }
    }

    // Listen for events
    window.addEventListener('online',  updateStatus);
    window.addEventListener('offline', updateStatus);

    // Check status on initial load
    updateStatus();
})();
 
