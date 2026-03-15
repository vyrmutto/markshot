# Markshot — Claude Code Context

Chrome MV3 extension for screen capture, annotation, and recording. pnpm monorepo with Turborepo.

## Package map

| Path | npm name | Purpose |
|---|---|---|
| `packages/core` | `@capture/core` | Capture engine (canvas ops, image crop, stitch, video recorder). No browser extension APIs. |
| `packages/storage` | `@capture/storage` | StorageProvider plugin system (Local/IndexedDB, Imgur, S3-compatible) |
| `packages/ui` | `@capture/ui` | React 19 components: Popup, annotation editor (Fabric.js v6), SettingsPage |
| `packages/extension` | `@capture/extension` | Chrome MV3 shell: service worker, content scripts, popup entry, options page |

## Dev commands

```bash
pnpm install          # install all packages
pnpm build            # turbo build all packages
pnpm dev              # watch mode
pnpm test             # vitest across all packages
pnpm typecheck        # tsc --noEmit across all packages

# single package
pnpm --filter @capture/core test
pnpm --filter @capture/ui test

# E2E (from packages/extension/)
npx playwright install chromium --with-deps
npx playwright test
```

## Architecture notes

- **Service worker** (`packages/extension/src/background/service-worker.ts`) — routes all messages: `CAPTURE`, `START_REGION_SELECTOR`, `REGION_SELECTED`, `START_RECORD`, `STOP_RECORD`
- **Capture handler** (`packages/extension/src/background/capture-handler.ts`) — implements each `CaptureMode`: visible, fullpage (scroll+stitch), region (crop), element, delayed
- **Content overlay** (`packages/extension/src/content/overlay.ts`) — listens for `SHOW_EDITOR` / `START_REGION_SELECTOR`; mounts the Fabric.js annotation editor in a full-page overlay
- **Region selector** (`packages/extension/src/content/region-selector.ts`) — drag-to-select overlay that posts `REGION_SELECTED` back to the service worker
- **StorageProvider** — plugin interface in `@capture/storage`; configured per-user in the options page; saved to `chrome.storage.local`
- **ScreenRecorder** — in `@capture/core`, uses `chrome.tabCapture` (tab) or `getDisplayMedia` (screen) with codec fallback VP9 → VP8 → WebM

## Testing notes

- `@capture/core` tests use a **custom jsdom environment** (`packages/core/src/test-env/jsdom-no-canvas.ts`) that stubs canvas to avoid the native `canvas` binary dependency
- `@capture/ui` uses `happy-dom` (configured in `packages/ui/vitest.config.ts`) — no canvas binary needed
- Extension E2E (`packages/extension/tests/e2e/popup.spec.ts`) launches a real Chromium instance with the built extension loaded

## CI

GitHub Actions (`.github/workflows/ci.yml`):
- `test` job: `pnpm build` → `pnpm test` → `pnpm typecheck`
- `e2e` job (needs `test`): installs Chromium, runs Playwright tests

## Key decisions

- **No Zustand yet** — state is local React state; Zustand is a planned dependency for the annotation editor history
- **`@capture/*` internal scope names stay** — only user-facing strings use "Markshot"
- **Manifest V3** — uses `chrome.tabs.captureVisibleTab` (requires `activeTab`), `chrome.scripting.executeScript` (requires `scripting`), and `chrome.tabCapture` (requires `tabCapture`)
- **No background persistence** — all history stored via StorageProvider; LocalProvider uses IndexedDB
