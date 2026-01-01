// Search Grid Navigation - Handles keyboard and mouse navigation in search results
(function() {
    'use strict';

    let currentSelectedIndex = -1;
    let scrollTimeout = null;
    let isScrollingFlag = false;

    const SCROLL_STEP_SIZE = 280;
    const resultsGridElement = document.querySelector('.results-grid');

    function updateCardSelection(selectedIndex, inputSource) {
        const cardElements = document.querySelectorAll('.surah-card');
        if (!cardElements.length || selectedIndex < 0 || selectedIndex >= cardElements.length) {
            return;
        }

        currentSelectedIndex = selectedIndex;
        const targetCardElement = cardElements[currentSelectedIndex];

        targetCardElement.focus({ preventScroll: true });

        if (!isScrollingFlag && inputSource !== 'wheel') {
            targetCardElement.dispatchEvent(new Event('mouseenter', { bubbles: true }));
            targetCardElement.dispatchEvent(new Event('mouseover', { bubbles: true }));
        }

        if (inputSource === 'keyboard') {
            const scrollPosition = Math.floor(currentSelectedIndex / 4) * SCROLL_STEP_SIZE;
            resultsGridElement.style.transform = `translateY(-${scrollPosition}px)`;
        }
    }

    window.addEventListener('wheel', function(event) {
        const dashboardElement = document.getElementById('dashboard-view');
        if (getComputedStyle(dashboardElement).display === 'none') {
            return;
        }
        if (!event.target.closest('.results-grid')) {
            return;
        }

        isScrollingFlag = true;
        resultsGridElement.style.pointerEvents = 'none';

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function() {
            isScrollingFlag = false;
            resultsGridElement.style.pointerEvents = 'auto';
        }, 200);

        if (event.deltaY > 0) {
            updateCardSelection(currentSelectedIndex + 1, 'wheel');
        } else {
            updateCardSelection(currentSelectedIndex - 1, 'wheel');
        }
    }, { passive: true });

    document.addEventListener('mouseover', function(event) {
        if (isScrollingFlag) {
            return;
        }

        const hoveredCard = event.target.closest('.surah-card');
        if (!hoveredCard) {
            return;
        }

        const cardElements = Array.from(document.querySelectorAll('.surah-card'));
        const hoveredIndex = cardElements.indexOf(hoveredCard);

        if (hoveredIndex !== currentSelectedIndex) {
            updateCardSelection(hoveredIndex, 'mouse');
        }
    }, true);

    window.addEventListener('keydown', function(event) {
        const dashboardElement = document.getElementById('dashboard-view');
        if (getComputedStyle(dashboardElement).display === 'none') {
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            updateCardSelection(currentSelectedIndex + 1, 'keyboard');
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            updateCardSelection(currentSelectedIndex - 1, 'keyboard');
        }

        if (event.key === 'Enter' && currentSelectedIndex !== -1) {
            document.querySelectorAll('.surah-card')[currentSelectedIndex].click();
        }
    });
})();

