# Contributing

## Adding a StorageProvider

Implement the `StorageProvider` interface from `@capture/storage`:

```typescript
import type { StorageProvider, UploadResult } from '@capture/storage'
import type { CaptureMeta, CaptureRecord } from '@capture/core'

export class MyProvider implements StorageProvider {
  id = 'my-provider'
  name = 'My Provider'

  configure(settings: Record<string, unknown>): void {
    // store credentials or config
  }

  async upload(blob: Blob, meta: CaptureMeta): Promise<UploadResult> {
    // upload and return { id, url, shareUrl? }
  }

  async getHistory(): Promise<CaptureRecord[]> {
    return []
  }

  async delete(id: string): Promise<void> {
    // delete by id
  }
}
```

Then:
1. Export from `packages/storage/src/index.ts`
2. Add to the providers list in `packages/ui/src/settings/SettingsPage.tsx`
3. Write tests in `packages/storage/tests/providers/my-provider.test.ts`

## Running Tests

```bash
pnpm test                              # all packages
pnpm --filter @capture/core test      # single package
pnpm --filter @capture/ui test        # UI components only
```

## PR Checklist

- [ ] Tests pass (`pnpm test`)
- [ ] Types pass (`pnpm typecheck`)
- [ ] New StorageProviders include unit tests
- [ ] No new external dependencies without justification
