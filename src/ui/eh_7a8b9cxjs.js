// Defensive image/title enhancer - no-op if expected globals are missing
document.addEventListener('DOMContentLoaded', () => {
    if (typeof streamprotectedtrack_cee2 === 'undefined' || !Array.isArray(streamprotectedtrack_cee2)) return;
    const container = document.getElementById('streamprotectedtrack_cee2-container') || document.querySelector('.streamprotectedtrack_cee2-container');
    if (!container) return;

    streamprotectedtrack_cee2.forEach(streamprotected_cb2 => {
        let finalTitle = streamprotected_cb2.english_name || '';

        if (streamprotected_cb2.streamprotectedtrack_c-ee2 === 36) {
            finalTitle = finalTitle.replace(/\bO\b/, '<span style="font-size: 1.1em; display: inline-block;">O</span>');
        }

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<div class="_ds">${finalTitle}</div>`;
        container.appendChild(card);
    });
});
