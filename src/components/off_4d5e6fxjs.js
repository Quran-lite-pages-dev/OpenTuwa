// Copyright (c) Haykal M. Zaidi 2024-2026. All rights reserved. PROPRIETARY AND CONFIDENTIAL.
(function() {
    const style = document.createElement('style');
    style.innerHTML = `

        /* Bento-style Floating Container */
        #status-hub {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: auto;
            max-width: 320px;
            padding: 12px 16px;
            background: var(--glass);
            backdrop-filter: blur(16px) saturate(180%);
            -webkit-backdrop-filter: blur(16px) saturate(180%);
            border: 1px solid var(--border);
            border-radius: 14px;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
            color: var(--text-main);
            font-family: 'Inter', system-ui, sans-serif;
            z-index: 2026;
            display: flex;
            align-items: center;
            gap: 12px;
            transform: translateX(120%);
            transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
            pointer-events: all;
        }

        #status-hub.visible { transform: translateX(0); }

        /* Industrial Loading/Status Ring */
        ._aw {
            width: 8px;
            height: 8px;
            background: var(--accent);
            border-radius: 50%;
            box-shadow: 0 0 10px var(--accent);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(1.2); }
            100% { opacity: 1; transform: scale(1); }
        }

        ._bu { flex: 1; }
        ._c0 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.5; display: block; }
        ._dz { font-size: 14px; font-weight: 500; display: block; }

        /* Micro-Interaction Buttons */
        ._di { display: flex; gap: 4px; }
        ._e2 {
            background: rgba(255, 255, 255, 0.05);
            border: none;
            padding: 8px;
            border-radius: 8px;
            color: white;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        ._e2:hover { background: rgba(255, 255, 255, 0.15); transform: translateY(-1px); }

        #_ef { opacity: 0.4; font-size: 18px; }
        #_ef:hover { opacity: 1; color: #ff4d4d; }
    `;
    document.head.appendChild(style);

    const hub = document.createElement('div');
    hub.id = 'status-hub';
    hub.innerHTML = `
        <div class="_aw"></div>
        <div class="_bu">
            <span class="_c0">System State</span>
            <span class="_dz">Localized: Offline Mode</span>
        </div>
        <div class="_di">
            <button class="_e2" onclick="location.reload()" aria-label="Sync">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            </button>
            <button id="_ef" class="_e2">×</button>
        </div>
    `;
    document.body.appendChild(hub);

    document.getElementById('_ef').addEventListener('click', () => hub.classList.remove('visible'));

    function updateStatus() {
        if (!navigator.onLine) {
            hub.classList.add('visible');
        } else {
            hub.classList.remove('visible');
        }
    }

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
})();
