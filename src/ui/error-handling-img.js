// Defensive image/title enhancer - no-op if expected globals are missing
document.addEventListener('DOMContentLoaded', () => {
    if (typeof chapters === 'undefined' || !Array.isArray(chapters)) return;
    const container = document.getElementById('chapters-container') || document.querySelector('.chapters-container');
    if (!container) return;

    chapters.forEach(surah => {
        let finalTitle = surah.english_name || '';

        if (surah.chapter === 36) {
            finalTitle = finalTitle.replace(/\bO\b/, '<span style="font-size: 1.1em; display: inline-block;">O</span>');
        }

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<div class="card-title">${finalTitle}</div>`;
        container.appendChild(card);
    });
});
