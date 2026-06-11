// EQ Logic (Web Audio API)
(function() {
    let audioCtx = null;
    let sourceNode1 = null;
    let sourceNode2 = null;
    let eqBands = [];
    
    // Frequencies for a 5-band EQ
    const frequencies = [60, 230, 910, 3600, 14000];
    const maxGain = 12; // +/- 12 dB

    // UI Elements
    const eqBtn = document.getElementById('eq-button');
    const eqOverlay = document.getElementById('eq-sheet-overlay');
    const eqCloseBtn = document.getElementById('eq-close-btn');
    const eqResetBtn = document.getElementById('eq-reset-btn');
    const slidersContainer = document.getElementById('eq-sliders-container');

    function initWebAudio() {
        if (audioCtx) return; // Already initialized

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
            console.warn('Web Audio API not supported in this browser.');
            return;
        }

        audioCtx = new AudioContext();

        const quranAudio = document.getElementById('audio-player');
        const transAudio = document.getElementById('translation-audio-player');

        // Create filters
        let prevNode = null;
        const firstFilter = audioCtx.createBiquadFilter();
        firstFilter.type = 'lowshelf';
        firstFilter.frequency.value = frequencies[0];
        firstFilter.gain.value = 0;
        eqBands.push(firstFilter);
        prevNode = firstFilter;

        for (let i = 1; i < frequencies.length - 1; i++) {
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'peaking';
            filter.frequency.value = frequencies[i];
            filter.Q.value = 1;
            filter.gain.value = 0;
            eqBands.push(filter);
            
            prevNode.connect(filter);
            prevNode = filter;
        }

        const lastFilter = audioCtx.createBiquadFilter();
        lastFilter.type = 'highshelf';
        lastFilter.frequency.value = frequencies[frequencies.length - 1];
        lastFilter.gain.value = 0;
        eqBands.push(lastFilter);
        
        prevNode.connect(lastFilter);
        lastFilter.connect(audioCtx.destination);

        // Connect sources to the first filter
        if (quranAudio) {
            try {
                sourceNode1 = audioCtx.createMediaElementSource(quranAudio);
                sourceNode1.connect(firstFilter);
            } catch (e) {
                console.warn("Could not connect quranAudio to EQ", e);
            }
        }
        
        if (transAudio) {
            try {
                sourceNode2 = audioCtx.createMediaElementSource(transAudio);
                sourceNode2.connect(firstFilter);
            } catch (e) {
                console.warn("Could not connect transAudio to EQ", e);
            }
        }
    }

    function renderSliders() {
        if (!slidersContainer) return;
        slidersContainer.innerHTML = '';

        const labels = ['60', '230', '910', '3.6k', '14k'];

        frequencies.forEach((freq, index) => {
            const bandDiv = document.createElement('div');
            bandDiv.className = 'eq-band';

            const sliderWrapper = document.createElement('div');
            sliderWrapper.className = 'eq-slider-wrapper';

            const slider = document.createElement('input');
            slider.type = 'range';
            slider.className = 'eq-slider';
            slider.min = -maxGain;
            slider.max = maxGain;
            slider.step = 0.1;
            slider.value = 0;

            // Update filter gain on change
            slider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                if (eqBands[index]) {
                    eqBands[index].gain.value = val;
                }
                updateSliderTrack(slider, val);
            });

            // Haptic/Visual feedback
            slider.addEventListener('mousedown', () => {
                if ('vibrate' in navigator) navigator.vibrate(10);
            });
            slider.addEventListener('touchstart', () => {
                if ('vibrate' in navigator) navigator.vibrate(10);
            });

            const label = document.createElement('div');
            label.className = 'eq-band-label';
            label.textContent = labels[index];

            sliderWrapper.appendChild(slider);
            bandDiv.appendChild(sliderWrapper);
            bandDiv.appendChild(label);
            slidersContainer.appendChild(bandDiv);

            // Initial track style
            updateSliderTrack(slider, 0);
        });
    }

    function updateSliderTrack(slider, val) {
        // Calculate percentage for background fill
        const percent = ((val + maxGain) / (maxGain * 2)) * 100;
        // Apply a subtle gradient to indicate fill level from center
        // Apple style usually just has a solid color, we'll keep it simple and clean
        slider.style.background = `linear-gradient(to right, rgba(255,255,255,0.8) ${percent}%, rgba(255,255,255,0.2) ${percent}%)`;
    }

    function resetEQ() {
        if ('vibrate' in navigator) navigator.vibrate(15);
        const sliders = slidersContainer.querySelectorAll('.eq-slider');
        sliders.forEach((slider, index) => {
            slider.value = 0;
            if (eqBands[index]) {
                // Animate the reset smoothly using Web Audio param automation
                const currTime = audioCtx ? audioCtx.currentTime : 0;
                eqBands[index].gain.cancelScheduledValues(currTime);
                eqBands[index].gain.setTargetAtTime(0, currTime, 0.1);
            }
            updateSliderTrack(slider, 0);
        });
    }

    function toggleEQ() {
        if (!eqOverlay.classList.contains('open')) {
            // Open
            eqOverlay.classList.add('open');
            // Init audio context on first user interaction if not done
            if (!audioCtx) {
                initWebAudio();
            } else if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        } else {
            // Close
            eqOverlay.classList.remove('open');
        }
    }

    // Event Listeners
    if (eqBtn) {
        eqBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleEQ();
        });
    }

    if (eqCloseBtn) {
        eqCloseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleEQ();
        });
    }

    if (eqOverlay) {
        eqOverlay.addEventListener('click', (e) => {
            if (e.target === eqOverlay) {
                toggleEQ();
            }
        });
    }

    if (eqResetBtn) {
        eqResetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            resetEQ();
        });
    }

    // Initialize UI
    renderSliders();

})();