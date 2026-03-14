# my-browser-screen-capture

Open-source Chrome extension for screen capture, annotation, and recording. No SaaS, no paywalls — all features work locally.

## Features

- **Capture**: Visible area, full page, region select, element, delayed
- **Annotate**: Arrow, rectangle, circle, text, pen, blur, highlight, step counter
- **Record**: Tab recording, screen recording
- **Storage**: Local-first (IndexedDB); bring your own Imgur, S3-compatible (AWS, R2, MinIO), Google Drive, or Dropbox credentials

## Install

<!-- TODO: update after Chrome Web Store publish -->
Download the latest release from [GitHub Releases](https://github.com/yourorg/my-browser-screen-capture/releases) and load it as an unpacked extension.

## Development

Prerequisites: Node.js 20+, pnpm 10+

```bash
pnpm install
pnpm build        # production build → packages/extension/dist/
pnpm dev          # watch mode for extension
pnpm test         # run all unit tests
pnpm typecheck    # TypeScript type checking
```

Load `packages/extension/dist/` as an unpacked extension in `chrome://extensions/`.

## Monorepo structure

```
packages/
├── core/       @capture/core      — capture engine, video recorder (no browser extension APIs)
├── storage/    @capture/storage   — StorageProvider plugin system
├── ui/         @capture/ui        — React components (popup, annotation editor, settings)
└── extension/  @capture/extension — Chrome MV3 shell (service worker, content scripts, popup)
```

## Adding a Storage Provider

1. Create `packages/storage/src/providers/your-provider.ts` implementing `StorageProvider`
2. Export it from `packages/storage/src/index.ts`
3. Register it in `packages/ui/src/settings/SettingsPage.tsx`
4. Add tests in `packages/storage/tests/providers/your-provider.test.ts`

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full interface.

## License

MIT
