/**
 * Search Grid Navigation Component
 * Handles keyboard and mouse navigation within search results grid
 * @module components/search/grid-navigation
 */
(function() {
    'use strict';

    let currentSelectedIndex = -1;
    let scrollTimeoutId = null;
    let isScrollingInProgress = false;

    const SCROLL_STEP_PIXELS = 280;
    const CARDS_PER_ROW = 4;
    const SCROLL_DEBOUNCE_MS = 200;
    const resultsGridElement = document.querySelector('.results-grid');

    /**
     * Updates the selected card in the search results grid
     * @param {number} selectedIndex - Index of the card to select
     * @param {string} inputSource - Source of input: 'keyboard', 'mouse', or 'wheel'
     */
    function updateCardSelection(selectedIndex, inputSource) {
        const cardElements = document.querySelectorAll('.surah-card');
        const isValidIndex = selectedIndex >= 0 && selectedIndex < cardElements.length;
        
        if (!cardElements.length || !isValidIndex) {
            return;
        }

        currentSelectedIndex = selectedIndex;
        const targetCardElement = cardElements[currentSelectedIndex];

        targetCardElement.focus({ preventScroll: true });

        if (!isScrollingInProgress && inputSource !== 'wheel') {
            targetCardElement.dispatchEvent(new Event('mouseenter', { bubbles: true }));
            targetCardElement.dispatchEvent(new Event('mouseover', { bubbles: true }));
        }

        if (inputSource === 'keyboard') {
            const scrollPositionPixels = Math.floor(currentSelectedIndex / CARDS_PER_ROW) * SCROLL_STEP_PIXELS;
            resultsGridElement.style.transform = `translateY(-${scrollPositionPixels}px)`;
        }
    }

    /**
     * Handles mouse wheel scrolling in search results
     */
    window.addEventListener('wheel', function(event) {
        const dashboardElement = document.getElementById('dashboard-view');
        if (getComputedStyle(dashboardElement).display === 'none') {
            return;
        }
        if (!event.target.closest('.results-grid')) {
            return;
        }

        isScrollingInProgress = true;
        resultsGridElement.style.pointerEvents = 'none';

        clearTimeout(scrollTimeoutId);
        scrollTimeoutId = setTimeout(function() {
            isScrollingInProgress = false;
            resultsGridElement.style.pointerEvents = 'auto';
        }, SCROLL_DEBOUNCE_MS);

        if (event.deltaY > 0) {
            updateCardSelection(currentSelectedIndex + 1, 'wheel');
        } else {
            updateCardSelection(currentSelectedIndex - 1, 'wheel');
        }
    }, { passive: true });

    /**
     * Handles mouse hover over cards
     */
    document.addEventListener('mouseover', function(event) {
        if (isScrollingInProgress) {
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

    /**
     * Handles keyboard navigation (Arrow keys and Enter)
     */
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
