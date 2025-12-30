// arabic-check.js

window.addEventListener('load', function() {
    
    // 1. Backup the original launchPlayer function
    const originalLaunchPlayer = window.launchPlayer;

    if (!originalLaunchPlayer) {
        console.error("Original launchPlayer function not found.");
        return;
    }

    // 2. Overwrite launchPlayer with our interceptor
    window.launchPlayer = function(chapter, verse) {
        const modal = document.getElementById('arabic-modal');
        const btnYes = document.getElementById('btn-arabic-yes');
        const btnNo = document.getElementById('btn-arabic-no');
        const cssLink = document.getElementById('main-css');

        // Safety check
        if (!modal || !btnYes || !btnNo) {
            originalLaunchPlayer(chapter, verse);
            return;
        }

        // Show the modal
        modal.style.display = 'flex';

        // --- FIXED LOGIC HERE ---

        // Handle YES: Force change BACK to index.css
        btnYes.onclick = function() {
            modal.style.display = 'none';
            if (cssLink) {
                cssLink.href = 'indextv.css'; // RESET to default
            }
            originalLaunchPlayer(chapter, verse);
        };

        // Handle NO: Change to index1.css
        btnNo.onclick = function() {
            modal.style.display = 'none';
            if (cssLink) {
                cssLink.href = 'indextv1.css'; // SWITCH to modified
            }
            originalLaunchPlayer(chapter, verse);
        };
    };

    console.log("Arabic capability check initialized.");
});
