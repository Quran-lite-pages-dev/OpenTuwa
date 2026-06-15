# Apple Human Interface Guidelines — Complete Reference

> **Last updated for:** iOS 18 / iPadOS 18 / macOS 15 Sequoia / watchOS 11 / tvOS 18 / visionOS 2 · WWDC 2025 (Liquid Glass era)
> **Official source:** [developer.apple.com/design/human-interface-guidelines](https://developer.apple.com/design/human-interface-guidelines)

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Design Principles](#2-design-principles)
3. [Designing for iOS (iPhone)](#3-designing-for-ios-iphone)
4. [Designing for iPadOS](#4-designing-for-ipados)
5. [Designing for macOS](#5-designing-for-macos)
6. [Designing for watchOS](#6-designing-for-watchos)
7. [Designing for tvOS](#7-designing-for-tvos)
8. [Designing for visionOS](#8-designing-for-visionos)
9. [Foundations — App Icons](#9-foundations--app-icons)
10. [Foundations — Color](#10-foundations--color)
11. [Foundations — Layout](#11-foundations--layout)
12. [Foundations — Materials & Liquid Glass](#12-foundations--materials--liquid-glass)
13. [Foundations — Typography](#13-foundations--typography)
14. [Patterns — Menus](#14-patterns--menus)
15. [Patterns — Scroll Views](#15-patterns--scroll-views)
16. [Patterns — Search Fields](#16-patterns--search-fields)
17. [Patterns — Sidebars](#17-patterns--sidebars)
18. [Patterns — Siri & Apple Intelligence](#18-patterns--siri--apple-intelligence)
19. [Patterns — Snippets](#19-patterns--snippets)
20. [Patterns — Navigation](#20-patterns--navigation)
21. [Patterns — Modality & Sheets](#21-patterns--modality--sheets)
22. [Patterns — Onboarding](#22-patterns--onboarding)
23. [Patterns — Loading & Progress](#23-patterns--loading--progress)
24. [Patterns — Empty States](#24-patterns--empty-states)
25. [Patterns — Feedback & Haptics](#25-patterns--feedback--haptics)
26. [Components — Buttons](#26-components--buttons)
27. [Components — Tab Bars](#27-components--tab-bars)
28. [Components — Navigation Bars](#28-components--navigation-bars)
29. [Components — Toolbars](#29-components--toolbars)
30. [Components — Lists & Tables](#30-components--lists--tables)
31. [Components — Alerts & Action Sheets](#31-components--alerts--action-sheets)
32. [Components — Pickers & Date Pickers](#32-components--pickers--date-pickers)
33. [Components — Sliders, Steppers & Toggles](#33-components--sliders-steppers--toggles)
34. [Components — Segmented Controls](#34-components--segmented-controls)
35. [Components — Context Menus & Pop-ups](#35-components--context-menus--pop-ups)
36. [Components — Collection Views & Grids](#36-components--collection-views--grids)
37. [Components — Text Views & Text Fields](#37-components--text-views--text-fields)
38. [Inputs](#38-inputs)
39. [Technologies — Widgets](#39-technologies--widgets)
40. [Technologies — Live Activities](#40-technologies--live-activities)
41. [Technologies — Dynamic Island](#41-technologies--dynamic-island)
42. [Technologies — SharePlay](#42-technologies--shareplay)
43. [Technologies — Augmented Reality (AR)](#43-technologies--augmented-reality-ar)
44. [Technologies — CarPlay](#44-technologies--carplay)
45. [Technologies — Game Center](#45-technologies--game-center)
46. [Technologies — In-App Purchase & StoreKit](#46-technologies--in-app-purchase--storekit)
47. [Accessibility — Complete Guide](#47-accessibility--complete-guide)
48. [SF Symbols](#48-sf-symbols)
49. [Design Resources & Tools](#49-design-resources--tools)
50. [Quick Reference Checklists](#50-quick-reference-checklists)

---

## 1. Getting Started

### What Are the Apple Human Interface Guidelines?

The Apple Human Interface Guidelines (HIG) are Apple's official, comprehensive design documentation covering principles, components, patterns, and platform-specific guidance for building apps across all Apple platforms. They represent decades of accumulated design wisdom and evolve with every major OS release.

**Coverage spans:**
- **iOS / iPadOS** — iPhone and iPad apps
- **macOS** — Mac desktop and laptop apps
- **watchOS** — Apple Watch apps
- **tvOS** — Apple TV apps
- **visionOS** — Apple Vision Pro spatial computing apps

### Why the HIG Matters

- **User expectation alignment:** iPhone users already know where back buttons live, how sheets dismiss, and what a tab bar does. Honor those patterns and trust is earned for free.
- **App Store readiness:** Reviewers flag non-standard navigation, inaccessible controls, and gestures that conflict with system behaviors. Strong HIG alignment reduces revision requests.
- **Accessibility compliance:** Many HIG requirements overlap with legal accessibility mandates in various jurisdictions.
- **Future-proofing:** Apps built on documented platform patterns automatically adapt when Apple updates control styles with new OS releases.
- **Maintainability:** Standard UIKit / SwiftUI components require far less custom maintenance than hand-rolled equivalents.

### Structure of the HIG

Each platform section organizes content into four layers:

| Layer | What it covers |
|-------|---------------|
| **Foundations** | Color, typography, layout, iconography, materials — the visual DNA of your app |
| **Patterns** | Common user flows: navigation, searching, onboarding, data entry, feedback |
| **Components** | Detailed specs for every standard UI element (buttons, tab bars, pickers, etc.) |
| **Technologies** | Platform-specific features: Widgets, Live Activities, SharePlay, AR, CarPlay, etc. |

### How to Use the HIG Efficiently

1. Before wireframing, map every planned feature to its HIG section.
2. Use Apple's official Figma / Sketch UI kits as the component baseline.
3. Justify every deviation from HIG defaults in your design documentation.
4. Translate HIG requirements into acceptance criteria in engineering tickets.
5. Run HIG compliance checks as a required sprint gate — treat violations as bugs.
6. Check the HIG changelog with every major iOS / macOS release.

---

## 2. Design Principles

Apple's design philosophy is built on three interdependent core principles.

### Clarity

Clarity means removing ambiguity from every interactive element so users know exactly what each control does and what will happen when they use it.

**In practice:**
- Labels must describe the action, not the mechanic. "Send Payment" beats "Submit." "Delete Photo" beats "OK."
- Screen density should be controlled. Competing visual elements dilute attention and increase cognitive load.
- Icons must be universally recognizable or accompanied by labels.
- Text must be legible at all Dynamic Type sizes, in both light and dark environments.
- Every state — default, pressed, loading, error, success — must be visually distinct.
- Error messages must explain what the user should do next, not just what went wrong.

**Anti-patterns to avoid:**
- Three equal-weight primary buttons competing for attention on a single screen.
- Vague loading states with no indicator of progress or duration.
- Icon-only buttons with no accessible labels or tooltip fallbacks.
- Custom typography that breaks Dynamic Type scaling.

### Deference

Deference means the interface steps back and lets the user's content, data, and goals take center stage. UI chrome exists to serve the user, not to announce the product.

**In practice:**
- When viewing a photo, the navigation bar should fade so the image fills the screen.
- Navigation elements should appear contextually rather than being permanently visible.
- Avoid persistent toolbars that frame every content view with a fixed chrome border.
- Use translucent materials (rather than opaque) so background content remains contextually visible.
- Animations should reveal content relationships, not entertain for its own sake.

**Reference examples:** Apple's Photos app disappears when you're viewing an image. Wallet shows content, not branding. Mail puts the email first and puts controls at the edges.

### Depth

Depth uses visual layering, realistic motion, and spatial relationships to convey hierarchy and help users understand where they are within a flow.

**In practice:**
- Use shadows, materials, and blur to establish which layers sit in front of others.
- Motion should reinforce the relationship between views. Push transitions signal a drill-down; slide transitions signal peer-level navigation.
- Modals and sheets sit above the content they're presented over, reinforcing their temporary, focused nature.
- The Dynamic Island, notification banners, and floating panels occupy distinct visual layers above app content.
- In visionOS, depth is literal — windows and panels occupy different Z positions in 3D space.

---

## 3. Designing for iOS (iPhone)

### iPhone Context

People depend on iPhone to stay connected, play games, view media, accomplish tasks, and track personal data — in any location, while on the go, often one-handed and in motion. Design must accommodate this context of use.

### Core Tenets for iOS

| Tenet | Implication |
|-------|-------------|
| **Convenience** | Core tasks should be completable in seconds, not minutes |
| **Focus** | Present one primary task per screen; avoid multi-column layouts |
| **Touch-first** | All interactions must be finger-friendly; no hover-dependent UI |
| **One-handed use** | Primary actions belong at the bottom of the screen (thumb reach) |
| **Portability** | Design for variable lighting, noise, motion, and interrupted sessions |

### Screen & Safe Area

- **Respect safe areas.** Never place tappable content, labels, or essential visuals behind the notch, Dynamic Island, Home Indicator, or rounded screen corners.
- Use `safeAreaLayoutGuide` (UIKit) or `.safeAreaInset` (SwiftUI) exclusively — never hard-code pixel offsets for specific device models.
- The Dynamic Island (iPhone 14 Pro and later) is an interactive system area; design content to flow around it, not compete with it.
- Content behind navigation bars and tab bars should appear to scroll under them, not be clipped.

### Navigation Model

iOS supports three navigation patterns. Choose one per app section and keep it consistent:

**1. Hierarchical (push navigation):**
- Use when content has a clear parent–child drill-down hierarchy.
- Implemented via `UINavigationController` / `NavigationStack`.
- Always provide a back button; never leave users stranded in a sub-view.
- Breadcrumb depth: 3–4 levels maximum before reconsidering IA.

**2. Flat (tab-based navigation):**
- Use when app contains 2–5 distinct, peer-level sections.
- Implemented via `UITabBarController` / `TabView`.
- Each tab should represent a complete, independent destination.
- Do not mix hierarchical navigation with flat navigation across tabs without clear visual signaling.

**3. Content-driven (page-based navigation):**
- Use for content consumption flows: onboarding screens, books, photo galleries.
- Implemented via `UIPageViewController` or `TabView` with `.tabViewStyle(.page)`.
- Provide page indicators when count is ≤ 20.

### Touch Targets

- Minimum tappable area: **44 × 44 points** — non-negotiable.
- Visual size of an icon can be smaller, but its tap area must meet the minimum via padding.
- Apple's own research shows targets smaller than 44pt cause missed taps or incorrect selections for more than 25% of users, especially those with motor impairments.
- Spacing between adjacent tap targets: minimum **8 points**.

### Gestures

| Gesture | System reservation | Notes |
|---------|-------------------|-------|
| Edge swipe from left | iOS system back navigation | Never override with a custom gesture |
| Swipe from bottom edge | Home indicator / multitasking | Never block |
| Long press | Contextual menus, Haptic Touch | Use for supplemental, not primary, actions |
| Pinch / rotate | Photos, Maps zoom | Override only in full-screen media views |
| 3-finger tap | Text selection system | Avoid conflicts |

**Rule:** Never remove a system gesture without providing a clear alternative. Users rely on muscle memory.

### Content Layout Guidelines

- **8-point grid system:** All spacing, margins, and component sizing should be multiples of 8pt (4pt for fine details).
- **Standard content margins:** 16pt from screen edges on iPhone (20pt on iPad).
- **Line length:** 45–75 characters per line for optimal readability.
- Content should extend edge-to-edge on visually immersive screens (photos, maps, video), but text content must respect horizontal margins.

### Adaptive Design

All iOS apps must adapt to:
- All current iPhone screen sizes (from iPhone SE to iPhone 16 Pro Max)
- Portrait and landscape orientations
- Light and Dark Mode
- All Dynamic Type text sizes (from xSmall to AX5)
- Increased contrast mode
- Reduced motion preference
- Reduced transparency preference

---

## 4. Designing for iPadOS

### iPad Context

iPad bridges phone and computer. It's used at a desk or table, often with an Apple Pencil, Smart Keyboard, or Magic Keyboard, and commonly for longer, more focused sessions than iPhone.

### iPad-Specific Patterns

**Sidebars:** On iPad, sidebar + content split-view is the preferred navigation pattern (not a tab bar). The sidebar persists or collapses to a menu depending on available space. See [Section 17](#17-patterns--sidebars).

**Column layouts:** iPad's larger canvas supports 2- and 3-column layouts. Use `UISplitViewController` / `NavigationSplitView` to adapt automatically.

**Pointer support:** When a user attaches a Magic Trackpad or mouse, the system shows a pointer. Your app must handle hover states. Interactive elements should have hover highlights; draggable items should show appropriate cursor styles.

**Apple Pencil:** If your app targets drawing, note-taking, or annotation, integrate `UIPencilInteraction` and respond to double-tap and squeeze gestures on Apple Pencil 2/3.

**Keyboard shortcuts:** All iPad apps should support common keyboard shortcuts: ⌘N (new), ⌘S (save), ⌘Z / ⌘⇧Z (undo/redo), ⌘C / ⌘V (copy/paste), ⌘F (find), ⌘W (close), ⌘Q (quit).

**Multitasking:** Apps must support Slide Over and Split View. Avoid fixed layouts that break at narrow widths. Test at all Split View proportions (1/3, 1/2, 2/3).

### iPad Adaptive Considerations

| Feature | Compact Width (iPhone / narrow iPad) | Regular Width (full iPad) |
|---------|--------------------------------------|--------------------------|
| Navigation | Tab bar | Sidebar |
| Lists | Full-width | Master–detail split |
| Popovers | Full-screen modal | Anchored popover |
| Keyboard | On-screen | Hardware (often) |

---

## 5. Designing for macOS

### Mac Context

Mac users expect desktop-class functionality: multiple windows, menu bars, keyboard-first workflows, cursor precision, and the ability to run many apps simultaneously. A Mac app is not an iPad app scaled up — it's a fundamentally different interaction model.

### macOS vs. iOS Design Differences

| Aspect | iOS | macOS |
|--------|-----|-------|
| **Primary input** | Touch (finger, Apple Pencil) | Mouse/trackpad cursor + keyboard |
| **Window model** | Full-screen single window | Multiple resizable windows |
| **Navigation** | Tab bar / navigation stack | Menu bar + sidebar + toolbar |
| **Hover states** | None (no cursor) | Required for all interactive elements |
| **Density** | Spacious (44pt targets) | Compact (controls can be smaller, ~22pt) |
| **Menu bar** | Absent | Central to app navigation and commands |
| **Contextual menus** | Long press | Right-click / Control-click |
| **Keyboard shortcuts** | Optional | Expected and documented |

### The Menu Bar

The menu bar is the primary command interface for Mac apps. Apple defines a standard menu structure that all apps must follow:

**Required menus (in order):**
1. **App menu** — Contains the app name, About dialog, Preferences/Settings, Services, Hide, Quit.
2. **File** — New, Open, Close, Save, Print (where applicable).
3. **Edit** — Undo, Redo, Cut, Copy, Paste, Select All, Find.
4. **View** — Show/hide UI elements, zoom, full screen.
5. **Window** — Minimize, Zoom, Tile, Merge All Windows, Bring All to Front.
6. **Help** — Search, app-specific help articles.

**Rules:**
- Every destructive action must have a confirmation dialog.
- Every menu item that opens a dialog must end with an ellipsis (…).
- Keyboard shortcuts must not conflict with system-reserved shortcuts.
- Menu items must be disabled (grayed out), never hidden, when unavailable.
- Never remove standard Apple menu items (Cut, Copy, Paste, Undo, Redo, etc.).

### Mac Windows

**Standard window chrome:** Title bar at top, toolbar below title bar, optional sidebar, content area, optional bottom bar.

**Window types:**
- **Document windows** — Resizable, have a title (filename or app name), support full-screen mode.
- **Panel windows** — Utility panels that float above document windows; used for inspectors, palettes, etc.
- **Alert windows** — Block interaction with a single parent window; never block all app windows.
- **Sheet windows** — Attached to a parent window's title bar; represent actions scoped to that window.
- **Popovers** — Attached to a specific control; appear and dismiss without blocking other windows.

**Window sizing rules:**
- Always define a minimum window size that displays the app's core content usably.
- Always remember and restore window position and size between launches.
- Support window tiling (macOS 15+) by respecting size constraints accurately.

### Toolbars

Mac toolbars live below the title bar (or merged with it in unified-style windows). They contain frequently used actions, a flexible space, and an optional search field.

- Allow users to customize toolbars (right-click → Customize Toolbar…).
- Show both icon and label in the default configuration.
- Use SF Symbols for toolbar icons; they scale automatically with toolbar size.
- Provide keyboard shortcuts for every toolbar action.

### macOS Accessibility

- Full keyboard navigation across all interactive elements (Tab, Space, Return, Arrow keys).
- VoiceOver support for all UI elements.
- Scroll bars should appear in "Always" mode for users who prefer them visible.
- Support Zoom (System Preferences > Accessibility > Zoom).
- Respect increased contrast setting.
- Never use color alone to convey state.

---

## 6. Designing for watchOS

### Watch Context

Apple Watch interactions are brief — typically under 30 seconds. The screen is small (up to 49mm case), the input methods are limited (tap, swipe, Digital Crown, double-tap), and the app often displays glanceable information rather than supporting deep interaction.

### Core watchOS Design Principles

- **Keep it short.** Present a single, immediately useful piece of information per screen.
- **Design for the wrist.** Information comes to the user; the user doesn't navigate to it.
- **Prioritize complications.** The Watch face is the primary UI surface. Invest heavily in complication design.
- **Conserve energy.** Background tasks and animations drain the battery; use them sparingly.

### watchOS Navigation Patterns

- **Single-page apps:** Most appropriate for utility apps showing one data point.
- **Page-based apps:** Horizontal swipe between a small set of related views (≤5 pages).
- **Hierarchical apps:** Drill-down navigation via vertical scroll lists. Avoid going more than 2 levels deep.

### Digital Crown

- Use Digital Crown for scrolling long content vertically.
- Use it for value adjustment in pickers, volume sliders, and workout pace controls.
- Never require Digital Crown interaction for critical actions — not all users can rotate it easily.

### Complications

Complications appear on watch faces and provide glanceable data. They come in multiple families (corner, circular, rectangular, etc.). Each must:
- Display the most relevant, up-to-date piece of information.
- Update frequently enough to remain accurate but conserve battery.
- Tap to deep-link into the relevant section of your app.

---

## 7. Designing for tvOS

### TV Context

tvOS interfaces are viewed from ~3 meters (10 feet) away on large screens, navigated with a remote control using a focus-based model. All interaction is driven by focus — the selected element is highlighted and keyboard/pointer input drives selection changes.

### Focus Model

- Every interactive element must be focusable.
- Focus must always be visible — never invisible or ambiguous.
- The focused element is typically scaled up slightly with a subtle shadow.
- Focus should move predictably in all four directions (up, down, left, right).
- When a view appears, set focus to the most logical default element (not necessarily the first one).

### Layout for the Living Room

- **Content safety zones:** Keep all content within a safe area 60pt from each edge. The overscan area varies by TV hardware.
- **Text size:** Body text must be readable from 3m. Minimum 29pt for any text that users must read at a distance.
- **Contrast:** High-contrast text over dark backgrounds performs best in variable living room lighting.
- **Parallax effect:** App icons on tvOS support a layered parallax effect — design icons in separate foreground / background / shadow layers.

### tvOS Navigation

- Tab bars appear at the top of the screen (not the bottom as on iOS).
- Use the Siri Remote's swipe pad for fluid, direct navigation in content-browsing views.
- Support the Menu button on the remote for going back / returning home.
- Long press on the remote's touch pad reveals context menus where appropriate.

---

## 8. Designing for visionOS

### Spatial Computing Context

visionOS powers Apple Vision Pro, a spatial computing environment where windows, volumes, and spaces float in 3D around the user. Input is driven by eyes (look), hands (pinch), and voice. There is no mouse, no trackpad, no touchscreen.

### Key visionOS Concepts

| Concept | Description |
|---------|-------------|
| **Window** | 2D floating panel in space; same width/height as iOS but at variable depth |
| **Volume** | 3D bounding box for 3D content (games, objects, AR models) |
| **Full Space** | Immersive environment replacing the passthrough view (e.g., panoramic experiences) |
| **Shared Space** | Default mixed reality mode — user sees their surroundings plus app windows |
| **Ornaments** | UI bars (tab bars, toolbars) that float beside, not inside, a window |

### visionOS Input

- **Eyes:** Looking at an element highlights it (equivalent of hover on macOS).
- **Pinch:** Tap or click the highlighted element.
- **Drag:** Look at element, pinch, then move hand while pinching.
- **Voice:** Siri and dictation are primary text input methods.
- **Keyboard:** Physical Magic Keyboard supported; on-screen keyboard available.
- **Game controllers:** Supported for game apps.

### visionOS Design Rules

- Never place critical content directly behind the user's head or outside their comfortable field of view.
- Default window placement should be in front of the user at a comfortable arm's-length-equivalent depth.
- Use depth hierarchy meaningfully: important content forward, supporting content back.
- Translucent glass panels (Liquid Glass) are the primary background material — avoid solid opaque backgrounds.
- Always support the Digital Crown as an escape / brightness / immersion adjuster.
- Eye tracking makes hover states meaningful; use them to indicate interactivity.

---

## 9. Foundations — App Icons

### The Role of the App Icon

An app icon is often the first impression users have of your app. It must communicate your app's purpose and personality instantly, at sizes ranging from 16×16pt (Mac dock mini) to 1024×1024pt (App Store marketing).

### Icon Design Principles

- **Single clear concept.** Don't try to communicate everything your app does in one icon. Pick the most iconic element.
- **Simple, bold shapes.** Details that are visible at 512pt become indistinguishable blobs at 60pt. Design for small sizes and let detail emerge at large sizes, not the reverse.
- **Avoid text.** Words in icons are unreadable at small sizes and fail localization.
- **Avoid photos.** Photos rarely simplify cleanly to icon sizes. Use illustrated or abstracted equivalents.
- **Use the platform shape.** Never draw a squircle shape yourself — iOS clips icons to the squircle mask automatically.

### Required Icon Appearances (iOS 18+)

iOS 18 introduced user-selectable icon appearances. Apps must supply icons in three variants:

| Variant | When used |
|---------|-----------|
| **Light** | Default light appearance; also used as fallback |
| **Dark** | Used when user enables Dark Mode on the Home Screen |
| **Tinted** | Used when user applies a custom monochrome tint to the Home Screen |

All three variants must maintain equal visual quality and recognizability. The dark variant should invert or complement the light variant — avoid simply darkening the light version.

### Icon Sizes

**iOS / iPadOS:**

| Use | Size |
|-----|------|
| iPhone Home Screen | 60×60pt (@2x or @3x) |
| iPad Home Screen | 76×76pt (@2x) |
| iPad Pro Home Screen | 83.5×83.5pt (@2x) |
| App Store | 1024×1024pt (@1x) |
| Spotlight | 40×40pt (@2x, @3x) |
| Settings | 29×29pt (@2x, @3x) |
| Notification | 20×20pt (@2x, @3x) |

**macOS:**

| Use | Size |
|-----|------|
| Dock (standard) | 128×128pt |
| Dock (large) | 256×256pt |
| App Store | 1024×1024pt |
| Finder | 32×32pt to 512×512pt |

### macOS App Icon Style

macOS icons sit on a virtual surface with a light source from the upper-left. They should convey a physical object or implement. Use realistic-looking highlights, shadows, and depth — macOS icon aesthetics are less flat than iOS.

The standard macOS icon uses a rounded-square canvas with a slight 3D perspective tilt (approximately 10° toward the viewer).

### Icon Composer (Liquid Glass Era)

Beginning with the 2025 OS cycle, Apple introduced **Icon Composer** — a tool to create layered Liquid Glass icons from a single design that automatically adapts for iPhone, iPad, Mac, and Apple Watch.

- Icons can have multiple compositing layers (foreground illustration, glass plate, shadow, background).
- The glass plate refracts the underlying wallpaper, creating a live adaptive look.
- Export format: `.iconcomposition` package rather than flat PNG stack.

### Do's and Don'ts

| Do | Don't |
|----|-------|
| Design on a grid with centered composition | Place important content in corners (they get clipped) |
| Test at all required sizes | Design only at 1024pt and assume it scales down |
| Supply all three appearance variants | Submit only a light icon and hope for the best |
| Use Apple's squircle grid template | Draw a custom rounded-rect border |
| Use consistent border radius within your icon's internal shapes | Mix wildly different border radii in one icon |

---

## 10. Foundations — Color

### Color Philosophy

Color communicates meaning, establishes hierarchy, signals interactivity, and expresses brand identity. It must work across both Light and Dark modes, honor accessibility contrast requirements, and adapt to system-defined tinting.

### Semantic Colors

Always use semantic, system-provided colors rather than hard-coded hex values. Semantic colors automatically adapt to:
- Light / Dark mode
- High contrast mode
- Accessibility color blindness filters

**System semantic colors (iOS / iPadOS):**

| Token | Purpose |
|-------|---------|
| `systemBackground` | Primary content background (white / near-black) |
| `secondarySystemBackground` | Secondary grouped content (light gray / dark gray) |
| `tertiarySystemBackground` | Tertiary level background |
| `label` | Primary text color (black / white) |
| `secondaryLabel` | Secondary, supporting text |
| `tertiaryLabel` | Placeholder text |
| `quaternaryLabel` | Disabled text |
| `systemBlue` | Default tint / interactive actions |
| `systemRed` | Destructive actions, errors |
| `systemGreen` | Confirmations, success states |
| `systemOrange` | Warnings, cautions |
| `systemYellow` | Secondary warnings |
| `systemPurple` | Brand accent (use sparingly) |
| `systemGray` | Inactive / disabled states |
| `separator` | Dividers between list rows |
| `opaqueSeparator` | Visible dividers over media content |

### App Accent Color

Define one accent color for your app — used for interactive elements (buttons, links, toggle thumbs). The system uses this as the tint color throughout the app.

- Keep the accent color consistent throughout the entire app.
- The accent color should work on both white and black backgrounds.
- Provide a single semantic accent color; the system handles light/dark adaptation.
- iOS 18+ allows users to override app accent colors with their system tint — your UI must remain functional and legible under any tint.

### Color Contrast Requirements

Insufficient contrast makes text and interface elements difficult or impossible to read for users with low vision or in bright sunlight.

| Text type | Minimum contrast ratio | Enhanced (AA+) ratio |
|-----------|----------------------|---------------------|
| Normal text (< 18pt or < 14pt bold) | 4.5 : 1 | 7 : 1 |
| Large text (≥ 18pt or ≥ 14pt bold) | 3 : 1 | 4.5 : 1 |
| UI components and graphical objects | 3 : 1 | — |
| Decorative elements | No requirement | — |

**Tools for checking contrast:**
- Xcode's Accessibility Inspector (run on simulator or device)
- Apple's Color Contrast Calculator
- Figma plugins: Stark, A11y

### Dark Mode

- Never turn off Dark Mode support. Every app must support both Light and Dark appearances.
- Use semantic colors exclusively — they handle both appearances automatically.
- Test all screens in both appearances before submitting.
- Pay special attention to: shadows (lighter in dark mode), images with white backgrounds (swap for transparent PNG), hard-coded color values in web views.

**Common Dark Mode mistakes:**
- Using a white background image that looks like a glowing box in dark mode.
- Hard-coding `#000000` text on a light background — it disappears in dark mode.
- Shadows that are invisible because they match the dark background.
- Charts and graphs where color distinctions collapse in dark mode.

### Color Independence

Never use color as the *only* visual differentiator. Always pair color with a second cue:

| Color use | Required secondary cue |
|-----------|----------------------|
| Error state (red text) | Error icon + descriptive message |
| Selected state (blue highlight) | Checkmark or shape indicator |
| Success (green) | Checkmark icon or "Success" label |
| Warning (yellow/orange) | Warning icon (⚠) |
| Disabled (gray) | Dimmed opacity + non-interactive behavior |

Users with color blindness (affects ~8% of males) cannot distinguish red/green, and some cannot distinguish blue/yellow.

### Vibrancy & Dynamic Color (Liquid Glass era)

With the introduction of Liquid Glass materials in 2025, colors displayed within glass panels exhibit **vibrancy** — they adapt based on the content rendered behind the material. This means:

- Colors within glass panels will appear brighter or more saturated than their defined values.
- Text placed over glass should use vibrancy-aware label colors (`.label`, `.secondaryLabel`, etc.) — not fixed hex colors.
- Dark-tinted backgrounds behind glass shift color presentation differently than light backgrounds.
- Test UI in various contexts: over photography, over bright colors, over dark content.

---

## 11. Foundations — Layout

### Layout Philosophy

A good layout reveals hierarchy, guides the eye, reflects the importance of content, and adapts naturally to different screen sizes and orientations.

### The 8-Point Grid

All Apple platforms use a base-8 spacing grid:
- **Base unit:** 8 points
- **Half unit:** 4 points (fine adjustments only)
- All margins, padding, gaps, and sizes should be multiples of 8.

Standard spacing values in use: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64pt.

### Content Margins

| Platform | Standard horizontal margin |
|----------|--------------------------|
| iPhone (small) | 16pt |
| iPhone (large) | 20pt |
| iPad | 20–40pt (adaptive) |
| Mac | 20pt within content area |

Use `readableContentGuide` for text-heavy content — it constrains line length to ~75 characters on wide screens, significantly improving readability.

### Layout Guides & Safe Areas

- **Safe area insets** protect content from being hidden by notches, Dynamic Islands, Home Indicators, navigation bars, and tab bars.
- **Layout margins** provide the standard content padding from edge of screen.
- **Readable content guide** limits text column width for legibility.
- **Keyboard avoidance** is required: when the software keyboard appears, content must scroll up to remain visible.

### Adaptive Layouts

Apple's Size Classes categorize window widths into Compact and Regular:

| Size class | Devices |
|-----------|---------|
| **Compact width** | iPhone portrait, iPhone landscape (small), iPad in slide-over |
| **Regular width** | iPad, Mac, iPhone landscape (large) |

Design to work in both:
- In compact: single column, tab bar navigation, full-width cells.
- In regular: multi-column, sidebar navigation, detail panels.

Use `@Environment(\.horizontalSizeClass)` in SwiftUI or `traitCollection.horizontalSizeClass` in UIKit.

### Z-Axis Hierarchy (Stacking Layers)

Apple's UI layers from back to front:
1. Wallpaper / background
2. App content
3. App navigation (sidebars, tab bars with glass)
4. System overlays (notification banners, Dynamic Island)
5. Modal sheets and alerts
6. Spotlight / Control Center (system-owned layers)

Never draw UI elements in the system layers. Respect `zIndex` and modal presentation hierarchies to avoid visual conflicts.

### Dynamic Type Layout Adaptation

Text size changes affect layout:
- Avoid fixed-height containers for text content.
- Allow text to wrap rather than truncate at larger text sizes.
- Test layouts at AX5 (the largest accessibility text size) — typical text size is ~40pt at this setting.
- Icon + label combinations should allow label to wrap or icon to shift vertically.
- Tables and lists must expand row height for wrapped text.

### Grid & Collection Layouts

- **Grid columns:** Use `UICollectionViewCompositionalLayout` or SwiftUI `LazyVGrid` with adaptive column widths — do not hard-code column counts.
- **Card grids:** Minimum card width ≈ 120pt on iPhone; 160pt on iPad.
- **Masonry layouts:** Supported in `UICollectionView` with custom layout; visually interesting but can confuse reading order for VoiceOver.

---

## 12. Foundations — Materials & Liquid Glass

### What Are Materials?

Materials are visual treatments applied to layers and controls that allow the underlying content to be partially visible through translucency, blur, and vibrancy. They create a sense of depth and help users maintain context about where they are in the app.

### Standard System Materials (pre-Liquid Glass)

These continue to be available and are appropriate for most UI contexts:

| Material | Description | Use case |
|----------|-------------|----------|
| `.ultraThickMaterial` | Almost opaque, heavy blur | Sheets over content |
| `.thickMaterial` | Dense blur, significant opacity | Navigation bars |
| `.regularMaterial` | Standard blur, moderate opacity | Sidebars, panels |
| `.thinMaterial` | Light blur, mostly transparent | Subtle overlays |
| `.ultraThinMaterial` | Barely visible blur | Minimal overlays, top layers |

Materials adapt automatically to Light / Dark mode and to the system's Reduce Transparency accessibility setting (becomes solid when transparency is reduced).

### Liquid Glass — Apple's 2025 Design Language

Liquid Glass is the most significant visual redesign since iOS 7 (2013). Introduced across all Apple platforms at WWDC 2025, it redefines how interface elements interact with the content behind them.

**What Liquid Glass is:**
A dynamic "digital meta-material" that combines:
- Real-time background blur
- Depth-based refraction (the glass bends light based on its shape)
- Specular highlights that respond to the device's real-world orientation (detected via gyroscope)
- Adaptive color that samples and responds to underlying content
- Physical material behavior: glass "fills" with content color rather than being neutral gray

**Core layers of Liquid Glass:**
1. **Highlights layer** — Specular reflections from a virtual light source positioned upper-left. Moves in response to device tilt.
2. **Blur layer** — Progressive Gaussian-style blur of background content.
3. **Refraction layer** — Distorts the view of background content at the glass boundary, like real glass edges.
4. **Tint layer** — Samples the average color of content behind the glass and applies a very subtle tint.
5. **Content layer** — Text, icons, and UI controls sit above all glass effects.

**Key behaviors:**
- Small elements (icons, symbols, glyphs) flip from light to dark based on contrast with the glass background.
- Larger panels (menus, sidebars) adapt color but do not invert.
- The material adapts to the brightness of the scene — in dark environments, glass appears darker.

### Liquid Glass Accessibility Modifiers

Liquid Glass includes three built-in accessibility accommodations that activate automatically when users enable them system-wide:

| System setting | Effect on Liquid Glass |
|---------------|----------------------|
| **Reduce Transparency** | Glass becomes frostier / more opaque, obscuring background content more |
| **Increase Contrast** | Elements become predominantly black or white with contrasting borders |
| **Reduce Motion** | Elastic / spring animations are disabled; specular movement is reduced |

These are free — you get them automatically when using the system's Liquid Glass material APIs.

### When to Use Liquid Glass

| Appropriate | Avoid |
|------------|-------|
| Navigation bars, tab bars, toolbars | Body content areas (readability suffers) |
| Sidebars, inspector panels | Full-screen backgrounds |
| Context menus, popovers, search bars | Buttons containing secondary text |
| Control Center tiles, Dynamic Island | Cards within scrollable lists |
| Modal sheet headers | Areas over complex, busy photography |

**Depth rule:** Use ≤ 20 depth value for UI controls; deeper values increase refraction but harm readability. Keep frost value between 10–25 for accessible translucency.

### Implementing Materials in SwiftUI

```swift
// Standard material
.background(.regularMaterial)

// Liquid Glass (iOS 26+ / macOS 16+)
.glassEffect(.regular)

// Custom glass with configuration
.glassEffect(.regular.interactive())
```

### Implementing Materials in UIKit

```swift
// Visual effect view (standard material)
let blurEffect = UIBlurEffect(style: .systemMaterial)
let effectView = UIVisualEffectView(effect: blurEffect)

// Vibrancy
let vibrancyEffect = UIVibrancyEffect(blurEffect: blurEffect, style: .label)
```

### Performance Considerations

- Liquid Glass requires Apple silicon (A12 Bionic and later, M1 and later) for full 60fps rendering.
- Older devices receive an automatic frosted fallback that maintains legibility without the full optical effects.
- Stacking multiple glass layers degrades performance. Never nest glass inside glass.
- Avoid animating large glass-covered surfaces continuously — use animation only on state changes.

---

## 13. Foundations — Typography

### San Francisco — Apple's System Typeface

Apple's platforms use the **San Francisco (SF)** typeface family, designed specifically for screen legibility. Never need to bundle it — it's available through system APIs.

| Font | Use |
|------|-----|
| **SF Pro** | iOS, iPadOS, macOS — primary UI and body text |
| **SF Pro Text** | Body text at ≤ 19pt — optimized for small sizes with wider letter spacing |
| **SF Pro Display** | Headlines at ≥ 20pt — tighter, more refined stroke for larger type |
| **SF Pro Rounded** | Friendly, rounded variant; use in apps with a softer personality |
| **SF Compact** | watchOS — narrower letterforms for watch display constraints |
| **SF Mono** | Code, terminal, monospaced UI; use for code, technical values, prices |
| **New York (NY)** | Serif typeface for editorial, reading, and content-heavy contexts |

### Text Styles (Dynamic Type)

Apple defines standard named text styles. Always use these instead of arbitrary font sizes — they automatically participate in Dynamic Type scaling.

| Style | Default size | Weight | Usage |
|-------|-------------|--------|-------|
| `largeTitle` | 34pt | Regular | Screen-level titles (e.g., top of a content list) |
| `title1` | 28pt | Regular | Section headers |
| `title2` | 22pt | Regular | Sub-section headers |
| `title3` | 20pt | Regular | Tertiary headers |
| `headline` | 17pt | Semibold | Prominent labels, row titles |
| `body` | 17pt | Regular | Primary body text |
| `callout` | 16pt | Regular | Supporting body text, callout regions |
| `subheadline` | 15pt | Regular | Supporting captions under headlines |
| `footnote` | 13pt | Regular | Metadata, footnotes, secondary captions |
| `caption1` | 12pt | Regular | Image captions, minimal supplementary text |
| `caption2` | 11pt | Regular | Smallest readable text |

### Dynamic Type

Dynamic Type allows users to choose their preferred reading size globally. Your app must honor this preference.

**Dynamic Type size range:**
- xSmall → Small → Medium → Large (default) → XLarge → XXLarge → XXXLarge
- Accessibility sizes: AX1 → AX2 → AX3 → AX4 → AX5 (up to ~3× default size)

**Implementation requirements:**
- Use only `.font(.body)` / `UIFont.preferredFont(forTextStyle: .body)` — never `.font(.system(size: 17))`.
- Never truncate text when space is tight at larger sizes — allow wrapping.
- Allow all text containers to grow vertically as text size increases.
- Test at AX5 (largest accessibility size) before every release.

**Bad practice:**
```swift
// WRONG — breaks Dynamic Type
Text("Hello").font(.system(size: 17))

// CORRECT — scales with user preference
Text("Hello").font(.body)
```

### Optical Sizing

SF Pro automatically switches between Text and Display optical variants at 20pt:
- ≤ 19pt → SF Pro Text (wider tracking, heavier strokes)
- ≥ 20pt → SF Pro Display (tighter tracking, refined strokes)

The system handles this automatically in UIKit and SwiftUI when you use `.preferredFont(forTextStyle:)` or `.font(.body)`. In Figma mockups, select the variant manually.

### Typography Rules

**Legibility minimums:**
- Body text: minimum 17pt at default Dynamic Type size
- Caption text: minimum 12pt (allow to be bypassed at larger Dynamic Type)
- Line spacing: minimum 1.2× line height for body text

**Hierarchy rules:**
- Use weight (regular vs. semibold vs. bold) to differentiate hierarchy — avoid using more than 2 typeface families.
- Size differences of less than 2pt do not create perceivable hierarchy.
- Color can reinforce hierarchy (label vs. secondaryLabel) but never replace size/weight hierarchy.

**Line length:**
- Optimal: 45–75 characters per line
- Maximum: 90 characters (beyond this, reading speed drops)
- Use `readableContentGuide` to automatically constrain long text to the readable range.

**Alignment:**
- Use left alignment (or leading alignment for RTL support) for body text.
- Center alignment: appropriate for titles, short labels, empty state messages.
- Right/trailing alignment: appropriate for numeric values in tables.
- Never justify text — it creates uneven gaps that harm readability on narrow screens.

### Kerning and Tracking

- Do not apply custom tracking to Apple's system fonts — SF Pro already has optimized metrics.
- Applying tight tracking (negative letter-spacing) to small text is a common accessibility failure.
- If you must apply tracking to display text, test in accessibility sizes where text is larger — tight tracking creates awkward collisions.

### Right-to-Left (RTL) Language Support

- Use SwiftUI `leading`/`trailing` instead of `left`/`right` throughout.
- Images that convey directionality (arrows, back indicators) must flip automatically.
- Use `.flipsForRightToLeftLayoutDirection` on asymmetric SF Symbols.
- Test in Arabic, Hebrew, or Urdu to verify layout mirrors correctly.

---

## 14. Patterns — Menus

### Types of Menus

**Pull-down menus:** Attached to a button; reveal a list of commands. The button's label reflects the current action, not the current state. Selecting an item performs an action.

**Pop-up buttons (macOS) / Pop-up menus (iOS):** Reveal a list of options. The button's label reflects the *current selection* (not an action). Selecting an item changes a setting or value.

**Context menus (iOS):** Appear via long press / Haptic Touch on an element. Provide secondary actions relevant to the touched item. Shown with a contextual preview of the item.

**Right-click / control-click menus (macOS):** Standard right-click on any interactive or content element. Provide object-specific actions without leaving the current view.

### Menu Design Rules

- **Group related items.** Use separator lines to group logically related commands (maximum 5–6 items per group).
- **Alphabetize within groups** where order is otherwise arbitrary.
- **Disable, don't hide** unavailable items — hidden items disorient users.
- **Destructive items go last** in their group, styled in red.
- **Ellipsis (…) suffix** on any item that opens a dialog or requires further input.
- **Keyboard shortcut** in the trailing column for every menu item that has one (Mac).
- **Submenus:** Use sparingly and only 1 level deep. More levels indicate IA problems.
- **Maximum length:** If a menu exceeds ~15 items, reconsider the IA — users shouldn't scroll long menus.

### Context Menu Previews (iOS)

When a user long-presses on an item that has a context menu, iOS shows:
1. A live preview of the item (cropped, lifted out with blur behind it).
2. A menu of actions above or below the preview.

Design guidelines:
- The preview should show enough context for the user to confirm they pressed the right item.
- Keep the menu to ≤ 5 items; use submenus for destructive or infrequent options.
- Always place the most destructive action at the bottom, styled red.
- Primary tap (no menu) should still work normally — context menu is supplemental.

### macOS Contextual Menu Best Practices

- Always include Cut, Copy, Paste (where relevant) in right-click menus on editable content.
- Share menu item appears in right-click menus on shareable content.
- Services submenu appears automatically — don't block it.
- "Open in…" for content items that can be opened in other apps.

---

## 15. Patterns — Scroll Views

### Scroll View Purpose

Scroll views reveal content that doesn't fit within the visible bounds. They're fundamental to iOS design because mobile screens are small relative to the content they must display.

### Scroll Direction

- **Vertical scrolling** — Default and strongly preferred for content lists, feeds, article views.
- **Horizontal scrolling** — Appropriate for media carousels, calendar week views, page pagers.
- **Both directions simultaneously** — Avoid unless the content genuinely benefits (spreadsheets, maps, large images). Diagonal scrolling is disorienting.

### Scroll View Behaviors

- **Bounce:** Content bounces at the edges, confirming there's no more content. Disable only in rare, justified cases (e.g., game views where bouncing conflicts with gameplay).
- **Scroll indicator:** Thin vertical/horizontal indicator appears during scrolling. Provide `scrollIndicatorInsets` to avoid overlap with fixed UI elements.
- **Paging:** Snaps to full-page increments. Appropriate for onboarding screens, photo carousels, horizontal page browsers.
- **Content insets:** Use `contentInset` to offset content from the scroll view edges when fixed UI elements (headers, tabs) overlap the scroll area.

### Sticky Headers

- **Section headers in lists** stick to the top of the scroll view as their section scrolls into view. Don't disable this — it helps users understand their location.
- Custom sticky headers above scroll views should use the navigation bar or use `safeAreaInset` to push content down.

### Parallax & Stretch Effects

- The system scroll view supports a parallax effect for large header images that scroll slower than the content below — creating a sense of depth.
- Use `UITableView.tableHeaderView` with parallax-style custom implementations for editorial headers.
- Don't overuse parallax — it can increase motion sickness risk. Respect `UIAccessibility.isReduceMotionEnabled`.

### Pull-to-Refresh

- iOS has a native `UIRefreshControl` — always use it for content that can be updated.
- Place the refresh control at the top of the scroll view.
- Never require pull-to-refresh as the only way to get updated content — also refresh automatically on return to the foreground.
- Show a success or failure state before hiding the refresh indicator.

### Scroll Position Memory

- Remember and restore scroll position when a user navigates away and returns.
- Tab switching should restore the last scroll position in each tab.
- Returning from a pushed view (back navigation) should restore the originating list's scroll position.

---

## 16. Patterns — Search Fields

### When to Provide Search

Provide a search field when your content has more items than can be scanned at a glance (~15+ items), or when users have a specific target item in mind.

### Search Field Placement

**iOS:**
- Place search using `UISearchController` embedded in the navigation bar — it appears when the user scrolls up or taps "Search" in the navigation area.
- On iPad and Mac, search fields can be persistently visible in the toolbar.
- Never place search fields in the middle of a content view.

**macOS:**
- Place the search field in the toolbar (trailing position is conventional).
- On macOS 13+, use `searchable()` modifier in SwiftUI — it places search in the correct toolbar position automatically.

### Search Behavior Requirements

- **Immediate results:** Update results as the user types (live filtering). Don't require a "Search" button press unless the search is computationally expensive (e.g., server-side search).
- **Suggestions:** Show recently searched terms and type-ahead suggestions as the user types. Suggestions reduce keystrokes and help users discover terminology.
- **Scopes:** If content can be filtered by category, provide scope buttons below the search field. Keep scope labels short (1–2 words).
- **Empty query state:** Show the full, unfiltered content list when the search field is empty (not empty state UI).
- **No results state:** When a search returns zero results, display a helpful no-results view with the searched term repeated, a friendly message, and (if applicable) a suggestion to try different terms.
- **Cancel:** Always provide a Cancel button on iOS that dismisses the keyboard, clears the field, and returns to the default state.

### Search Field Accessibility

- The search field must have `accessibilityLabel = "Search"` (or localized equivalent).
- Screen readers should announce the number of results found.
- Voice input (microphone icon) should be visible and accessible.
- Auto-correction should be appropriate to the context — disable for technical input (usernames, codes).

---

## 17. Patterns — Sidebars

### What Is a Sidebar?

A sidebar is a persistent or collapsible panel on the leading edge of the screen that shows the top-level navigation destinations of an app. It's the Mac and iPad equivalent of a tab bar on iPhone.

### When to Use a Sidebar

| Platform | Use sidebar when... |
|----------|-------------------|
| **iPad** | Available horizontal space is Regular width (not compact) |
| **Mac** | Always — sidebar is the standard Mac navigation pattern |
| **iPhone** | Never — use a tab bar instead |

On iPad, apps should adapt between sidebar and tab bar based on available width:
- Regular width → sidebar (in a split view)
- Compact width → tab bar (collapsed phone-like layout)

### Sidebar Structure

A sidebar typically contains:
- **App-level sections** — top-level destinations that mirror what a tab bar would show on iPhone.
- **Smart lists** — dynamic, filtered views (e.g., "Today", "Starred", "Recent").
- **User-created items** — folders, projects, labels the user has created.
- **Disclosure groups** — collapsible sub-lists within a section.

### Sidebar Design Rules

- **Highlight the selected row** with the system selection style.
- **Row height:** Use compact style (30–36pt rows) on macOS; standard style (44pt+) on iPad.
- **Icons:** Each top-level item should have an SF Symbol icon at a consistent size.
- **Labels:** Keep short — 1–3 words maximum.
- **Badges:** Unread counts appear as small pills on the trailing edge of rows.
- **Drag and drop:** Support reordering of user-created items via drag and drop.
- **Contextual actions:** Right-click (Mac) / long-press (iPad) on sidebar rows should reveal relevant context menus (Rename, Delete, Duplicate, etc.).

### Split View with Sidebar

The canonical sidebar layout is a three-column split view:
1. **Column 1 (sidebar):** Top-level navigation
2. **Column 2 (content list):** Items within the selected section
3. **Column 3 (detail view):** The selected item's detail

In a two-column layout: sidebar + detail only, without the intermediate list.

Use `NavigationSplitView` in SwiftUI / `UISplitViewController` in UIKit to implement adaptive split views.

### Collapsing Behavior

- On iPad: sidebar can be collapsed via a toggle button in the toolbar.
- In compact width: sidebar is replaced by a tab bar, and the content list/detail stack.
- On Mac: sidebar can be toggled via View > Toggle Sidebar (⌃⌘S is the standard keyboard shortcut).
- Remember the collapsed/expanded state between launches.

---

## 18. Patterns — Siri & Apple Intelligence

### Siri Integration

Siri allows users to perform app actions using natural language voice or text commands — from the lock screen, via Siri Suggestions, and through Shortcuts.

### SiriKit Intent Domains

Your app can donate intents to Siri for specific domains:

| Domain | Examples |
|--------|---------|
| **Messaging** | Send message, read messages |
| **Calls** | Start audio call, start video call |
| **Payments** | Send payment, request payment |
| **Lists & Notes** | Add to-do, create note, search notes |
| **Media** | Play music, show movies |
| **Workouts** | Start workout, end workout |
| **Navigation** | Get directions, show traffic |
| **Restaurant reservations** | Make reservation |
| **Photos** | Search photos by content |
| **Custom App Intents** | Any app-specific action |

### App Intents Framework (iOS 16+)

The App Intents framework is the modern replacement for SiriKit. It enables:
- Siri voice commands for your app's actions
- Spotlight integration
- Shortcuts app actions
- Action button assignment (iPhone 15 Pro+)
- Control Center controls (iOS 18+)

Define intents as Swift types conforming to `AppIntent`:
```swift
struct ReorderFavoriteIntent: AppIntent {
    static var title: LocalizedStringResource = "Reorder My Favorite"
    
    @Parameter(title: "Item") var item: ItemEntity
    
    func perform() async throws -> some IntentResult {
        // perform the action
        return .result()
    }
}
```

### Siri Design Guidelines

- Donate relevant intents at the right moment — when a user completes an action is the ideal time to donate it.
- Use natural, conversational language for intent parameter prompts.
- Provide confirmation dialogs for irreversible actions (sending payments, deleting items).
- Support cancellation at any point in a multi-step Siri flow.
- Localize all Siri responses — never respond in a fixed language.
- Ensure Siri responses are complete without requiring the user to open the app.

### Apple Intelligence Integration

Apple Intelligence (iOS 18.1+) introduces system-level AI that apps can integrate with:

- **Writing Tools:** Available in all text fields automatically. Users can rewrite, proofread, and summarize selected text.
- **Image Playground:** Generate images inline in supported fields.
- **Smart Replies:** In messaging apps, Apple Intelligence suggests relevant quick replies.
- **Priority notifications:** The system surfaces your app's most relevant notifications automatically.
- **Semantic search:** Your app's content can be included in system-level semantic search.

**Design guidance for AI features:**
- Never present AI-generated content as definitive fact.
- Provide an easy way for users to verify, edit, or reject AI suggestions.
- Show an AI indicator (sparkle icon) next to AI-generated content.
- Offer a way to opt out of AI processing for sensitive content.

---

## 19. Patterns — Snippets

### What Are Snippets?

Snippets are small, focused, ephemeral UI surfaces that display concise information from your app within Siri results, Spotlight, and Apple Intelligence responses — without requiring the user to launch your app.

### Snippet Design Principles

- **Glanceable first.** The most critical information must be immediately visible without reading. Use large type, prominent metrics, and clear visual hierarchy.
- **Self-contained.** The snippet must make sense without surrounding context. A user seeing it for the first time must understand what it represents.
- **Minimal.** Show only the single most relevant piece of information. Do not recreate your app's UI.
- **Branded but system-compatible.** Use your app's accent color but respect system typography and layout standards.
- **Tappable to expand.** Always provide a tap-to-open-app action for more detail.

### Snippet Layout

```
┌─────────────────────────────────┐
│ [App Icon] App Name         ··· │
│                                 │
│    [Primary Content]            │
│    Large, prominent metric      │
│    or key information           │
│                                 │
│ [Secondary detail]   [Action]   │
└─────────────────────────────────┘
```

- Maximum height: ~200pt
- App icon + name in the header (system-provided)
- Primary content zone: one large, clear value or image
- Optional secondary detail row at the bottom
- Optional action button (e.g., "Open", "Navigate", "Play")

### Snippet Sizing

Snippets must adapt to the container they appear in:
- **Siri results:** Variable width, compact height
- **Spotlight:** Fixed width (~320pt on iPhone), 2:1 to 3:1 aspect ratio
- **Apple Intelligence responses:** Inline, variable width

Implement using the `IntentSnippetProvider` protocol or SwiftUI views returned from `AppIntent.perform()`.

---

## 20. Patterns — Navigation

### Navigation Design Goals

Good navigation:
- Always tells users where they are.
- Always tells users where they can go.
- Never leaves users stranded without a path back.
- Never surprises users with unexpected destinations.
- Minimizes the number of steps to reach any destination.

### Navigation Patterns Summary

| Pattern | Best for | Components |
|---------|---------|------------|
| **Hierarchical** | Content with clear parent-child structure | `NavigationStack`, `UINavigationController` |
| **Tab-based (flat)** | 2–5 peer-level sections | `TabView`, `UITabBarController` |
| **Content-driven** | Page browsing, galleries | `TabView(.page)`, `UIPageViewController` |
| **Sidebar (split)** | Mac / iPad productivity apps | `NavigationSplitView`, `UISplitViewController` |
| **Modal** | Focused tasks requiring full attention | `.sheet()`, `UISheetPresentationController` |

### Navigation Anti-Patterns

- **Orphan screens:** Views with no back button, no clear path to return from.
- **Dead ends:** Completing an action drops users into a blank or irrelevant state.
- **Unpredictable navigation:** Tapping a "back" button doesn't go where users expect.
- **Modal overuse:** Wrapping routine navigation in modals instead of push transitions.
- **Deep stacks:** Navigation stacks more than 5 levels deep — reconsider the IA.
- **Lost state:** Returning from a modal clears content the user was working on.

### The Back Button

- The back button in a navigation bar must always return to the previous screen.
- Its label should show the title of the previous screen (not "Back").
- In compact widths, when the previous screen's title is long, abbreviate to "Back".
- Never intercept or disable the back button without providing an explicit alternative.
- The swipe-from-leading-edge gesture must always work in navigation stacks — never override it.

---

## 21. Patterns — Modality & Sheets

### When to Use Modal Presentation

Use a modal when:
- The task requires the user's complete, undivided attention.
- The task is discrete and self-contained (entering a new item, confirming a destructive action, signing in).
- The user needs to complete or cancel the flow before returning to the main content.

Do **not** use modals for:
- Routine navigation between app sections.
- Content browsing (use push navigation instead).
- Persistent state that the user should remain in (use a tab or sidebar instead).

### Sheet Types (iOS)

**Modal sheet (.sheet):**
- Slides up from the bottom, covering part of the screen (with detent) or the full screen.
- Background content is dimmed and non-interactive.
- Dismiss via downward drag or a Cancel/Done button.
- Use for self-contained tasks: composing a message, adding a new item, settings panels.

**Resizable sheets (detents, iOS 16+):**
- `.medium` detent: sheet covers approximately half the screen; background content remains interactive.
- `.large` detent: sheet covers nearly the full screen.
- Custom detents: any fraction of the screen height.
- Support multiple detents so users can resize the sheet by dragging the handle.

**Full-screen covers (.fullScreenCover):**
- Covers the entire screen, including the status bar.
- Use for immersive content: camera, media playback, onboarding.
- Always provide an explicit dismiss mechanism (the swipe-to-dismiss gesture is disabled for full-screen covers).

**Popovers:**
- On iPad and Mac, appear anchored to the triggering control.
- On iPhone, fall back to a sheet.
- Dismiss by tapping outside the popover.
- Maximum width: ~320pt on iPad; automatic on Mac.

### Sheet Design Rules

- Always provide a visible way to dismiss a modal (Cancel button, close button, or Done button).
- If a user has entered data in a modal, confirm before dismissing via swipe.
- Place a Cancel button on the leading side and a Done/Save/primary action on the trailing side of the navigation bar.
- Full-screen modals must include a clearly labeled close/cancel button — the swipe-to-dismiss gesture alone is not sufficient for accessibility.

---

## 22. Patterns — Onboarding

### Onboarding Philosophy

Good onboarding is fast, respectful of the user's time, and focused on value delivery — not feature showcasing. The best onboarding is the shortest possible path to the user doing their first meaningful thing in the app.

### Onboarding Rules

- **Defer permission requests.** Never request notifications, contacts, location, or camera access on the first launch screen. Ask at the contextually relevant moment within the app.
- **Skip unnecessary setup.** Don't ask for information you can infer or gather later.
- **Maximum 3–5 onboarding screens.** If you need more, reconsider what you're communicating.
- **Show, don't tell.** Demonstrate the value proposition visually; don't describe it in text paragraphs.
- **Allow skipping.** Always provide a "Skip" or "Get Started" option that bypasses remaining onboarding.
- **Never require sign-in before showing value.** Let users experience the core feature before asking for an account.

### Permission Request Best Practices

System permission dialogs (for camera, microphone, location, notifications, contacts, etc.) can only be shown once. If the user denies, you must direct them to Settings to re-enable.

Best practice for permissions:
1. Show your own "pre-permission" screen that explains the value of granting access.
2. Include a "Allow Access" button and a "Not Now" option.
3. Only after the user taps "Allow Access" — trigger the system permission dialog.
4. Handle denial gracefully with a path to Settings.

---

## 23. Patterns — Loading & Progress

### Loading States

**Skeleton screens (content placeholders):**
- Show the layout structure of the content with gray animated placeholder shapes before real content loads.
- Preferred over a spinner for content screens — users perceive skeleton screens as faster.
- Animate with a subtle shimmer effect moving left-to-right.

**Progress indicators:**
- `UIActivityIndicatorView` (spinner) — use for indeterminate, short waits (< 3 seconds).
- `UIProgressView` (progress bar) — use when duration and completion percentage are known.
- Large spinner in the center of a blank screen is the least preferred option — use skeleton screens instead.

**Empty loading vs. content loading:**
- First launch / empty state: skeleton screens with a brief text label (e.g., "Loading…").
- Subsequent loads (pull-to-refresh, pagination): show existing content while new content loads at the edges.

### Progress Indicator Rules

- Never leave users looking at a spinner without any text context for more than ~2 seconds.
- For operations > 5 seconds, show a progress bar with a percentage or step indicator.
- For operations > 30 seconds, provide a mechanism to cancel.
- After loading completes, animate content in smoothly — don't flash or snap into place.
- If loading fails, show an explicit error with a retry action.

---

## 24. Patterns — Empty States

### Purpose of Empty States

Empty states occur when a list, grid, or content area has no items to display. They're an opportunity to educate users and guide them toward their next action.

### Empty State Structure

A complete empty state includes:
1. **Illustration or icon** — Visual that communicates the context (e.g., a mailbox icon for an empty inbox).
2. **Title** — Short, clear description of the empty state (e.g., "No Messages Yet").
3. **Body text** — 1–2 sentences explaining what this area is for and what the user can do (e.g., "Messages you send and receive will appear here.").
4. **Call to action** — A button that starts the primary empty-state resolution action (e.g., "Compose Message").

### Empty State Rules

- Tailor the message to the specific context. Generic "Nothing to show" messages are unhelpful.
- For search empty states, include the searched term: "No results for 'ramadan'".
- For permission-gated content, include a button that directs the user to grant the permission.
- For network-dependent content, distinguish between empty (no items exist) and error (items couldn't load).

---

## 25. Patterns — Feedback & Haptics

### Visual Feedback

Every user action must produce a visual response. Types of visual feedback:

| Action type | Visual feedback |
|------------|----------------|
| Button tap | Highlighted (darkened) state during press |
| Toggle | Animated state change |
| Swipe to delete | Row offset + delete button reveal |
| Pull to refresh | Activity indicator |
| Form submission | Loading indicator → success/error state |
| Selection | Checkmark or highlight |

### Haptic Feedback

Haptics use the Taptic Engine (iPhone 6s and later) to provide physical confirmation of interactions.

**Notification haptics** (for outcomes):
- `.success` — task completed successfully
- `.warning` — user attention needed
- `.error` — something went wrong

**Impact haptics** (for interactions):
- `.light` — toggling switches, scrolling past boundaries
- `.medium` — completing actions, confirming navigation
- `.heavy` — significant actions, deletions

**Selection haptics:**
- `.selectionChanged` — value changes in pickers, moving through list items

**Rules for haptics:**
- Use haptics to reinforce, not replace, visual feedback.
- Never use haptics for passive, ambient, or decorative events.
- Haptics are disabled when the user's iPhone is in silent mode (for notification haptics) — always provide visual fallback.
- Never fire haptics continuously or rapidly — it's jarring and disorienting.
- Respect `CHHapticEngine` availability — always check before use.

### Sound Feedback

- Use system sounds where appropriate (keyboard clicks, camera shutter, lock sounds).
- Custom sounds must respect the system volume and mute switch.
- Never play audio without explicit user action unless the user has set the app to an audio-playing mode (e.g., a music app, alarm app).
- Provide visual equivalents for all audio feedback (for users who are deaf or hard of hearing).

---

## 26. Components — Buttons

### Button Types

**Filled button** — High-emphasis, primary action. Bold background color, white text.
```
[  Add to Cart  ]   ← filled, system blue
```

**Tinted button** — Medium emphasis. Light tinted background, colored text.
```
[  View Details  ]  ← tinted, lighter blue
```

**Gray button** — Neutral emphasis. Gray background, label text.
```
[    Cancel    ]    ← gray
```

**Plain button** — Low emphasis. Text only, no background.
```
    Learn More      ← plain, colored text
```

### Button Sizing & Placement

| Size | Height | Use |
|------|--------|-----|
| **Large** | 50pt | Primary action, full-width |
| **Medium** | 44pt | Standard action, inline |
| **Small** | 34pt | Compact contexts, toolbars |
| **Mini** | 28pt | Very compact, table accessory cells |

- Always maintain 44pt minimum tap area, even for visually smaller buttons.
- Place the primary action button in the trailing position (or at the bottom of the screen for full-width buttons).
- Do not use more than one "high emphasis" button per screen.

### Destructive Buttons

- Destructive buttons (delete, remove, disconnect) must be styled in red (`systemRed`).
- Destructive actions must require an explicit confirmation — never execute immediately on first tap.
- In action sheets and alerts, place the destructive button above the Cancel button (at the bottom of the list, in red).

### Button States

All buttons must visually represent: Normal, Pressed/Highlighted, Disabled, Focused (for focus-based navigation on tvOS/keyboard).

- Disabled buttons: reduce opacity to 50% or apply gray tint; non-interactive.
- Loading buttons: show a spinner inline in the button while the action is processing.
- Never permanently remove a button that will become available later — show it disabled.

---

## 27. Components — Tab Bars

### Tab Bar Purpose

A tab bar provides persistent access to the top-level sections of an app. It appears at the bottom of the screen on iPhone, and adapts to a sidebar or top tab strip on iPad / Mac.

### Tab Bar Rules

- **Minimum 2, maximum 5 tabs** on iPhone. If your app needs more than 5 top-level sections, reconsider the IA or use an overflow "More" tab (avoid the More tab if possible — it hides content).
- **Each tab represents a distinct destination**, not an action. Tabs are nouns, not verbs.
- **Every tab must always be accessible.** Never dynamically hide or disable tabs.
- **Active tab** is highlighted with the system tint color (and filled icon variant for SF Symbols).
- **Inactive tabs** are shown in secondary label color (gray).
- **Badges** — numeric badges (unread counts, notifications) appear in the upper-right of tab icons. Maximum displayed: 99+ (truncate larger numbers).
- Never use more than one word for a tab label.

### Tab Bar Adaptation (iOS 18+)

In iOS 18, the tab bar includes Liquid Glass material by default and can appear as a floating strip or as a sidebar on iPad. The system automatically adapts:
- iPhone → bottom tab bar
- iPad in compact → tab bar (bottom)
- iPad in regular → sidebar (leading edge)
- Mac → sidebar (via Mac Catalyst or native macOS port)

---

## 28. Components — Navigation Bars

### Navigation Bar Purpose

Navigation bars appear at the top of a view in a navigation stack. They display the current screen's title, a back button (when there's a parent screen), and optional leading/trailing action buttons.

### Navigation Bar Styles

| Style | Appearance | Use |
|-------|-----------|-----|
| **Large title** | Title in large text below the bar | Top-level screens, content lists |
| **Inline title** | Title centered in the bar | Detail / sub-level screens |
| **Hidden** | No navigation bar | Immersive media views |

Large title collapses to inline as the user scrolls down — use this transition for all top-level screens.

### Navigation Bar Button Placement

- **Leading (left) side:** Back button (system-provided), Cancel (in modals), Edit.
- **Trailing (right) side:** Primary action (Save, Done, Add, Share), context menu overflow (ellipsis button).
- Maximum: 1–2 buttons per side.
- Never place more than one text button per side. Use icon buttons for secondary actions.

### Transparent Navigation Bar

- Allow navigation bars to be transparent over full-bleed imagery (hero photos, maps).
- Navigation bars with Liquid Glass material adapt their translucency and legibility based on content underneath.
- Always ensure title text and buttons have sufficient contrast over any underlying content.

---

## 29. Components — Toolbars

### Toolbar vs. Navigation Bar

| Feature | Navigation Bar | Toolbar |
|---------|---------------|---------|
| **Position** | Top of screen | Bottom of screen (iOS) / below title bar (Mac) |
| **Content** | Title + back + 1-2 actions | Multiple action buttons |
| **Purpose** | Navigation context | Document / context-specific actions |

### iOS Toolbar

- Appears at the bottom of the screen (above the tab bar, if present).
- Contains 3–5 actions as icon buttons.
- Use for document editing actions (bold, italic, link in a text editor).
- Share button in toolbars invokes the standard system Share sheet.

### macOS Toolbar

- Appears below the title bar (or merged with it in `.unifiedToolbar` style).
- Contains icon buttons, text buttons, a flexible space, and optionally a search field.
- Allow users to customize toolbar contents (right-click → Customize Toolbar).
- Use SF Symbols consistently; prefer template rendering to allow tinting.

---

## 30. Components — Lists & Tables

### List Usage

Lists (table views on iOS / lists on macOS) display collections of items in a single-column, scrollable format. They're the most fundamental content-display component.

### List Styles

| Style | Appearance | Use |
|-------|-----------|-----|
| **Inset grouped** | Rounded-corner card sections with margin | Modern iOS lists (Settings style) |
| **Grouped** | Full-width sections with dividers | Legacy grouped table style |
| **Plain** | Continuous, no section separation | Simple lists, content feeds |
| **Sidebar** | Mac / iPad sidebar row style | Navigation destinations |

### List Row Anatomy

A standard list row contains:
1. **Leading accessory** — Icon, image, color swatch, or checkbox.
2. **Primary label** — Main item name (`.headline` style).
3. **Secondary label** — Supporting detail (`.subheadline` or `.footnote` style).
4. **Trailing accessory** — Disclosure indicator (chevron), value label, or toggle.

### List Row Heights

| Content | Minimum row height |
|---------|------------------|
| Single text line | 44pt |
| Two text lines | 56pt |
| Three text lines | 68pt |
| Image + text | 44pt to 80pt (based on image) |

Rows must expand for larger Dynamic Type sizes — never clip text.

### Swipe Actions

- **Trailing swipe actions** (swipe left): destructive actions (Delete) and secondary actions (Archive, Flag, Move).
- **Leading swipe actions** (swipe right): affirmative actions (Mark as Read, Pin, Favorite).
- Maximum: 4 swipe actions per side.
- Destructive swipe actions (Delete): styled in red, require full swipe or tap to confirm.
- Full swipe to execute the first action: supported for common actions; disable for irreversible destructive actions.

### Reordering

Support drag reordering via edit mode (UITableView) or `SwiftUI .onMove` when list order matters to the user. Show reorder handles on the trailing side in edit mode.

---

## 31. Components — Alerts & Action Sheets

### Alerts

Alerts interrupt the user's flow to communicate critical information or request confirmation for important actions.

**Use alerts for:**
- Critical error messages that require user acknowledgment.
- Confirming actions that cannot be undone.
- Requesting additional required information (rare).

**Do NOT use alerts for:**
- Success messages (use inline feedback instead).
- Non-critical information (use banners or inline notices).
- Routine confirmations (use swipe actions instead).

### Alert Structure

```
┌──────────────────────────────┐
│  Title (bold, short phrase)  │
│                              │
│  Message (1-2 sentences of  │
│  explanatory context)        │
│                              │
│  [Cancel]      [Delete]      │
│                  ↑ red/destructive
└──────────────────────────────┘
```

**Alert button rules:**
- Maximum 2 buttons in horizontal layout; 3+ buttons stack vertically.
- Cancel button: leading position in horizontal layout (or bottom in vertical).
- Destructive button: trailing in horizontal (red text), or above Cancel in vertical.
- Preferred (default) button: system blue, receives Enter key press.
- Never make the destructive action the default (highlighted) button.

### Action Sheets

Action sheets present 3+ choices related to the current context, without blocking the entire screen with an alert.

**Action sheet rules:**
- Title and optional message appear at the top.
- Most relevant actions at the top (but destructive actions at the bottom above Cancel).
- Cancel appears at the very bottom, separated by a gap.
- Maximum ≈ 8 actions. More than that, reconsider UI.
- On iPhone: slides up from the bottom.
- On iPad: appears as a popover anchored to the triggering button.

---

## 32. Components — Pickers & Date Pickers

### Standard Picker

A picker displays a scrollable drum/wheel of options. Users scroll to the desired value and it snaps to the center.

**When to use pickers:**
- Small, fixed sets of options (countries, categories, settings values).
- Time, date, or duration values where a wheel is intuitive.

**When NOT to use pickers:**
- Large open-ended data sets — use a searchable list instead.
- Boolean values — use a Toggle instead.
- 2–3 options — use a Segmented Control instead.

### Date & Time Pickers

| Style | Display | Use |
|-------|---------|-----|
| **Wheels** | Three drum-wheel columns (month, day, year) | Classic iOS date entry |
| **Compact** | Tappable date chip that expands inline | Inline date fields in forms |
| **Graphical** | Full calendar grid | Date range selection, event scheduling |

The compact style is preferred for most forms — it takes minimal space and expands on demand.

---

## 33. Components — Sliders, Steppers & Toggles

### Sliders

Sliders allow continuous value selection along a range.

- Provide minimum and maximum value labels or icons (e.g., small/large speaker icon).
- Never require exact precision from a slider — if precision matters, combine with a numeric text field.
- Horizontal sliders are standard. Vertical sliders are rare and non-conventional.
- Step size: a slider that needs snap-to-increment points → use a stepper or segmented control instead.

### Steppers

Steppers increment or decrement a value by a fixed amount via + and − buttons.

- Show the current value explicitly as a text label adjacent to the stepper.
- Use steppers for integers or small finite increments.
- Set appropriate minimum and maximum limits; disable the button at each limit.

### Toggles (Switches)

Toggles represent a binary on/off state.

- Use for settings that take effect immediately — not for choices that require a save/apply action.
- Label should describe what the toggle controls, not its current state ("Notifications" not "Notifications On").
- The label should always be on the leading side; the toggle on the trailing side.
- Animate the transition smoothly — never snap the toggle state.

---

## 34. Components — Segmented Controls

### Purpose

Segmented controls display a set of 2–5 mutually exclusive options, where selecting one deselects all others. The entire control appears as a connected unit.

### When to Use

- **Filter/sort options:** Show "All | Active | Completed" tabs within a view.
- **View mode switching:** "List | Grid" view toggle.
- **Brief option sets:** Where a picker would be overkill for ≤ 5 choices.

### Rules

- 2–5 segments; more than 5 becomes unreadable.
- All segment labels must be the same type (all text, or all icons — never mixed).
- Labels must be short (1–2 words); truncation is a failure.
- Selecting a segment should immediately update the content below it (no "Apply" button needed).
- Never disable individual segments — remove them if they're unavailable.

---

## 35. Components — Context Menus & Pop-ups

### Context Menus (iOS)

Long press on an item to reveal a context menu with a preview of the item above. See [Section 14 — Menus](#14-patterns--menus) for full detail.

### Pop-up Buttons (macOS / iPadOS)

A pop-up button shows the current selection and reveals a menu of options when tapped.

- Use for settings that change a persistent value (not trigger an action).
- The button label always reflects the current value.
- Differ from pull-down menus: pull-down buttons show an action word, pop-up buttons show a value.

### Popovers (iPad / Mac)

A popover appears floating above the rest of the UI, anchored to a specific control.

- Dismiss by tapping/clicking outside the popover.
- Maximum recommended width: 320pt.
- On iPhone, popovers automatically fall back to sheets.
- Popovers should not contain navigation stacks with multiple levels — they're for focused, single-level auxiliary content.

---

## 36. Components — Collection Views & Grids

### When to Use Grid Layouts

- **Photo galleries** — equal-size square cells in a tight grid.
- **App grids** — icon + label cells (Home Screen style).
- **Card grids** — rectangular cards with varying heights.
- **Category browsing** — 2–3 column card layout with visual differentiation.

### Grid Design Rules

- Use compositional layouts (`UICollectionViewCompositionalLayout` / `LazyVGrid`) for adaptive column counts.
- Do not hard-code column counts — calculate based on available width.
- Inter-item spacing: minimum 8pt. Section insets: minimum 16pt from screen edges.
- Card aspect ratios should be consistent within a grid.
- Support reordering via long press + drag when content order is user-controlled.

---

## 37. Components — Text Views & Text Fields

### Text Fields

Single-line text input.

- Always pair with a label (above the field is preferred; placeholder text alone is insufficient — it disappears when the user starts typing).
- Show keyboard type appropriate to the content: `.emailAddress`, `.phonePad`, `.numberPad`, `.URL`, `.decimalPad`.
- Enable autocorrection only when appropriate (disable for emails, usernames, codes).
- Show a clear button (×) for fields where users frequently need to erase the entire value.
- Inline validation: show errors inline beneath the field in real time, not only on form submission.

### Text Views

Multi-line text input (for messages, notes, comments).

- Allow scrolling within the text view or allow the view to grow dynamically.
- Show a character count when a limit exists.
- Support paste with rich content gracefully (strip formatting or ask the user).
- Support undo/redo (standard system gestures).

### Keyboard Avoidance

When the software keyboard appears:
1. The focused text field must scroll into view above the keyboard.
2. Submit / action buttons must remain visible above the keyboard.
3. Use `KeyboardAvoidingView` (SwiftUI) or observe `UIKeyboardWillShowNotification` (UIKit).

---

## 38. Inputs

### Touch Inputs

| Input | Description | Notes |
|-------|-------------|-------|
| **Tap** | Standard selection / activation | Must work on all interactive elements |
| **Double tap** | Secondary action | Must not be the only way to access an action |
| **Long press** | Context menu / drag initiation | Supplemental, not primary |
| **Swipe** | Reveal swipe actions / navigate | Trailing swipe = secondary/destructive actions |
| **Pan / drag** | Move items, scroll, resize | Provide visual feedback during drag |
| **Pinch** | Zoom in/out | Standard in maps, photos, document views |
| **Rotation** | Rotate object | Supplemental; always provide alternative controls |
| **Edge swipe** | System navigation | Never override |

### Keyboard Inputs

**Hardware keyboard support is required for iPad apps:**

| Shortcut | Action |
|----------|--------|
| ⌘N | New item |
| ⌘S | Save |
| ⌘Z | Undo |
| ⌘⇧Z | Redo |
| ⌘C / ⌘V | Copy / Paste |
| ⌘F | Find |
| ⌘W | Close window |
| ⌘, | Open Settings/Preferences |
| ⌘? | Open Help |
| ⌘↩ | Confirm / Send (in compose views) |
| Escape | Cancel / dismiss |

All custom keyboard shortcuts must be discoverable via the **Key Commands** menu (appears when holding ⌘ on iPad).

### Pointer (Cursor) Input

On iPad with Magic Trackpad / Mouse and all Mac apps:

- All interactive elements must have a hover state.
- Draggable items should show `.grab` cursor on hover, `.grabbing` cursor during drag.
- Text fields should show the text insertion cursor (I-beam) on hover.
- Destructive or significant buttons should show the default pointer (arrow) — never the pointing hand (which implies a hyperlink).
- Support contextual cursor changes for edge-dragging (resize handles).

### Apple Pencil Inputs

- **Double tap (Apple Pencil 2):** Switch tools, toggle eraser, show color picker.
- **Squeeze (Apple Pencil Pro):** Context-sensitive action (show palette, enter squeeze mode).
- **Hover:** Available on iPad Pro with Apple Pencil 2 — show real-time cursor position before contact.
- Drawing apps must distinguish Pencil from finger input and allow independent configuration.

### Voice Input

- All text fields should support dictation via the microphone key on the system keyboard.
- Don't disable the dictation key.
- Support Voice Control for full hands-free navigation.
- VoiceOver must be able to interact with all elements.

---

## 39. Technologies — Widgets

### Widget Basics

Widgets display timely, relevant information from your app on the Home Screen, Lock Screen, and Today View — without opening the app.

### Widget Families

| Family | Size | Typical use |
|--------|------|-------------|
| **Small** | 2×2 grid units | Single metric, countdown, current status |
| **Medium** | 4×2 grid units | Short list, summary + chart |
| **Large** | 4×4 grid units | Rich list, multi-metric dashboard |
| **Extra Large** | 4×4+ (iPad only) | Detailed dashboard |
| **Accessory Circular** | Lock Screen / Watch face | Single value, ring/gauge |
| **Accessory Rectangular** | Lock Screen / Watch face | 2–3 lines of text |
| **Accessory Inline** | Lock Screen / Watch face | Single short text string |

### Widget Design Principles

- **Glanceable above all.** The most important information must be readable in < 1 second.
- **Current data.** Widgets that show stale data feel broken. Use WidgetKit's timeline system to keep content current.
- **No interaction within the widget** (iOS widgets are static snapshots). Tapping opens the app at a specific deep-link destination.
- **Privacy.** Widgets appear on the lock screen — never show sensitive data without authentication.
- **Both appearance modes.** Every widget must look correct in Light, Dark, and Accented (tinted) modes.

### Widget Content Guidelines

- No advertisements in widgets.
- No promotional content.
- No content unrelated to the app's core function.
- Widget content must update in a reasonable time window (WidgetKit allows up to ~40-70 refresh requests per day).

### iOS 18 Widget Enhancements

- **Accented widgets:** Single-color style that uses the user's chosen Home Screen tint.
- **Vibrant widgets:** Desaturated style for display on the Always-On lock screen.
- **Interactive widgets (iOS 17+):** Buttons and toggles within widgets can trigger App Intents without launching the app.

---

## 40. Technologies — Live Activities

### What Are Live Activities?

Live Activities display real-time, updating information on the Lock Screen and in the Dynamic Island for ongoing events: food delivery tracking, sports scores, workout progress, flight status, ride-hailing.

### Live Activity Design

- **Lock Screen banner:** Wide layout; show the most critical current state + key metrics.
- **Dynamic Island compact:** Ultra-small; leading + trailing slots around the front camera.
- **Dynamic Island expanded:** Tapped; shows richer detail in a pill-shaped expanded view.
- **Dynamic Island minimal:** When multiple Live Activities compete; a small dot indicator.

### Live Activity Rules

- End the Live Activity promptly when the underlying event concludes (within a few seconds).
- Never leave a stale Live Activity running after the event ends.
- Live Activities should update in real time — stale data is worse than no data.
- Avoid dense text in Live Activities — large numbers and icons are preferred at small sizes.
- Do not use Live Activities for static notifications — use push notifications instead.

---

## 41. Technologies — Dynamic Island

### Dynamic Island Overview

Available on iPhone 14 Pro, iPhone 15, and iPhone 16 series. A pill-shaped interactive element around the front-facing camera housing that surfaces Live Activities, alerts, and system status.

### Dynamic Island States

| State | Width | Typical content |
|-------|-------|----------------|
| **Collapsed (default)** | ~36pt | Animated indicator, minimal Live Activity |
| **Compact (one activity)** | ~120–250pt | Leading + trailing content slots around camera |
| **Minimal (two+ activities)** | ~36pt + dot | Circular icon on one side, dot on other |
| **Expanded (long press)** | Full screen width | Detailed Live Activity view |

### Dynamic Island Design Rules

- Never cover or overlap the Dynamic Island with app content.
- Content in the compact layout must be icon/number only — no text longer than ~5 characters.
- The expanded layout supports richer content including text and mini-charts.
- Transitions between states must animate smoothly — use system-provided animation APIs.
- Provide both compact and expanded views; both must make sense independently.

---

## 42. Technologies — SharePlay

### What Is SharePlay?

SharePlay enables real-time shared experiences within FaceTime and Messages. Users can watch movies together, listen to music together, or share any app experience — with synchronized playback and controls visible to all participants.

### SharePlay Integration Requirements

- Implement `GroupActivity` protocol for your shared activity.
- All participants must have the app installed — handle gracefully when someone doesn't.
- Synchronize state across all participants using `GroupSession.messenger`.
- Shared media must respect DRM and licensing restrictions.
- Provide a visual indicator that a SharePlay session is active within your app.
- Allow any participant to pause, play, or seek — not just the session initiator.

---

## 43. Technologies — Augmented Reality (AR)

### ARKit Best Practices

**Onboarding:**
- Show a brief, visual instruction on how to move the device to establish world tracking.
- Use animation (the scanning arc) to indicate scanning for surfaces.
- Don't use text-heavy instruction screens.

**Placing content:**
- Show a visual indicator (target reticle) on detected surfaces before placement.
- Provide haptic feedback when a surface is detected.
- Allow users to reposition placed objects after initial placement.
- Support both tap-to-place and drag-to-position.

**Environmental awareness:**
- Dim virtual content appropriately relative to scene brightness.
- Apply environment-based lighting to virtual objects (ARKit's scene lighting estimation).
- Acknowledge real-world depth — virtual objects should be occluded by real-world surfaces.

**Interruptions:**
- Handle phone calls, lock screen, and multi-task gracefully — pause tracking, notify the user.
- Resume tracking smoothly after interruptions.
- Don't lose world-anchor data on brief interruptions.

**Comfort:**
- Avoid requiring sustained arm movement above the shoulders.
- Don't place content at uncomfortable distances (less than 0.5m or more than 5m for precision interactions).
- Respect the `UIAccessibility.isReduceMotionEnabled` flag — minimize animated content.

---

## 44. Technologies — CarPlay

### CarPlay Design Context

CarPlay displays a subset of your app's functionality on the vehicle's in-dash screen. Safety and driving context are paramount — interactions must be glanceable and completable in seconds.

### CarPlay-Supported App Categories

- Audio (music, podcasts, radio)
- Navigation / Maps
- Messaging (voice-driven)
- Parking, EV charging, fueling
- Quick food ordering
- Communication

### CarPlay Design Rules

- Never require the driver to type text while driving — use voice input for all text entry.
- Limit list depth to 2 levels maximum.
- Large, finger-friendly touch targets (vehicle gloves must work).
- High contrast for variable sunlight conditions.
- No video playback (except media that's audio-only or navigation video).
- Audio must integrate with the system's NowPlaying interface.
- Respond quickly — CarPlay UI must render within 1 second.

---

## 45. Technologies — Game Center

### Game Center Features

- **Leaderboards:** Global and friend-based high score rankings.
- **Achievements:** Milestone badges that reward exploration and mastery.
- **Multiplayer:** Real-time and turn-based matchmaking.
- **Friends:** Social graph for game discovery.
- **Challenges:** Send specific leaderboard or achievement challenges to friends.

### Game Center Design Rules

- Use the standard Game Center dashboard and UI — don't build custom equivalents.
- Present the Game Center access point consistently (top corner or as a menu option).
- Achievement artwork should be expressive and clearly indicate the achievement goal.
- Leaderboard data must be legitimate — never manipulate scores server-side.
- Support Game Center's authentication flow transparently (auto-authenticate on launch).

---

## 46. Technologies — In-App Purchase & StoreKit

### StoreKit 2 (iOS 15+)

StoreKit 2 provides async/await Swift APIs for handling in-app purchases.

### IAP Design Guidelines

**Subscription offer screens:**
- Clearly describe what the subscription includes.
- Prominently display the price and billing period.
- Clearly label free trial duration if offered.
- Include a link to Terms of Service and Privacy Policy.
- Never obscure the "No thanks" / "Cancel" option.

**Paywall design rules:**
- Do not block access to the app without at least offering a free trial.
- The free-tier experience must be genuinely useful — not a broken stub.
- Show feature comparison between free and paid tiers.
- Subscription upgrade prompts in context (when a user tries to use a premium feature) are acceptable.
- Do not show more than 2 paywall prompts per session.

**Restore purchases:**
- Always include a "Restore Purchases" button in purchase-related UI.
- Handle restoration gracefully and confirm when complete.

---

## 47. Accessibility — Complete Guide

### Why Accessibility Is Non-Negotiable

Accessibility features benefit everyone, not just users with disabilities:
- **Permanent:** Users with permanent visual, motor, or hearing impairments.
- **Temporary:** A broken arm, wearing sunglasses in bright sunlight, wearing noise-canceling headphones.
- **Situational:** Driving (can't look at screen), holding a baby (one hand), in a noisy restaurant.

Apple has made accessibility a first-class platform feature, and the App Store review process flags serious accessibility failures.

### VoiceOver

VoiceOver is Apple's screen reader. It reads aloud and describes every element on screen for users who are blind or have low vision.

**Requirements:**
- Every interactive element must have a meaningful `accessibilityLabel`.
  - Bad: "button" / "image"
  - Good: "Add to Cart" / "Profile photo of Jane Smith"
- Reading order must match visual reading order — validate on a real device.
- Custom controls must implement `accessibilityActivate()` and `accessibilityIncrement()` / `accessibilityDecrement()` where relevant.
- Decorative images must be marked `accessibilityHidden = true`.
- Grouped elements (icon + label) should be combined into a single accessible element.
- `accessibilityHint` provides additional context for non-obvious actions: "Double tap to open in a new window."
- `accessibilityValue` reports current state: "Toggle, on" / "Slider, 75%".

### Dynamic Type (Text Sizing)

- Use system text styles exclusively (`.body`, `.headline`, `.footnote`, etc.).
- Never clip or truncate text at larger sizes — allow wrapping.
- Test at AX5 (maximum Dynamic Type size).
- Row heights, icon sizes, and touch areas must all expand proportionally.

### Color & Contrast

- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text and UI components.
- Test in both Light and Dark mode.
- Never use color as the sole indicator of state, error, or meaning.
- Test with color blindness simulation filters (Xcode Accessibility Inspector → Color Filters).

### Reduce Motion

Respect `UIAccessibility.isReduceMotionEnabled` / `@Environment(\.accessibilityReduceMotion)`:
- Replace dissolves and slides with cross-fades.
- Remove particle effects, spinning animations, parallax effects.
- Keep Liquid Glass specular animations subdued.
- Required for users with vestibular disorders (motion sickness from screen movement).

### Reduce Transparency

When `UIAccessibility.isReduceTransparencyEnabled` is true:
- Remove blur / translucency effects.
- Replace glass/material backgrounds with solid backgrounds.
- The system handles standard UIKit / SwiftUI materials automatically.
- Custom blur views must be manually handled.

### Switch Control

Switch Control allows users with severe motor impairments to navigate using adaptive hardware switches.

- All interactive elements must be reachable via Switch Control scanning.
- Group related controls to reduce scan steps.
- Provide adequate timing for scan animations — don't auto-advance too quickly.

### Keyboard Navigation (iPad / Mac)

- Full keyboard navigation must be possible — Tab to focus, Space/Enter to activate, Arrow keys for selection.
- Focus ring must always be visible on the focused element.
- No keyboard trap — users must always be able to navigate away from any element.

### Voice Control

Voice Control allows hands-free operation via spoken commands.

- All buttons must have labels that users can speak.
- If labels are icon-only, provide `accessibilityLabel` matching what users would naturally say.
- Voice Control displays labels over buttons when the user says "Show names."

### Display Accommodations

| Setting | What it does | How to respond |
|---------|-------------|----------------|
| Bold text | System fonts heavier | Use semantic text styles — automatic |
| Larger text | Text size increase | Use Dynamic Type — automatic |
| Button shapes | Adds border to buttons | Use system components — automatic |
| On/off labels | Adds I/O text to toggles | Use system Toggle — automatic |
| Smart Invert | Inverts most colors, not images | Mark images with `accessibilityIgnoresInvertColors = true` |
| Classic Invert | Inverts all colors | Test and ensure no black-on-black failures |
| Grayscale | Removes all color | Ensure no information conveyed by color alone |

### Accessibility Testing Workflow

**Per sprint / PR:**
1. Run Xcode Accessibility Inspector on each new screen.
2. Navigate entire new flow using VoiceOver only (on device, not simulator).
3. Test at AX5 Dynamic Type size.
4. Run color contrast check in both Light and Dark modes.
5. Navigate with keyboard only (Tab key) on iPad.

**Before each App Store submission:**
1. Full VoiceOver navigation of complete app flows.
2. Voice Control verification of all primary actions.
3. Accessibility Inspector audit report (no critical issues).
4. Test with Reduce Motion, Reduce Transparency, and Increase Contrast all enabled simultaneously.

---

## 48. SF Symbols

### What Are SF Symbols?

SF Symbols is Apple's library of over **6,900+ symbols** designed to integrate seamlessly with the San Francisco typeface system. They're available across all Apple platforms and scale perfectly with Dynamic Type text sizes.

### Why Use SF Symbols

- **Scale perfectly** with text size and Dynamic Type.
- **Adapt** to Light / Dark mode and color tinting automatically.
- **Reduce bundle size** — no need to bundle thousands of custom icons.
- **Localize** — many symbols have locale variants (RTL arrows, calendar formats).
- **Accessibility** — come with built-in `accessibilityLabel` strings in Apple frameworks.

### SF Symbols Rendering Modes

| Mode | Description | Use |
|------|-------------|-----|
| **Monochrome** | Single color (tint color) | Tab bar icons, toolbar buttons |
| **Hierarchical** | Automatic opacity levels from one color | Multi-layer symbols (e.g., cloud.sun.rain) |
| **Palette** | Independent colors per layer | Brand-colored multi-color icons |
| **Multicolor** | Fixed Apple-defined colors | Standard colored symbols (e.g., 📊 style) |

### SF Symbols Weights & Scales

Symbols support 9 weights (ultralight → black) × 3 scales (small, medium, large) = 27 configurations. Always match the symbol weight to the surrounding text weight.

### Common SF Symbols Reference

| Symbol name | Use |
|------------|-----|
| `plus` | Add new item |
| `trash` / `trash.fill` | Delete |
| `pencil` / `square.and.pencil` | Edit |
| `magnifyingglass` | Search |
| `chevron.right` | Disclosure / navigation |
| `chevron.left` | Back / previous |
| `ellipsis` / `ellipsis.circle` | More options |
| `xmark` / `xmark.circle` | Close / dismiss |
| `checkmark` | Selection confirmed |
| `heart` / `heart.fill` | Favorite / like |
| `star` / `star.fill` | Rating / featured |
| `bell` / `bell.fill` | Notifications |
| `person.circle` | Profile |
| `gear` / `gearshape` | Settings |
| `arrow.clockwise` | Refresh / reload |
| `square.and.arrow.up` | Share |
| `doc.on.doc` | Copy |
| `arrow.uturn.backward` | Undo |
| `arrow.uturn.forward` | Redo |
| `lock` / `lock.open` | Locked / unlocked |
| `wifi` | Wi-Fi status |
| `battery.100` | Battery level |
| `location.fill` | Current location |
| `map` | Maps |
| `calendar` | Calendar / date |
| `clock` | Time |
| `house` / `house.fill` | Home |
| `folder` | Files / documents |
| `photo` | Media / gallery |
| `camera` | Camera |
| `mic` | Microphone / recording |
| `speaker.wave.2` | Audio / sound |

### Custom Symbols

To create a custom symbol that matches the SF Symbols system:
1. Use the SF Symbols app to find the closest existing symbol.
2. Export it as an SVG template.
3. Draw your custom paths within the template grid.
4. Import back into Xcode as a symbol asset.
5. Test in all 9 weights and 3 scales.

---

## 49. Design Resources & Tools

### Official Apple Resources

| Resource | Location | Purpose |
|----------|----------|---------|
| **Human Interface Guidelines** | developer.apple.com/design/human-interface-guidelines | Complete design reference |
| **Apple Design Resources** | developer.apple.com/design/resources | Official Figma + Sketch UI kits |
| **SF Symbols App** | developer.apple.com/sf-symbols | Browse and export SF Symbols |
| **Icon Composer** | Available via Xcode 16+ | Create layered Liquid Glass icons |
| **Accessibility Inspector** | Xcode → Open Developer Tool → Accessibility Inspector | Audit accessibility compliance |
| **Apple Design Awards** | developer.apple.com/design/awards | Annual awards for design excellence |

### Official Figma UI Kits (Free, from Apple)

- **iOS & iPadOS UI Kit** — All native iOS components in current style.
- **macOS UI Kit** — All macOS components (windows, toolbars, menus).
- **watchOS UI Kit** — Watch face complications, watch screen templates.
- **tvOS UI Kit** — Apple TV layouts and components.

Download all from `developer.apple.com/design/resources`.

### Third-Party Tools

| Tool | Purpose |
|------|---------|
| Figma + Stark plugin | Color contrast checking in designs |
| Figma + A11y plugin | Full accessibility audit in design phase |
| Xcode + Accessibility Inspector | Runtime accessibility audit |
| Charles Proxy | Network inspection during development |
| TestFlight | Beta distribution and testing |
| Instruments | Performance profiling |

---

## 50. Quick Reference Checklists

### Pre-Submission HIG Compliance Checklist

**Visual Design:**
- [ ] All screens tested in Light Mode and Dark Mode
- [ ] All screens tested at AX5 (max) Dynamic Type size
- [ ] All text uses system text styles (`.body`, `.headline`, etc.)
- [ ] Color contrast meets 4.5:1 minimum for all text
- [ ] No information conveyed by color alone
- [ ] App icon provided in all required sizes and all three appearances (light, dark, tinted)
- [ ] Safe areas respected on all devices (notch, Dynamic Island, Home Indicator)
- [ ] 8pt grid used consistently for all spacing

**Navigation & Interaction:**
- [ ] Back button / swipe-to-go-back always works in navigation stacks
- [ ] No modal traps (user can always dismiss any modal)
- [ ] All destructive actions require confirmation
- [ ] Error messages describe the problem AND what to do next
- [ ] Empty states include a clear call-to-action
- [ ] Pull-to-refresh implemented for updateable content lists
- [ ] Scroll position restored on back navigation

**Accessibility:**
- [ ] All interactive elements have meaningful `accessibilityLabel`
- [ ] Decorative elements marked `accessibilityHidden = true`
- [ ] VoiceOver navigation tested on device — logical reading order
- [ ] All tap targets ≥ 44×44 points
- [ ] Reduce Motion setting respected
- [ ] Reduce Transparency setting respected
- [ ] Keyboard navigation works on iPad (Tab / Space / Enter)
- [ ] Voice Control labels verified for all primary actions

**Performance:**
- [ ] App launches within 2 seconds on oldest supported device
- [ ] Lists scroll at 60fps (test with Instruments)
- [ ] No dropped frames during transitions and animations
- [ ] Large images loaded asynchronously, never blocking the main thread
- [ ] Memory footprint reviewed — no obvious leaks

**Platform Integration:**
- [ ] Keyboard shortcuts implemented for iPad (all ⌘ shortcuts)
- [ ] Keyboard avoidance works correctly when text field is focused
- [ ] App handles phone calls, Siri invocation, and multitasking gracefully
- [ ] Share sheet integrated for all shareable content
- [ ] System drag and drop supported where relevant

---

### iOS Navigation Pattern Decision Tree

```
Need app-level navigation?
├── 2–5 peer sections?
│   └── → Tab bar (UITabBarController)
├── Drill-down hierarchy?
│   └── → Navigation controller (UINavigationController)
├── Page browsing / onboarding?
│   └── → Page view controller (UIPageViewController)
└── Need focused task without leaving context?
    └── → Modal sheet / UISheetPresentationController
```

### iPad Layout Decision Tree

```
Horizontal size class?
├── Compact → Tab bar + full-width content (iPhone layout)
└── Regular
    ├── Content-heavy → NavigationSplitView with sidebar
    ├── Document editing → Multi-column layout
    └── Media viewing → Immersive full-screen with auto-hiding controls
```

### Color Mode Quick Reference

| Scenario | Correct approach |
|---------|----------------|
| Background color | `.systemBackground` (never `UIColor.white`) |
| Text on background | `.label` (never `UIColor.black`) |
| Secondary text | `.secondaryLabel` |
| Separator lines | `.separator` |
| Destructive action | `.systemRed` |
| Default tint | `.systemBlue` (or app accent color) |
| Disabled state | Apply 50% opacity to any color |
| Custom brand color | Define as `Color(uiColor:)` with light/dark variants in asset catalog |

---

### Typography Quick Reference

| Role | Text style | Default size |
|------|-----------|-------------|
| Screen title | `.largeTitle` | 34pt |
| Section header | `.title1` | 28pt |
| Sub-section | `.title2` | 22pt |
| Prominent label | `.headline` | 17pt semibold |
| Body paragraph | `.body` | 17pt |
| Secondary body | `.callout` | 16pt |
| Caption | `.caption1` | 12pt |
| Smallest text | `.caption2` | 11pt |
| Code / monospace | `.monospacedSystemFont` | Match context |

---

*This document synthesizes Apple's official Human Interface Guidelines across all platforms and component categories. For the authoritative, current source, always refer to: [developer.apple.com/design/human-interface-guidelines](https://developer.apple.com/design/human-interface-guidelines). Apple updates the HIG with every major OS release — check the changelog after each WWDC.*
