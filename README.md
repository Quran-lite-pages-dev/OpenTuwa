# Quran for Every Soul

A distraction-free, modern web application for reading and listening to the Noble Quran with synchronized audio, verse-by-verse recitation, and multiple translations.

## Project Overview

Quran for Every Soul is a progressive web application (PWA) that provides an elegant, distraction-free interface for accessing the Quran. The application features:

- **Synchronized Audio Playback**: Verse-by-verse recitation with multiple reciters
- **Multiple Translations**: Support for 40+ languages
- **Algorithm Functionality**: AI-powered 'For You' Recommendations
- **Offline Support**: Service worker caching for offline access
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Clean, minimalist interface with dark mode

## File Structure

```
quran-lite.pages.dev/
├── index.html                  # Main HTML entry point
├── sw.js                       # Service worker for offline functionality
├── LICENSE                       # License
├── CREDITS.MD                      # Credits
├── README.md                   # This file
│
├── src/                        # Source code directory
│   ├── core/                   # Core application logic
│   │   └── app.js              # Main application fileerror-handling-img.js
│   │   └── error-handling-img.js              # error-handling-img.js
│   ├── components/             # UI components
│   │   ├── navigation.js       # Navigation component
│   │   ├── recommendations.js  # AI recommendations
│   │   ├── arabic-modal-handler.js  # Arabic reading capability modal
│   │   ├── offline-status.js   # Offline status indicator
│   │   └── search/             # Search-related components
│   │       ├── grid-navigation.js      # Search grid navigation
│   │       └── voice-search-bridge.js  # Voice search integration
│   └── utils/                  # Utility functions
│       ├── analytics.js        # Google Analytics integration
│       ├── content-protection.js       # Content protection utilities
│       ├── github-redirect.js  # GitHub.io to Pages.dev redirect
│       ├── resolution.js       # Screen resolution detection
│       └── service-worker-registration.js  # Service worker setup
│
├── styles/                     # Stylesheet directory
│   ├── index.css               # Main stylesheet
│   ├── index1.css              # Alternative stylesheet (translation-only view)
│   ├── arabic-modal.css        # Arabic modal styles
│   ├── user-select.css         # User selection prevention styles
│   └── inline-styles.css       # Extracted inline styles
│
├── assets/                     # Static assets
│   ├── images/                 # Image files (verse images, icons)
│   ├── audio/                  # Audio files
│   │   └── play/               # Audio recitation files
│   └── data/                   # Data files
│       └── translations/       # Translation XML files
│
├── functions/                  # Serverless functions (if applicable)
│   └── api/                    # API endpoints
│       ├── recommend.js        # Recommendation API
│       ├── search.js           # Search API
│       └── transcribe.js       # Transcription API
│
└── [other directories]         # Additional project files
```

## How to Run

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A local web server (for development)

### Development Setup

1. **Clone or download the repository**
   ```bash
   git clone [repository-url]
   cd quran-lite.pages.dev
   ```

2. **Start a local web server**

   Using Python:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   Using Node.js (http-server):
   ```bash
   npx http-server -p 8000
   ```

   Using PHP:
   ```bash
   php -S localhost:8000
   ```

3. **Open in browser**
   Navigate to `http://localhost:8000` in your web browser

### Production Deployment

The application is designed to be deployed to static hosting services such as:

- **Cloudflare Pages**: Automatic deployment from Git
- **Netlify**: Drag-and-drop or Git integration
- **GitHub Pages**: Direct hosting from repository
- **Vercel**: Zero-configuration deployment

#### Deployment Steps

1. Ensure all file paths are correct for your hosting environment
2. Upload all files to your hosting service
3. Configure the service worker to work with your domain
4. Update any absolute URLs in the codebase if necessary

### Service Worker

The application includes a service worker (`sw.js`) for offline functionality. The service worker will automatically register when the application loads. To update the service worker cache version, modify the `CACHE_VERSION` constant in `sw.js`.

### Configuration

Key configuration files:

- **Service Worker**: `sw.js` - Cache configuration and offline strategies
- **Main Application**: `src/core/app_5f6e7d.js` - Core application configuration
- **Analytics**: `src/utils/ga_9c8b7a.js` - Google Analytics tracking ID

### Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with CSS Variables
- **Progressive Web App**: Service Workers, Web App Manifest
- **Audio**: HTML5 Audio API
- **Storage**: LocalStorage for user preferences

## Features

### Core Features

- Verse-by-verse audio playback
- Multiple reciters (Mishary Alafasy, Al Juhany, As Sudais, etc.)
- 40+ translation languages
- Search functionality with AI recommendations
- Continue listening feature
- Bookmarking and favorites
- Offline mode support

### User Interface

- Dark mode design
- Responsive layout
- Keyboard navigation support
- Voice search integration
- Smooth animations and transitions

## Contributing

This is an open-source project. Contributions are welcome! Please ensure:

- Code follows the existing style and structure
- All functions include JSDoc comments
- No inline styles or scripts in HTML
- Console.log statements are removed
- Code is properly formatted

## License

PROPRIETARY AND CONFIDENTIAL - ALL RIGHTS RESERVED

Copyright (c) Haykal M. Zaidi 2024-2026

This software and its source code are the exclusive property of Haykal M. Zaidi.
Strictly no part of this software may be used, reproduced, modified, distributed,
or copied in any form or by any means without the express prior written
permission of the author.

The receipt or possession of this source code does not convey or imply any
rights to use it for any purpose.

## Support

For issues, questions, or contributions, please refer to the project repository.

## Notes

Security: media now uses a signed single-use tunneled URL scheme.
- The client requests a short-lived token from `/api/media-token` and the middleware validates it.
- Tokens expire after 1 minute and are marked single-use (in-memory). For production durability replace the in-memory store with a persistent KV or Redis and set `MEDIA_SECRET` via environment.

