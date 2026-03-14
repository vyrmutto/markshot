# Screen Capture Extension — Design Spec

**Date**: 2026-03-14
**Status**: Approved
**Type**: Open Source Chrome Extension

---

## Overview

An open-source browser screen capture extension for Chrome — feature-complete, local-first, no SaaS, no paywalled features. Users who want cloud storage can self-host or bring their own storage provider credentials.

Inspired by Awesome Screenshot's UX (full-page overlay annotation editor), but fully open and extensible.

---

## Platform & Browser

- **Type**: Chrome Extension, Manifest V3
- **Target browser**: Chrome only (Chromium MV3 compatible as bonus)
- **Distribution**: Chrome Web Store + GitHub releases (manual install)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| UI Framework | React 19 |
| Build tool | Vite + CRXJS plugin |
| Monorepo | pnpm workspaces + Turborepo |
| Canvas/Annotation | Fabric.js v6 |
| Icon library | Lucide React |
| State management | Zustand |
| Testing | Vitest + React Testing Library + Playwright (E2E) |
| Linting | ESLint + Prettier |

---

## Monorepo Architecture

```
my-browser-screen-capture/
├── packages/
│   ├── core/           # @capture/core
│   ├── extension/      # @capture/extension
│   ├── ui/             # @capture/ui
│   └── storage/        # @capture/storage
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

### `@capture/core`
Pure logic — no browser extension APIs, no React. Fully unit-testable.
- Screenshot stitching engine (full-page scroll + stitch via canvas)
- Region/element crop logic
- Video recording orchestration (WebRTC)
- GIF encoding (via gif.js or similar)
- Capture metadata types

### `@capture/extension`
Chrome MV3 shell.
- `background/` — service worker: message routing, tab capture API calls
- `content/` — content script: overlay injection, region selector UI, element picker
- `manifest.json`
- Popup entry point (renders `@capture/ui`)
- Options page entry point

### `@capture/ui`
React component library (Lucide React icons throughout).
- Popup: capture mode selector, record controls, history tab, settings link
- Annotation toolbar: all 8 tools + color picker + stroke slider + undo/redo
- Annotation canvas: Fabric.js canvas wrapper
- History panel: thumbnail grid, copy/share/delete actions
- Settings page: storage provider configuration
- Options page shell

### `@capture/storage`
Storage provider plugin system.

```typescript
interface StorageProvider {
  id: string
  name: string
  upload(blob: Blob, meta: CaptureMeta): Promise<UploadResult>
  getHistory(): Promise<CaptureRecord[]>
  delete(id: string): Promise<void>
  configure(settings: Record<string, unknown>): void
  getShareUrl?(id: string): Promise<string>
}
```

**Built-in providers**:
- `LocalProvider` — IndexedDB + chrome.storage (default, no config needed)
- `ImgurProvider` — anonymous upload, returns public URL
- `S3Provider` — S3-compatible (AWS, Cloudflare R2, MinIO, Wasabi)
- `GoogleDriveProvider` — OAuth via Chrome extension identity API
- `DropboxProvider` — OAuth via Chrome extension identity API

---

## Features

### Capture Modes

| Mode | Implementation |
|---|---|
| Visible Area | `chrome.tabs.captureVisibleTab()` |
| Full Page | Scroll + `captureVisibleTab()` loop → canvas stitch in `@capture/core` |
| Region Select | Overlay with drag selection → crop from visible capture |
| Element Capture | Hover highlight DOM elements → `getBoundingClientRect()` → crop |
| Delayed Capture | Countdown timer (1s / 3s / 5s) before any capture mode |

### Annotation Editor (Full-Page Overlay)

Injected by content script on top of current tab after capture. Overlay dims the page behind.

**Fabric.js v6 canvas** — undo/redo via object stack.

**Tools**:
1. Arrow & Line
2. Rectangle
3. Circle
4. Text Label
5. Freehand Pen
6. Blur / Pixelate (sensitive data redaction)
7. Highlighter (semi-transparent)
8. Step Counter (numbered circles: ①②③)

**Controls**: Color picker (preset swatches + custom), stroke width slider, Undo/Redo, Save (download/copy), Done (close overlay).

### Video & Recording

| Feature | API |
|---|---|
| Record Tab | `chrome.tabCapture` API |
| Record Screen | `navigator.mediaDevices.getDisplayMedia()` |
| Export MP4 | MediaRecorder → Blob → download |
| Export GIF | Frame sampling → gif.js encoding |

### Export / Save

- **Download PNG/JPG** — direct browser download
- **Copy to Clipboard** — `navigator.clipboard.write()` with `ClipboardItem`
- **Local History** — stored in IndexedDB via `LocalProvider`, accessible from popup History tab
- **Provider Upload** — via configured `StorageProvider` plugin → returns shareable URL

---

## UX Flow

```
User clicks extension icon
  → Popup opens (320px)
    → Selects capture mode (or record)
      → @capture/core executes capture
        → Content script injects full-page overlay
          → @capture/ui renders annotation editor
            → User annotates
              → Clicks Save / Done
                → @capture/storage saves via active provider
                  → Notification: copied to clipboard / link ready
```

---

## Extension Popup UI

Three tabs:
1. **Capture** — 5 capture mode buttons + delayed capture selector
2. **Record** — Record Tab / Record Screen buttons, active recording controls
3. **History** — thumbnail grid of recent captures, copy/share/delete per item

Footer: Settings link · History count · Active storage provider indicator

---

## Icon & Branding

- **Logo direction**: Lucide-style minimal camera icon in SVG (custom, no external asset)
- **Icon sizes**: 16px, 32px, 48px, 128px (all SVG-sourced)
- **Color**: Red gradient (`#ff4757` → `#ff6b81`) on rounded square background
- **UI icons**: Lucide React throughout all components

---

## Storage & Privacy

- **Default**: Everything stored locally in IndexedDB — zero network calls
- **No telemetry**, no analytics, no tracking
- **Cloud storage**: opt-in only, credentials stored in `chrome.storage.local` (encrypted at rest by Chrome)
- **No backend**: The extension itself has no server. Storage providers are third-party services the user brings their own credentials for.

---

## Open Source Conventions

- **License**: MIT
- **Contributing**: `StorageProvider` interface is the main extension point — community can add new providers via PR
- **No feature flags / tiers**: All features available to everyone
- **Self-hosting**: Users who want a shareable link backend can run MinIO or any S3-compatible service via Docker

---

## Out of Scope (v1)

- Firefox / Safari support
- Desktop app (Electron)
- Built-in public share server
- OCR / AI features
- Browser-native sidebar panel editor
