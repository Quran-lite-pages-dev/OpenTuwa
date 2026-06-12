// EQ Logic (Apple-inspired Control Center Sliders & Web Audio API)
(function() {
    let audioCtx = null;
    let eqBands = [];
    const frequencies = [60, 230, 910, 3600, 14000];
    const maxGain = 12; // +/- 12 dB
    
    // Persistent state container to ensure sliders never behave as dummies
    let gainValues = [0, 0, 0, 0, 0]; 

    const eqBtn = document.getElementById('eq-button');
    const eqOverlay = document.getElementById('eq-sheet-overlay');
    const eqCloseBtn = document.getElementById('eq-close-btn');
    const eqResetBtn = document.getElementById('eq-reset-btn');
    const slidersContainer = document.getElementById('eq-sliders-container');

    // Prevent attaching media elements multiple times
    let sourceNode1 = null;
    let sourceNode2 = null;
    let isInitialized = false;

    async function initWebAudio() {
        if (audioCtx) {
            if (audioCtx.state === 'suspended') {
                await audioCtx.resume();
            }
            return; 
        }

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        audioCtx = new AudioContext();

        const quranAudio = document.getElementById('audio-player');
        const transAudio = document.getElementById('translation-audio-player');

        let prevNode = null;
        
        // Create and configure EQ nodes based on stored gain values
        frequencies.forEach((freq, i) => {
            const filter = audioCtx.createBiquadFilter();
            if (i === 0) {
                filter.type = 'lowshelf';
            } else if (i === frequencies.length - 1) {
                filter.type = 'highshelf';
            } else {
                filter.type = 'peaking';
                filter.Q.value = 1.0;
            }
            filter.frequency.value = freq;
            
            // Connect previous slider state to the audio engine immediately
            filter.gain.value = gainValues[i];
            
            eqBands.push(filter);

            if (prevNode) {
                prevNode.connect(filter);
            }
            prevNode = filter;
        });

        // Connect the final filter node to the destination output
        if (eqBands.length > 0) {
            eqBands[eqBands.length - 1].connect(audioCtx.destination);
        }

        // Safely route HTML Media Elements into the Web Audio graph
        try {
            if (quranAudio && !sourceNode1) {
                sourceNode1 = audioCtx.createMediaElementSource(quranAudio);
                sourceNode1.connect(eqBands[0]);
            }
            if (transAudio && !sourceNode2) {
                sourceNode2 = audioCtx.createMediaElementSource(transAudio);
                sourceNode2.connect(eqBands[0]);
            }
        } catch (e) {
            console.warn("EQ Audio Routing Error:", e);
        }
        
        isInitialized = true;
    }

    // Expose the initialization routine globally for app.js integration
    window.initEQ = initWebAudio;

    function renderSliders() {
        if (!slidersContainer) return;
        slidersContainer.innerHTML = '';

        const labels = ['60', '230', '910', '3.6k', '14k'];

        frequencies.forEach((freq, index) => {
            const bandDiv = document.createElement('div');
            bandDiv.className = 'eq-band';

            const slider = document.createElement('div');
            slider.className = 'apple-slider';
            slider.dataset.index = index;

            const track = document.createElement('div');
            track.className = 'apple-slider-track';

            const fill = document.createElement('div');
            fill.className = 'apple-slider-fill';

            // Neutral line indicator representing 0 dB
            const centerTick = document.createElement('div');
            centerTick.className = 'apple-slider-center';

            // Apply current state value to visual slider fill height
            const currentVal = gainValues[index];
            const percent = (currentVal + maxGain) / (maxGain * 2); // Map -12dB/12dB to 0.0-1.0 range
            fill.style.height = `${percent * 100}%`;

            track.appendChild(fill);
            slider.appendChild(track);
            slider.appendChild(centerTick);

            const label = document.createElement('div');
            label.className = 'eq-band-label';
            label.textContent = labels[index];

            bandDiv.appendChild(slider);
            bandDiv.appendChild(label);
            slidersContainer.appendChild(bandDiv);

            let isDragging = false;

            // Compute values and apply them interactively
            function updateValue(e) {
                const rect = slider.getBoundingClientRect();
                let y = e.clientY - rect.top;
                y = Math.max(0, Math.min(rect.height, y));
                
                const dragPercent = 1 - (y / rect.height); // 0.0 to 1.0 range
                fill.style.height = `${dragPercent * 100}%`;
                
                const calculatedGain = (dragPercent * (maxGain * 2)) - maxGain; // -12 to +12 dB
                gainValues[index] = calculatedGain; // Store state securely

                // Update physical audio node if initialized
                if (eqBands[index] && audioCtx) {
                    eqBands[index].gain.setValueAtTime(calculatedGain, audioCtx.currentTime);
                }
            }

            // Pointer events supporting desktop mouse, touch displays, and stylus targets
            slider.addEventListener('pointerdown', (e) => {
                isDragging = true;
                slider.classList.add('dragging');
                slider.setPointerCapture(e.pointerId);
                updateValue(e);
                if (navigator.vibrate) {
                    navigator.vibrate(8);
                }
            });

            slider.addEventListener('pointermove', (e) => {
                if (!isDragging) return;
                updateValue(e);
            });

            const stopDrag = (e) => {
                if (!isDragging) return;
                isDragging = false;
                slider.classList.remove('dragging');
                slider.releasePointerCapture(e.pointerId);
                if (navigator.vibrate) {
                    navigator.vibrate(12);
                }
            };

            slider.addEventListener('pointerup', stopDrag);
            slider.addEventListener('pointercancel', stopDrag);
        });
    }

    function resetEQ() {
        if (navigator.vibrate) {
            navigator.vibrate(15);
        }
        gainValues = [0, 0, 0, 0, 0];
        const fills = slidersContainer.querySelectorAll('.apple-slider-fill');
        fills.forEach((fill, index) => {
            fill.style.height = '50%';
            if (eqBands[index]) {
                const currTime = audioCtx ? audioCtx.currentTime : 0;
                eqBands[index].gain.cancelScheduledValues(currTime);
                eqBands[index].gain.setTargetAtTime(0, currTime, 0.05);
            }
        });
    }

    async function toggleEQ() {
        if (!eqOverlay.classList.contains('open')) {
            eqOverlay.classList.add('open');
            await initWebAudio();
        } else {
            eqOverlay.classList.remove('open');
        }
    }

    if (eqBtn) {
        eqBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await toggleEQ();
        });
    }

    if (eqCloseBtn) eqCloseBtn.addEventListener('click', () => toggleEQ());
    if (eqOverlay) {
        eqOverlay.addEventListener('click', (e) => {
            if (e.target === eqOverlay) toggleEQ();
        });
    }
    if (eqResetBtn) eqResetBtn.addEventListener('click', resetEQ);

    // Initial render of presentation layers
    renderSliders();
})();