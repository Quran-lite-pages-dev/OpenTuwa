EXHAUSTIVE DOCUMENTATION
=======================

Scope
-----
- This document provides a per-folder and per-file deep-dive for the repository at a maintenance and security level: what each file does, hidden complexity, important implementation notes, and remediation suggestions.
- It focuses on code, configuration, and patterns. Static assets (audio/images) are summarized by directory and naming conventions to keep the file readable.

How to read this file
---------------------
- Files are grouped by top-level folder. For each code file we list: Purpose, Key implementation notes, Risks / surprising behaviour, Quick fix / remediation.
- For large asset directories we document naming patterns and usage points in the code.

Top-level overview
------------------
- Deployment model: Cloudflare Pages / Workers style (uses `wrangler` in `package.json`, serverless `functions/` routes). Client is a vanilla JS SPA under `src/`.
- Media tunnel: short-lived HMAC tokens minted by `/api/media-token` and validated in middleware before proxying media from GitHub/jsDelivr.
- Auth: minimal; `TUWA_PREMIUM=true` cookie is used as a gate in server endpoints.
- Important env/bindings: `MEDIA_SECRET` (HMAC secret), `ASSETS` (asset binding). Default fallbacks exist in code — these are dangerous in production.

1) functions/ (edge server handlers)
-----------------------------------

`functions/_middleware.js`
- Purpose: central routing and request gatekeeper; validates media tokens, proxies media requests to origin (jsDelivr/GitHub), prunes used-token cache, allows guest paths.
- Key implementation notes:
  - Uses `globalThis.__USED_TOKENS` Map as an in-memory, single-process nonce store for single-use token enforcement.
  - `MEDIA_SECRET` falls back to hard-coded `'please-set-a-strong-secret-in-prod'` when not provided.
  - Token verification checks expiry, signature (HMAC-SHA256), nonce reuse, and token binding to request IP and UA hash (first 8 hex digits of SHA-256 of UA).
  - Proxies upstream media by fetching from `https://cdn.jsdelivr.net/gh/...` and strips a handful of headers.
  - Contains allowlist arrays for guest-accessible assets and a few hard-coded route branches.
- Risks / surprising behaviour:
  - In-memory nonce store is not durable across worker restarts/instances — single-use guarantee breaks during rollouts or multi-worker deployments.
  - Secret fallback means deploying without `MEDIA_SECRET` effectively disables key protections.
  - IP + UA-hash binding provides stronger replay protection but causes false positives for legitimate mobile/proxy users and can leak fragility to user experience.
  - Proxy logic relies on specific upstream paths and string replacements — brittle if CDN layout changes.
- Quick fixes / remediation:
  - Require `MEDIA_SECRET` at startup (throw or return 500 if absent).
  - Replace in-memory nonce Map with a durable store (Cloudflare KV or Durable Objects) and keep a short TTL.
  - Loosen IP binding or fallback to UA-only when IP unavailable or CIDR matches known proxies.

`functions/api/media-token.js`
- Purpose: POST endpoint that mints signed media tunnel tokens for the client.
- Key implementation notes:
  - Enforces `TUWA_PREMIUM=true` cookie; otherwise returns 401.
  - Generates payload: `{ type, filename, exp, nonce, ip, ua_hash }` with `exp` usually Date.now()+60000 (60s).
  - Uses Web Crypto or `crypto.subtle/HMAC` to sign payload with `MEDIA_SECRET`.
  - Returns a token string in the form `payloadB64.sigB64` (base64url style).
- Risks / surprising behaviour:
  - Uses the same `MEDIA_SECRET` fallback string if env binding missing.
  - UA hash is truncated to the first 8 hex chars — collision risk is small but present.
  - TTL is very short (60s) — fine for tunnel but requires client fast roundtrips.
- Quick fixes / remediation:
  - Verify `TUWA_PREMIUM` properly (tie to a verified auth backend) or make token issuance conditional on actual authentication.
  - Consider short-lived JWT-style tokens with key-rotation support.

`functions/login-client.js`, `functions/login-google.js`, `functions/login.js`
- Purpose: login flows (client triggers, server endpoints). Intended to integrate with Google or client-side flows.
- Key implementation notes:
  - Current `login-google.js` explicitly bypasses Google token verification and unconditionally sets `TUWA_PREMIUM=true` cookie.
  - Cookies are set with long Max-Age (1 year) and HttpOnly/secure attributes in places.
- Risks / surprising behaviour:
  - Unverified login grants premium access to anyone calling the endpoint — this is a critical security hole.
- Quick fixes / remediation:
  - Implement proper token verification against Google OAuth tokeninfo or use server-side library to verify ID tokens.
  - Do not set long-lived premium cookie without verification; prefer signed session cookies or real session tokens.

`functions/api/config.js`
- Purpose: returns SURAH metadata, translations mapping, reciters list and client configuration consumed by the SPA.
- Key implementation notes:
  - Contains a large inline JSON-like structure mapping translation IDs to `/media/data/*.xml` and reciter metadata.
  - Client treats this as an authoritative source of where to fetch translations/audio.
- Risks / surprising behaviour:
  - Hard-coded internal paths make migrations or CDN re-layouts risky.
  - Putting large static arrays inline increases cold-start cost on the edge if invoked frequently.
- Quick fixes / remediation:
  - Consider serving this config as a static JSON file via `ASSETS` binding or build-time artifact.

Other `functions/*` endpoints
- `search.js`, etc.: small utilities and handlers — follow same patterns: check for cookie guard usage and secret fallbacks when applicable.

2) src/ (client application)
----------------------------

`src/core/app.js`
- Purpose: main SPA controller — loads `/api/config`, drives playback, builds tunneled URLs, and coordinates UI updates.
- Key implementation notes:
  - Implements `getTunneledUrl(type, filename)` which POSTs to `/api/media-token` and then constructs `/media/${type}/${token}/${filename}`.
  - `encodeStream` / `decodeStream` implement unsigned base64url deep-links (no integrity/auth signature) used to remember playback position or selection.
  - Several functions contain `// SECURE FIX` comments noting quick patches and technical debt.
  - `updateTranslationAudio()` is a stub / no-op in the shipped code.
  - Heavy reliance on DOM IDs and global state; minimal modularization.
- Risks / surprising behaviour:
  - Unsigned deep-link tokens can be forged, allowing manipulated client state or deep-link sharing that bypasses intended guarantees.
  - Client expects quick response from `/api/media-token` due to token TTL; slow networks may break the flow.
  - Many inline alerts and reloads remain from debugging.
- Quick fixes / remediation:
  - Use signed deep-links (HMAC or JWT) when tokens are required to guard UX flows.
  - Move repeated DOM logic into small components and remove debug `alert()` calls.

`src/core/lyrics-engine.js`
- Purpose: renders translation lines (current + next) in the UI.
- Notes: simple DOM manipulator, tightly bound to translation XML structure.

`src/components/*` and `src/ui/*`
- Purpose: small UI components and handlers for offline status, navigation, modals, etc.
- Notes: keep same structure — review files for DOM assumptions and global references.

3) utils/ (helpers)
---------------------
- Files like `i18n-loader.js`, `routing.js`, `service-worker-registration.js`, `content-protection.js` provide helper functions. Watch for any functions that rely on global state or assume server runtime-only APIs.

4) data/translations/ and assets/
--------------------------------
- `data/translations/`: contains many XML translation files (per-language). These are referenced from `/api/config` and consumed by the client.
- `assets/audio/play/id/` and `assets/cdn/`: enormous set of `.mp3` files, named by numeric id. The code expects mapping between surah/verse pairs and asset numeric IDs.
- `assets/images/img/`: PNG images used for verse art and thumbnails, named by numeric patterns like `33_47.png`.
- Usage & patterns:
  - Media requests are proxied via the middleware tunnel, which resolves a token to an upstream jsDelivr URL or to the `ASSETS` binding.
  - Many files are large and should remain in the CDN or `ASSETS` binding rather than in worker memory.
- Guidance:
  - Do not list each audio/image file in this document — instead rely on the directory structure.
  - If needed, export an inventory CSV via script that lists `assets/**/*` with sizes and hashes.

5) locales/, styles/, and root HTML files
---------------------------------------
- `locales/`: small JSON translation files for UI strings.
- `styles/`: CSS organized by pages and components. No runtime risk here; check for selectors relied upon by JS.
- `app.html`, `landing.html`, `index.html`: static shells used by Pages; client app is bootstrapped from them.

6) Build / deployment
---------------------
- `package.json` scripts include `dev` (Pages dev) and `deploy` (pages deploy), plus `wrangler` dependency.
- `manifest.json`, `sw.js`, and `robots.txt` are present for PWA / SEO / caching.

7) Security and operational hot spots (high priority)
---------------------------------------------------
- `MEDIA_SECRET` fallback in `functions/_middleware.js` and `functions/api/media-token.js`: enforce presence.
- `login-google.js` (and/or other login endpoints): currently bypasses verification and sets `TUWA_PREMIUM=true`. This is a critical vulnerability; patch immediately.
- In-memory nonce store: replace with KV or Durable Object to enforce single-use tokens across instances.
- Token binding to IP+UA: consider softening or adding fallback paths to reduce false positives.
- Unsigned client deep-links: sign or HMAC them if used to gate actions.

8) Emergency commands & quick remediation checklist
--------------------------------------------------
- Fail fast on missing `MEDIA_SECRET` (temporary quick patch):

  - Edit `functions/_middleware.js` and `functions/api/media-token.js` to throw 500 if `MEDIA_SECRET` is the default string.

- Disable the broken login endpoint (quick emergency):

  - Return 501 or 403 from `functions/login-google.js` until proper verification is implemented.

- Short-term nonce durability:

  - Replace `globalThis.__USED_TOKENS` with a simple KV-backed store (Cloudflare KV) with TTL=5 minutes.

9) Suggested long-term improvements
-----------------------------------
- Replace ad-hoc cookies with signed session tokens + server-side session validation.
- Move large static config (`api/config.js`) to build-time generated JSON served from `ASSETS`.
- Introduce automated tests for token mint/verify flows (unit tests for HMAC and integration tests for the middleware proxy).

10) Appendix — quick map of critical files (path → purpose)
- `functions/_middleware.js` — edge gate + media proxy + token verify
- `functions/api/media-token.js` — token mint endpoint
- `functions/login-google.js` — login endpoint (currently unsafe)
- `functions/login-client.js` — client login helper
- `functions/api/config.js` — surah/translation reciter config
- `src/core/app.js` — client controller and media token client
- `src/core/lyrics-engine.js` — translation rendering
- `utils/*` — helper utilities
- `assets/*` — audio and image binaries (large)



End of document.
