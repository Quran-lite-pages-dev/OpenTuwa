// arabic-check.js

// Wait for the window to load so we are sure index.js has finished defining launchPlayer
window.addEventListener('load', function() {
    
    // 1. Backup the original launchPlayer function from index.js
    const originalLaunchPlayer = window.launchPlayer;

    if (!originalLaunchPlayer) {
        console.error("Original launchPlayer function not found. Make sure this script runs after index.js");
        return;
    }

    // 2. Overwrite launchPlayer with our interceptor
    window.launchPlayer = function(chapter, verse) {
        const modal = document.getElementById('arabic-modal');
        const btnYes = document.getElementById('btn-arabic-yes');
        const btnNo = document.getElementById('btn-arabic-no');
        const cssLink = document.getElementById('main-css');

        // Safety check: if modal elements are missing, just run the player
        if (!modal || !btnYes || !btnNo) {
            originalLaunchPlayer(chapter, verse);
            return;
        }

        // Show the modal
        modal.style.display = 'flex';

        // Define what happens when YES is clicked
        btnYes.onclick = function() {
            modal.style.display = 'none';
            // Do nothing to CSS, just launch
            originalLaunchPlayer(chapter, verse);
        };

        // Define what happens when NO is clicked
        btnNo.onclick = function() {
            modal.style.display = 'none';
            // Switch the CSS file
            if (cssLink) {
                cssLink.href = 'index1.css';
            }
            // Then launch
            originalLaunchPlayer(chapter, verse);
        };
    };

    console.log("Arabic capability check initialized.");
});
