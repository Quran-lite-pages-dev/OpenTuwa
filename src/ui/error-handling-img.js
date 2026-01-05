// Inside your chapter/surah rendering loop
chapters.forEach(surah => {
    let finalTitle = surah.english_name;

    // Apply 10% bigger font ONLY to Chapter 36's standalone "O"
    if (surah.chapter === 36) {
        // \bO\b matches "O" as a standalone word (not inside "Originator")
        finalTitle = surah.english_name.replace(/\bO\b/, 
            '<span style="font-size: 1.1em; display: inline-block;">O</span>'
        );
    }

    // Inject into your specific card structure
    container.innerHTML += `
        <div class="card">
            <div class="card-title">${finalTitle}</div>
            <!-- other card content like description -->
        </div>
    `;
});
