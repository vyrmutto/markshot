# Markshot

Open-source Chrome extension for screen capture, annotation, and recording. No SaaS, no paywalls — all features work locally in your browser.

## Features

- **Capture** — Visible area, full page, region select, element picker, delayed capture
- **Annotate** — Arrow, rectangle, circle, text, pen, blur, highlight, step counter
- **Record** — Tab recording, screen recording (MediaRecorder with VP9/VP8 fallback)
- **Storage** — Local-first (IndexedDB); optionally bring your own Imgur, S3-compatible (AWS S3, Cloudflare R2, MinIO), Google Drive, or Dropbox credentials

## Install

> Chrome Web Store listing coming soon.

In the meantime, load the unpacked extension from [GitHub Releases](https://github.com/vyrmutto/markshot/releases):

1. Download and unzip the latest `markshot-dist.zip`
2. Open `chrome://extensions/` → enable **Developer mode**
3. Click **Load unpacked** → select the unzipped folder

## Development

**Prerequisites:** Node.js 20+, pnpm 10+

```bash
git clone https://github.com/vyrmutto/markshot.git
cd markshot

pnpm install
pnpm build        # production build → packages/extension/dist/
pnpm dev          # watch mode (rebuilds on change)
pnpm test         # run all unit tests (Vitest)
pnpm typecheck    # TypeScript type checking
```

Load `packages/extension/dist/` as an unpacked extension in `chrome://extensions/`.

### Running E2E tests

```bash
cd packages/extension
npx playwright install chromium --with-deps
npx playwright test
```

## Monorepo structure

```
packages/
├── core/       @capture/core      — capture engine + video recorder (no extension APIs)
├── storage/    @capture/storage   — StorageProvider plugin system
├── ui/         @capture/ui        — React 19 components (popup, annotation editor, settings)
└── extension/  @capture/extension — Chrome MV3 shell (service worker, content scripts, popup)
```

Built with [Turborepo](https://turbo.build/) + pnpm workspaces.

## Adding a Storage Provider

1. Create `packages/storage/src/providers/your-provider.ts` implementing `StorageProvider`
2. Export it from `packages/storage/src/index.ts`
3. Register it in `packages/ui/src/settings/SettingsPage.tsx`
4. Add tests in `packages/storage/tests/providers/your-provider.test.ts`

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full interface and PR checklist.

## Tech stack

| Layer | Technology |
|---|---|
| Language | TypeScript 5 |
| UI framework | React 19 |
| Canvas editor | Fabric.js v6 |
| Build | Vite + CRXJS plugin |
| Monorepo | Turborepo + pnpm |
| Unit tests | Vitest + React Testing Library |
| E2E tests | Playwright |
| CI | GitHub Actions |

## Contributing

PRs are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT
