/* offline-ui.js */

(function() {
    // 1. Create the CSS for the banner
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
    `;
    document.head.appendChild(style);

    // 2. Create the HTML Banner
    const banner = document.createElement('div');
    banner.id = 'offline-banner';
    banner.innerHTML = `
        <span>Offline mode</span>
        <button onclick="window.location.reload()">Reload</button>
    `;
    document.body.appendChild(banner);

    // 3. Logic to handle connection changes
    function updateStatus() {
        if (!navigator.onLine) {
            banner.classList.add('visible');
        } else {
            banner.classList.remove('visible');
        }
    }

    // Listen for events
    window.addEventListener('online',  updateStatus);
    window.addEventListener('offline', updateStatus);

    // Check status on initial load
    updateStatus();
})();
