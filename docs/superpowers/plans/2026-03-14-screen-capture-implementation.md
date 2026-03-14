# Screen Capture Extension Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-featured open-source Chrome screen capture extension with annotation, video recording, and pluggable storage.

**Architecture:** pnpm monorepo with 4 packages — `@capture/core` (pure logic), `@capture/storage` (provider plugins), `@capture/ui` (React components), `@capture/extension` (Chrome MV3 shell). Extension injects a full-page overlay for annotation using Fabric.js.

**Tech Stack:** React 19, TypeScript, Vite + CRXJS, Fabric.js v6, Lucide React, Zustand, Vitest, Playwright

---

## Chunk 1: Monorepo Scaffold

### Task 1: Init repo + pnpm workspace

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `package.json` (root)
- Create: `turbo.json`
- Create: `.gitignore`
- Create: `.nvmrc`

- [ ] **Step 1: Init root package.json**

```bash
cd /Users/vysina/my_workspace/my-browser-screen-capture
pnpm init
```

- [ ] **Step 2: Set node version**

```bash
echo "20" > .nvmrc
```

- [ ] **Step 3: Write pnpm-workspace.yaml**

```yaml
# pnpm-workspace.yaml
packages:
  - "packages/*"
```

- [ ] **Step 4: Write root package.json**

```json
{
  "name": "my-browser-screen-capture",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0",
    "eslint": "^9.0.0",
    "prettier": "^3.2.0"
  }
}
```

- [ ] **Step 5: Write turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

- [ ] **Step 6: Write .gitignore**

```
node_modules/
dist/
.turbo/
*.local
.env
.superpowers/
```

- [ ] **Step 7: Install root deps**

```bash
pnpm install
```

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "chore: init pnpm monorepo with turborepo"
```

---

### Task 2: Shared TypeScript config

**Files:**
- Create: `tsconfig.base.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/storage/tsconfig.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/extension/tsconfig.json`

- [ ] **Step 1: Write tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "isolatedModules": true
  }
}
```

- [ ] **Step 2: Write packages/core/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Write packages/storage/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 3b: Write packages/ui/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Write packages/extension/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: add shared TypeScript configs"
```

---

### Task 3: Scaffold @capture/core package

**Files:**
- Create: `packages/core/package.json`
- Create: `packages/core/src/types.ts`
- Create: `packages/core/src/index.ts`
- Create: `packages/core/vite.config.ts`
- Create: `packages/core/vitest.config.ts`

- [ ] **Step 1: Write packages/core/package.json**

```json
{
  "name": "@capture/core",
  "version": "0.1.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "vite build",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "vite-plugin-dts": "^3.0.0"
  }
}
```

- [ ] **Step 2: Write packages/core/src/types.ts**

```typescript
export interface CaptureMeta {
  id: string
  capturedAt: number
  url: string
  title: string
  width: number
  height: number
  mode: CaptureMode
}

export type CaptureMode =
  | 'visible'
  | 'fullpage'
  | 'region'
  | 'element'
  | 'delayed'

export interface CaptureRecord extends CaptureMeta {
  blob: Blob
  thumbnailDataUrl: string
}

export interface Region {
  x: number
  y: number
  width: number
  height: number
}
```

- [ ] **Step 3: Write packages/core/src/index.ts (barrel)**

```typescript
export * from './types'
export * from './capture'
```

- [ ] **Step 4: Write packages/core/vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [],
    },
  },
  plugins: [dts({ rollupTypes: true })],
})
```

- [ ] **Step 4b: Write packages/core/vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

- [ ] **Step 4c: Create packages/core/src/capture/index.ts stub** (so build succeeds before capture engine is built in Chunk 2)

```typescript
// packages/core/src/capture/index.ts
// populated in Chunk 2
export {}
```

- [ ] **Step 5: Install deps + build**

```bash
cd packages/core && pnpm install && pnpm build
```

Expected: `dist/index.js` and `dist/index.d.ts` created.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "chore: scaffold @capture/core package"
```

---

### Task 4: Scaffold remaining packages

**Files:**
- Create: `packages/storage/package.json`
- Create: `packages/storage/src/index.ts`
- Create: `packages/ui/package.json`
- Create: `packages/ui/src/index.ts`
- Create: `packages/extension/package.json`
- Create: `packages/extension/manifest.json`

- [ ] **Step 1: Write packages/storage/package.json**

```json
{
  "name": "@capture/storage",
  "version": "0.1.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "vite build",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@capture/core": "workspace:*"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "vite-plugin-dts": "^3.0.0"
  }
}
```

- [ ] **Step 2: Write packages/ui/package.json**

```json
{
  "name": "@capture/ui",
  "version": "0.1.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "vite build",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@capture/core": "workspace:*",
    "@capture/storage": "workspace:*",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "fabric": "^6.0.0",
    "lucide-react": "^0.400.0",
    "zustand": "^4.0.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.0.0",
    "vite-plugin-dts": "^3.0.0"
  }
}
```

- [ ] **Step 3: Write packages/extension/package.json**

```json
{
  "name": "@capture/extension",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@capture/core": "workspace:*",
    "@capture/storage": "workspace:*",
    "@capture/ui": "workspace:*",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "@crxjs/vite-plugin": "^2.0.0-beta"
  }
}
```

- [ ] **Step 4: Write packages/extension/manifest.json**

```json
{
  "manifest_version": 3,
  "name": "Screen Capture",
  "version": "0.1.0",
  "description": "Open-source screen capture with annotation",
  "permissions": [
    "activeTab",
    "tabs",
    "storage",
    "scripting",
    "tabCapture"
  ],
  "host_permissions": ["<all_urls>"],
  "action": {
    "default_popup": "src/popup/index.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "src/background/service-worker.ts",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["src/content/overlay.ts"],
      "run_at": "document_idle"
    }
  ],
  "options_page": "src/options/index.html"
}
```

- [ ] **Step 5: Install all workspace deps**

```bash
cd /Users/vysina/my_workspace/my-browser-screen-capture
pnpm install
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "chore: scaffold @capture/storage, @capture/ui, @capture/extension packages"
```

---

## Chunk 2: @capture/core Capture Engine

### Task 5: Visible area capture

**Files:**
- Create: `packages/core/src/capture/visible.ts`
- Create: `packages/core/src/capture/index.ts`
- Create: `packages/core/tests/capture/visible.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// packages/core/tests/capture/visible.test.ts
import { describe, it, expect, vi } from 'vitest'
import { cropImageData } from '../../src/capture/visible'

describe('cropImageData', () => {
  it('crops a data URL to the given region', async () => {
    // Create a 100x100 red canvas
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 100
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = 'red'
    ctx.fillRect(0, 0, 100, 100)
    const dataUrl = canvas.toDataURL()

    const cropped = await cropImageData(dataUrl, { x: 0, y: 0, width: 50, height: 50 })
    expect(cropped).toMatch(/^data:image\/png/)
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd packages/core && pnpm test -- visible
```

Expected: `cropImageData is not a function` or import error.

- [ ] **Step 3: Implement visible.ts**

```typescript
// packages/core/src/capture/visible.ts
import type { Region } from '../types'

/**
 * Crops a PNG data URL to the given region using an offscreen canvas.
 * Works in both browser and jsdom (test) environments.
 */
export async function cropImageData(dataUrl: string, region: Region): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = region.width
      canvas.height = region.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('canvas context unavailable'))
      ctx.drawImage(img, region.x, region.y, region.width, region.height, 0, 0, region.width, region.height)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = dataUrl
  })
}

/**
 * Converts a data URL to a Blob.
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png'
  const bytes = atob(data)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new Blob([arr], { type: mime })
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
cd packages/core && pnpm test -- visible
```

Expected: `✓ crops a data URL to the given region`

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat(core): add cropImageData and dataUrlToBlob utilities"
```

---

### Task 6: Full-page capture stitch engine

**Files:**
- Create: `packages/core/src/capture/fullpage.ts`
- Create: `packages/core/tests/capture/fullpage.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// packages/core/tests/capture/fullpage.test.ts
import { describe, it, expect } from 'vitest'
import { stitchFrames } from '../../src/capture/fullpage'

describe('stitchFrames', () => {
  it('stitches two equally-sized frames vertically', async () => {
    const makeFrame = (color: string): Promise<string> =>
      new Promise(resolve => {
        const c = document.createElement('canvas')
        c.width = 100; c.height = 200
        const ctx = c.getContext('2d')!
        ctx.fillStyle = color
        ctx.fillRect(0, 0, 100, 200)
        resolve(c.toDataURL())
      })

    const frames = await Promise.all([makeFrame('red'), makeFrame('blue')])
    const result = await stitchFrames(frames, 100, 200)
    expect(result).toMatch(/^data:image\/png/)
  })

  it('throws when frames array is empty', async () => {
    await expect(stitchFrames([], 100, 200)).rejects.toThrow('No frames')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd packages/core && pnpm test -- fullpage
```

- [ ] **Step 3: Implement fullpage.ts**

```typescript
// packages/core/src/capture/fullpage.ts

/**
 * Stitches an array of viewport-height data URLs into one tall image.
 * @param frames - ordered array of PNG data URLs (top to bottom)
 * @param viewportWidth - width of each frame in px
 * @param viewportHeight - height of each frame in px
 */
export async function stitchFrames(
  frames: string[],
  viewportWidth: number,
  viewportHeight: number,
): Promise<string> {
  if (frames.length === 0) throw new Error('No frames to stitch')

  const totalHeight = viewportHeight * frames.length
  const canvas = document.createElement('canvas')
  canvas.width = viewportWidth
  canvas.height = totalHeight
  const ctx = canvas.getContext('2d')!

  for (let i = 0; i < frames.length; i++) {
    await new Promise<void>((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, i * viewportHeight)
        resolve()
      }
      img.onerror = reject
      img.src = frames[i]
    })
  }

  return canvas.toDataURL('image/png')
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
cd packages/core && pnpm test -- fullpage
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat(core): add full-page frame stitching engine"
```

---

### Task 7: Region crop + element capture helpers

**Files:**
- Create: `packages/core/src/capture/region.ts`
- Create: `packages/core/src/capture/element.ts`
- Create: `packages/core/tests/capture/region.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// packages/core/tests/capture/region.test.ts
import { describe, it, expect } from 'vitest'
import { clipRegion } from '../../src/capture/region'
import { elementToRegion } from '../../src/capture/element'

describe('clipRegion', () => {
  it('clamps region to image bounds', () => {
    const result = clipRegion({ x: -10, y: -10, width: 200, height: 200 }, 100, 100)
    expect(result).toEqual({ x: 0, y: 0, width: 100, height: 100 })
  })

  it('returns region as-is when within bounds', () => {
    const region = { x: 10, y: 10, width: 50, height: 50 }
    expect(clipRegion(region, 100, 100)).toEqual(region)
  })
})

describe('elementToRegion', () => {
  it('converts DOMRect to Region', () => {
    const rect = { x: 20, y: 30, width: 80, height: 40, top: 30, left: 20, right: 100, bottom: 70 } as DOMRect
    expect(elementToRegion(rect, 1)).toEqual({ x: 20, y: 30, width: 80, height: 40 })
  })

  it('applies devicePixelRatio scaling', () => {
    const rect = { x: 10, y: 10, width: 50, height: 50 } as DOMRect
    expect(elementToRegion(rect, 2)).toEqual({ x: 20, y: 20, width: 100, height: 100 })
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd packages/core && pnpm test -- region
```

- [ ] **Step 3: Implement region.ts**

```typescript
// packages/core/src/capture/region.ts
import type { Region } from '../types'

export function clipRegion(region: Region, imageWidth: number, imageHeight: number): Region {
  const x = Math.max(0, region.x)
  const y = Math.max(0, region.y)
  const width = Math.min(region.width + Math.min(0, region.x), imageWidth - x)
  const height = Math.min(region.height + Math.min(0, region.y), imageHeight - y)
  return { x, y, width, height }
}
```

- [ ] **Step 4: Implement element.ts**

```typescript
// packages/core/src/capture/element.ts
import type { Region } from '../types'

export function elementToRegion(rect: DOMRect, devicePixelRatio: number): Region {
  return {
    x: Math.round(rect.x * devicePixelRatio),
    y: Math.round(rect.y * devicePixelRatio),
    width: Math.round(rect.width * devicePixelRatio),
    height: Math.round(rect.height * devicePixelRatio),
  }
}
```

- [ ] **Step 5: Run test — expect PASS**

```bash
cd packages/core && pnpm test -- region
```

- [ ] **Step 6: Update capture/index.ts barrel**

```typescript
// packages/core/src/capture/index.ts
export * from './visible'
export * from './fullpage'
export * from './region'
export * from './element'
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat(core): add region clip and element-to-region helpers"
```

---

## Chunk 3: @capture/storage Provider System

### Task 8: StorageProvider interface + registry

**Files:**
- Create: `packages/storage/src/interface.ts`
- Create: `packages/storage/src/registry.ts`
- Create: `packages/storage/src/index.ts`
- Create: `packages/storage/tests/registry.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// packages/storage/tests/registry.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { ProviderRegistry } from '../../src/registry'
import type { StorageProvider } from '../../src/interface'

const mockProvider: StorageProvider = {
  id: 'mock',
  name: 'Mock Provider',
  upload: async () => ({ id: '1', url: 'http://example.com/1' }),
  getHistory: async () => [],
  delete: async () => {},
  configure: () => {},
}

describe('ProviderRegistry', () => {
  let registry: ProviderRegistry

  beforeEach(() => { registry = new ProviderRegistry() })

  it('registers and retrieves a provider by id', () => {
    registry.register(mockProvider)
    expect(registry.get('mock')).toBe(mockProvider)
  })

  it('throws when retrieving unregistered provider', () => {
    expect(() => registry.get('unknown')).toThrow('Provider "unknown" not found')
  })

  it('lists all registered providers', () => {
    registry.register(mockProvider)
    expect(registry.list()).toHaveLength(1)
    expect(registry.list()[0].id).toBe('mock')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd packages/storage && pnpm test -- registry
```

- [ ] **Step 3: Implement interface.ts**

```typescript
// packages/storage/src/interface.ts
import type { CaptureMeta, CaptureRecord } from '@capture/core'

export interface UploadResult {
  id: string
  url: string
  shareUrl?: string
}

export interface StorageProvider {
  id: string
  name: string
  upload(blob: Blob, meta: CaptureMeta): Promise<UploadResult>
  getHistory(): Promise<CaptureRecord[]>
  delete(id: string): Promise<void>
  configure(settings: Record<string, unknown>): void
  getShareUrl?(id: string): Promise<string>
}
```

- [ ] **Step 4: Implement registry.ts**

```typescript
// packages/storage/src/registry.ts
import type { StorageProvider } from './interface'

export class ProviderRegistry {
  private providers = new Map<string, StorageProvider>()

  register(provider: StorageProvider): void {
    this.providers.set(provider.id, provider)
  }

  get(id: string): StorageProvider {
    const provider = this.providers.get(id)
    if (!provider) throw new Error(`Provider "${id}" not found`)
    return provider
  }

  list(): StorageProvider[] {
    return Array.from(this.providers.values())
  }
}
```

- [ ] **Step 5: Run test — expect PASS**

```bash
cd packages/storage && pnpm test -- registry
```

- [ ] **Step 6: Write packages/storage/src/index.ts** (barrel — providers added as they are implemented in Tasks 9-10)

```typescript
// packages/storage/src/index.ts
export * from './interface'
export * from './registry'
// providers added below as each is implemented
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat(storage): add StorageProvider interface and ProviderRegistry"
```

---

### Task 9: LocalProvider (IndexedDB)

**Files:**
- Create: `packages/storage/src/providers/local.ts`
- Create: `packages/storage/tests/providers/local.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// packages/storage/tests/providers/local.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { LocalProvider } from '../../src/providers/local'
import type { CaptureMeta } from '@capture/core'

const meta: CaptureMeta = {
  id: 'test-1',
  capturedAt: Date.now(),
  url: 'https://example.com',
  title: 'Test',
  width: 800,
  height: 600,
  mode: 'visible',
}

describe('LocalProvider', () => {
  let provider: LocalProvider

  beforeEach(() => { provider = new LocalProvider() })

  it('uploads a blob and returns a local object URL', async () => {
    const blob = new Blob(['fake-image'], { type: 'image/png' })
    const result = await provider.upload(blob, meta)
    expect(result.id).toBe(meta.id)
    expect(result.url).toMatch(/^blob:|^data:/)
  })

  it('returns empty history initially', async () => {
    const history = await provider.getHistory()
    expect(history).toEqual([])
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd packages/storage && pnpm test -- local
```

- [ ] **Step 3: Implement local.ts**

```typescript
// packages/storage/src/providers/local.ts
import type { StorageProvider, UploadResult } from '../interface'
import type { CaptureMeta, CaptureRecord } from '@capture/core'

const DB_NAME = 'capture-local-storage'
const STORE_NAME = 'captures'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export class LocalProvider implements StorageProvider {
  id = 'local'
  name = 'Local Storage'

  configure(_settings: Record<string, unknown>): void {}

  async upload(blob: Blob, meta: CaptureMeta): Promise<UploadResult> {
    const arrayBuffer = await blob.arrayBuffer()
    const thumbnailDataUrl = await this.makeThumbnail(blob)

    const record: CaptureRecord = {
      ...meta,
      blob,
      thumbnailDataUrl,
    }

    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put({ ...record, buffer: arrayBuffer })
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })

    const url = URL.createObjectURL(blob)
    return { id: meta.id, url }
  }

  async getHistory(): Promise<CaptureRecord[]> {
    try {
      const db = await openDb()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const req = tx.objectStore(STORE_NAME).getAll()
        req.onsuccess = () => {
          const records = req.result.map((r: any) => ({
            ...r,
            blob: new Blob([r.buffer], { type: 'image/png' }),
          }))
          resolve(records.sort((a: CaptureRecord, b: CaptureRecord) => b.capturedAt - a.capturedAt))
        }
        req.onerror = () => reject(req.error)
      })
    } catch {
      return []
    }
  }

  async delete(id: string): Promise<void> {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).delete(id)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  private makeThumbnail(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(blob)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const scale = Math.min(1, 160 / img.width)
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        URL.revokeObjectURL(url)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.onerror = reject
      img.src = url
    })
  }
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
cd packages/storage && pnpm test -- local
```

- [ ] **Step 5: Update storage/src/index.ts to export LocalProvider**

Append to `packages/storage/src/index.ts`:

```typescript
export * from './providers/local'
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat(storage): implement LocalProvider with IndexedDB persistence"
```

---

### Task 10: ImgurProvider

**Files:**
- Create: `packages/storage/src/providers/imgur.ts`
- Create: `packages/storage/tests/providers/imgur.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// packages/storage/tests/providers/imgur.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ImgurProvider } from '../../src/providers/imgur'

describe('ImgurProvider', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { id: 'abc123', link: 'https://i.imgur.com/abc123.png', deletehash: 'del123' },
      }),
    })
  })

  it('uploads blob to Imgur and returns link', async () => {
    const provider = new ImgurProvider()
    const blob = new Blob(['fake'], { type: 'image/png' })
    const result = await provider.upload(blob, {
      id: '1', capturedAt: 0, url: '', title: '', width: 0, height: 0, mode: 'visible',
    })
    expect(result.url).toBe('https://i.imgur.com/abc123.png')
    expect(result.shareUrl).toBe('https://imgur.com/abc123')
  })

  it('throws on Imgur API error', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) })
    const provider = new ImgurProvider()
    await expect(
      provider.upload(new Blob(['x']), {
        id: '1', capturedAt: 0, url: '', title: '', width: 0, height: 0, mode: 'visible',
      }),
    ).rejects.toThrow('Imgur upload failed')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd packages/storage && pnpm test -- imgur
```

- [ ] **Step 3: Implement imgur.ts**

```typescript
// packages/storage/src/providers/imgur.ts
import type { StorageProvider, UploadResult } from '../interface'
import type { CaptureMeta, CaptureRecord } from '@capture/core'

const IMGUR_API = 'https://api.imgur.com/3/image'

export class ImgurProvider implements StorageProvider {
  id = 'imgur'
  name = 'Imgur (Anonymous)'
  private clientId = 'YOUR_IMGUR_CLIENT_ID'

  configure(settings: Record<string, unknown>): void {
    if (typeof settings.clientId === 'string') this.clientId = settings.clientId
  }

  async upload(blob: Blob, _meta: CaptureMeta): Promise<UploadResult> {
    const form = new FormData()
    form.append('image', blob, 'capture.png')
    form.append('type', 'file')

    const res = await fetch(IMGUR_API, {
      method: 'POST',
      headers: { Authorization: `Client-ID ${this.clientId}` },
      body: form,
    })

    if (!res.ok) throw new Error('Imgur upload failed')

    const { data } = await res.json()
    return {
      id: data.id,
      url: data.link,
      shareUrl: `https://imgur.com/${data.id}`,
    }
  }

  async getHistory(): Promise<CaptureRecord[]> {
    return [] // Imgur anonymous uploads are not listable
  }

  async delete(_id: string): Promise<void> {
    // Would need deletehash stored separately — not implemented for anonymous uploads
  }

  async getShareUrl(id: string): Promise<string> {
    return `https://imgur.com/${id}`
  }
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
cd packages/storage && pnpm test -- imgur
```

- [ ] **Step 5: Update storage/src/index.ts to export ImgurProvider**

Append to `packages/storage/src/index.ts`:

```typescript
export * from './providers/imgur'
```

- [ ] **Step 5b: Add S3Provider (Google Drive and Dropbox use OAuth — deferred to post-MVP; S3 uses access keys and is included in v1)**

```typescript
// packages/storage/src/providers/s3.ts
import type { StorageProvider, UploadResult } from '../interface'
import type { CaptureMeta, CaptureRecord } from '@capture/core'

export class S3Provider implements StorageProvider {
  id = 's3'
  name = 'S3-Compatible Storage'
  private endpoint = ''
  private bucket = ''
  private accessKey = ''
  private secretKey = ''

  configure(settings: Record<string, unknown>): void {
    if (typeof settings.endpoint === 'string') this.endpoint = settings.endpoint
    if (typeof settings.bucket === 'string') this.bucket = settings.bucket
    if (typeof settings.accessKey === 'string') this.accessKey = settings.accessKey
    if (typeof settings.secretKey === 'string') this.secretKey = settings.secretKey
  }

  async upload(_blob: Blob, meta: CaptureMeta): Promise<UploadResult> {
    if (!this.endpoint || !this.bucket) throw new Error('S3Provider not configured')
    // Full S3 presigned upload implementation — see AWS S3 PutObject docs
    throw new Error('S3Provider.upload: not yet implemented')
  }

  async getHistory(): Promise<CaptureRecord[]> { return [] }
  async delete(_id: string): Promise<void> {}
}
```

- [ ] **Step 6: Write S3Provider test**

```typescript
// packages/storage/tests/providers/s3.test.ts
import { describe, it, expect } from 'vitest'
import { S3Provider } from '../../src/providers/s3'

describe('S3Provider', () => {
  it('throws when upload is called without configuration', async () => {
    const provider = new S3Provider()
    await expect(
      provider.upload(new Blob(['x']), {
        id: '1', capturedAt: 0, url: '', title: '', width: 0, height: 0, mode: 'visible',
      }),
    ).rejects.toThrow('S3Provider not configured')
  })

  it('accepts configuration without throwing', () => {
    const provider = new S3Provider()
    expect(() =>
      provider.configure({ endpoint: 'https://s3.example.com', bucket: 'my-bucket', accessKey: 'key', secretKey: 'secret' }),
    ).not.toThrow()
  })
})
```

- [ ] **Step 7: Run S3Provider test — expect PASS**

```bash
cd packages/storage && pnpm test -- s3
```

- [ ] **Step 8: Update storage/src/index.ts to export S3Provider**

Append to `packages/storage/src/index.ts`:

```typescript
export * from './providers/s3'
```

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat(storage): implement ImgurProvider and S3Provider with tests"
```

---

## Chunk 4: @capture/ui — Popup Components

### Task 11: Popup shell + CaptureTab

**Files:**
- Create: `packages/ui/src/popup/Popup.tsx`
- Create: `packages/ui/src/popup/CaptureTab.tsx`
- Create: `packages/ui/src/popup/popup.css`
- Create: `packages/ui/vitest.config.ts`
- Create: `packages/ui/tests/popup/CaptureTab.test.tsx`

- [ ] **Step 1: Write packages/ui/vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
})
```

- [ ] **Step 1b: Write packages/ui/tests/setup.ts**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 1c: Write failing test**

```typescript
// packages/ui/tests/popup/CaptureTab.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CaptureTab } from '../../src/popup/CaptureTab'

describe('CaptureTab', () => {
  it('renders all 5 capture mode buttons', () => {
    render(<CaptureTab onCapture={vi.fn()} />)
    expect(screen.getByText('Visible Area')).toBeInTheDocument()
    expect(screen.getByText('Full Page')).toBeInTheDocument()
    expect(screen.getByText('Select Region')).toBeInTheDocument()
    expect(screen.getByText('Element')).toBeInTheDocument()
    expect(screen.getByText('Delayed')).toBeInTheDocument()
  })

  it('calls onCapture with the correct mode when clicked', () => {
    const onCapture = vi.fn()
    render(<CaptureTab onCapture={onCapture} />)
    fireEvent.click(screen.getByText('Full Page'))
    expect(onCapture).toHaveBeenCalledWith('fullpage')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd packages/ui && pnpm test -- CaptureTab
```

- [ ] **Step 3: Implement CaptureTab.tsx**

```tsx
// packages/ui/src/popup/CaptureTab.tsx
import { Monitor, FileText, Scissors, Square, Timer } from 'lucide-react'
import type { CaptureMode } from '@capture/core'

interface Props {
  onCapture: (mode: CaptureMode) => void
}

const MODES: { mode: CaptureMode; label: string; sub: string; Icon: React.FC<any> }[] = [
  { mode: 'visible', label: 'Visible Area', sub: 'Current viewport', Icon: Monitor },
  { mode: 'fullpage', label: 'Full Page', sub: 'Scroll & stitch', Icon: FileText },
  { mode: 'region', label: 'Select Region', sub: 'Drag to select', Icon: Scissors },
  { mode: 'element', label: 'Element', sub: 'Click to pick', Icon: Square },
  { mode: 'delayed', label: 'Delayed', sub: 'After 3s', Icon: Timer },
]

export function CaptureTab({ onCapture }: Props) {
  return (
    <div className="capture-tab">
      <p className="section-label">Screenshot Mode</p>
      <div className="capture-grid">
        {MODES.map(({ mode, label, sub, Icon }) => (
          <button key={mode} className="capture-btn" onClick={() => onCapture(mode)}>
            <Icon size={22} />
            <span className="btn-label">{label}</span>
            <span className="btn-sub">{sub}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
cd packages/ui && pnpm test -- CaptureTab
```

- [ ] **Step 5: Write packages/ui/src/popup/popup.css**

```css
/* packages/ui/src/popup/popup.css */
.popup { width: 320px; background: #fff; border-radius: 12px; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #222; }
.popup-header { background: linear-gradient(135deg, #ff6b35, #ff4757); padding: 14px 16px; display: flex; align-items: center; gap: 10px; }
.popup-logo { width: 28px; height: 28px; }
.popup-title { color: white; font-size: 15px; font-weight: 600; }
.popup-subtitle { color: rgba(255,255,255,0.8); font-size: 11px; }
.popup-tabs { display: flex; border-bottom: 1px solid #eee; background: #f8f8f8; }
.popup-tab { flex: 1; padding: 10px; font-size: 12px; font-weight: 500; color: #888; cursor: pointer; border: none; background: none; border-bottom: 2px solid transparent; }
.popup-tab.active { color: #ff4757; border-bottom-color: #ff4757; background: white; }
.popup-body { padding: 14px; }
.section-label { font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
.capture-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
.capture-btn { background: #f5f5f5; border: 1.5px solid #e8e8e8; border-radius: 10px; padding: 12px 8px; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.capture-btn:hover { background: #fff0f0; border-color: #ff4757; }
.btn-label { font-size: 11px; color: #444; font-weight: 500; }
.btn-sub { font-size: 9px; color: #aaa; }
.record-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.empty-state { font-size: 12px; color: #aaa; text-align: center; padding: 2rem 0; }
.history-list { list-style: none; padding: 0; margin: 0; }
.history-item { display: flex; gap: 8px; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
.history-thumb { width: 36px; height: 26px; object-fit: cover; border-radius: 4px; background: #f0f0f0; }
.history-info { flex: 1; min-width: 0; }
.history-name { font-size: 10px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.history-time { font-size: 9px; color: #aaa; }
.history-actions { display: flex; gap: 4px; }
.history-actions button { width: 22px; height: 22px; border: none; background: #f0f0f0; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.history-actions button:hover { background: #ffe0e3; }
```

- [ ] **Step 6: Implement Popup.tsx shell** (uses SVG logo, wires HistoryTab)

```tsx
// packages/ui/src/popup/Popup.tsx
import { useState } from 'react'
import { Camera } from 'lucide-react'
import { CaptureTab } from './CaptureTab'
import { HistoryTab } from './HistoryTab'
import type { CaptureMode, CaptureRecord } from '@capture/core'
import './popup.css'

type Tab = 'capture' | 'record' | 'history'

interface Props {
  onCapture: (mode: CaptureMode) => void
  onRecord: (type: 'tab' | 'screen') => void
  history?: CaptureRecord[]
  onDeleteHistory?: (id: string) => void
  onCopyHistory?: (record: CaptureRecord) => void
}

export function Popup({ onCapture, onRecord, history = [], onDeleteHistory, onCopyHistory }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('capture')

  return (
    <div className="popup">
      <header className="popup-header">
        <Camera size={28} color="white" className="popup-logo" aria-hidden />
        <div>
          <div className="popup-title">Screen Capture</div>
          <div className="popup-subtitle">Open source · Local first</div>
        </div>
      </header>

      <nav className="popup-tabs">
        {(['capture', 'record', 'history'] as Tab[]).map(tab => (
          <button
            key={tab}
            className={`popup-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      <div className="popup-body">
        {activeTab === 'capture' && <CaptureTab onCapture={onCapture} />}
        {activeTab === 'record' && (
          <div className="record-grid">
            <button className="capture-btn" onClick={() => onRecord('tab')}>
              🎬 <span className="btn-label">Record Tab</span>
            </button>
            <button className="capture-btn" onClick={() => onRecord('screen')}>
              🖥 <span className="btn-label">Record Screen</span>
            </button>
          </div>
        )}
        {activeTab === 'history' && (
          <HistoryTab
            records={history}
            onDelete={onDeleteHistory ?? (() => {})}
            onCopy={onCopyHistory ?? (() => {})}
          />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat(ui): add Popup shell and CaptureTab with all 5 modes"
```

---

### Task 12: HistoryTab component

**Files:**
- Create: `packages/ui/src/popup/HistoryTab.tsx`
- Create: `packages/ui/tests/popup/HistoryTab.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// packages/ui/tests/popup/HistoryTab.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HistoryTab } from '../../src/popup/HistoryTab'
import type { CaptureRecord } from '@capture/core'

const record: CaptureRecord = {
  id: 'r1', capturedAt: Date.now(), url: 'https://x.com', title: 'X',
  width: 800, height: 600, mode: 'visible',
  blob: new Blob(['x'], { type: 'image/png' }),
  thumbnailDataUrl: 'data:image/png;base64,abc',
}

describe('HistoryTab', () => {
  it('shows a thumbnail for each record', () => {
    render(<HistoryTab records={[record]} onDelete={vi.fn()} onCopy={vi.fn()} />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('shows empty state when no records', () => {
    render(<HistoryTab records={[]} onDelete={vi.fn()} onCopy={vi.fn()} />)
    expect(screen.getByText(/no captures/i)).toBeInTheDocument()
  })

  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn()
    render(<HistoryTab records={[record]} onDelete={onDelete} onCopy={vi.fn()} />)
    fireEvent.click(screen.getByTitle('Delete'))
    expect(onDelete).toHaveBeenCalledWith('r1')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd packages/ui && pnpm test -- HistoryTab
```

- [ ] **Step 3: Implement HistoryTab.tsx**

```tsx
// packages/ui/src/popup/HistoryTab.tsx
import { Clipboard, Trash2 } from 'lucide-react'
import type { CaptureRecord } from '@capture/core'

interface Props {
  records: CaptureRecord[]
  onDelete: (id: string) => void
  onCopy: (record: CaptureRecord) => void
}

export function HistoryTab({ records, onDelete, onCopy }: Props) {
  if (records.length === 0) {
    return <p className="empty-state">No captures yet</p>
  }

  return (
    <ul className="history-list">
      {records.map(record => (
        <li key={record.id} className="history-item">
          <img
            src={record.thumbnailDataUrl}
            alt={record.title}
            className="history-thumb"
          />
          <div className="history-info">
            <p className="history-name">{record.title || record.url}</p>
            <p className="history-time">{new Date(record.capturedAt).toLocaleTimeString()}</p>
          </div>
          <div className="history-actions">
            <button title="Copy" onClick={() => onCopy(record)}>
              <Clipboard size={14} />
            </button>
            <button title="Delete" onClick={() => onDelete(record.id)}>
              <Trash2 size={14} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
cd packages/ui && pnpm test -- HistoryTab
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat(ui): add HistoryTab with thumbnail grid and delete/copy actions"
```

---

## Chunk 5: @capture/ui — Annotation Editor

### Task 13: useUndoRedo hook

**Files:**
- Create: `packages/ui/src/annotation/useUndoRedo.ts`
- Create: `packages/ui/tests/annotation/useUndoRedo.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// packages/ui/tests/annotation/useUndoRedo.test.ts
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUndoRedo } from '../../src/annotation/useUndoRedo'

describe('useUndoRedo', () => {
  it('starts with empty stacks', () => {
    const { result } = renderHook(() => useUndoRedo())
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
  })

  it('push enables undo', () => {
    const { result } = renderHook(() => useUndoRedo())
    act(() => result.current.push('state-1'))
    expect(result.current.canUndo).toBe(true)
  })

  it('undo returns previous state and enables redo', () => {
    const { result } = renderHook(() => useUndoRedo<string>())
    act(() => {
      result.current.push('a')
      result.current.push('b')
    })
    act(() => result.current.undo())
    expect(result.current.canRedo).toBe(true)
  })

  it('redo re-applies undone state', () => {
    const { result } = renderHook(() => useUndoRedo<string>())
    act(() => {
      result.current.push('a')
      result.current.push('b')
      result.current.undo()
      result.current.redo()
    })
    expect(result.current.canRedo).toBe(false)
    expect(result.current.canUndo).toBe(true)
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd packages/ui && pnpm test -- useUndoRedo
```

- [ ] **Step 3: Implement useUndoRedo.ts**

```typescript
// packages/ui/src/annotation/useUndoRedo.ts
import { useState, useCallback } from 'react'

export function useUndoRedo<T>() {
  const [past, setPast] = useState<T[]>([])
  const [future, setFuture] = useState<T[]>([])

  const push = useCallback((state: T) => {
    setPast(p => [...p, state])
    setFuture([])
  }, [])

  const undo = useCallback(() => {
    setPast(p => {
      if (p.length === 0) return p
      const next = [...p]
      const popped = next.pop()!
      setFuture(f => [popped, ...f])
      return next
    })
  }, [])

  const redo = useCallback(() => {
    setFuture(f => {
      if (f.length === 0) return f
      const next = [...f]
      const popped = next.shift()!
      setPast(p => [...p, popped])
      return next
    })
  }, [])

  return {
    push,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  }
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
cd packages/ui && pnpm test -- useUndoRedo
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat(ui): add useUndoRedo hook for annotation history"
```

---

### Task 14: Annotation Toolbar component

**Files:**
- Create: `packages/ui/src/annotation/Toolbar.tsx`
- Create: `packages/ui/tests/annotation/Toolbar.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// packages/ui/tests/annotation/Toolbar.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Toolbar } from '../../src/annotation/Toolbar'

const noop = vi.fn()

describe('Toolbar', () => {
  it('renders all 8 annotation tools', () => {
    render(
      <Toolbar activeTool="arrow" onToolChange={noop} color="#ff0000"
        onColorChange={noop} strokeWidth={3} onStrokeChange={noop}
        canUndo={false} canRedo={false} onUndo={noop} onRedo={noop}
        onSave={noop} onDone={noop} />
    )
    expect(screen.getByTitle('Arrow')).toBeInTheDocument()
    expect(screen.getByTitle('Rectangle')).toBeInTheDocument()
    expect(screen.getByTitle('Circle')).toBeInTheDocument()
    expect(screen.getByTitle('Text')).toBeInTheDocument()
    expect(screen.getByTitle('Pen')).toBeInTheDocument()
    expect(screen.getByTitle('Blur')).toBeInTheDocument()
    expect(screen.getByTitle('Highlight')).toBeInTheDocument()
    expect(screen.getByTitle('Counter')).toBeInTheDocument()
  })

  it('calls onToolChange when a tool is clicked', () => {
    const onToolChange = vi.fn()
    render(
      <Toolbar activeTool="arrow" onToolChange={onToolChange} color="#ff0000"
        onColorChange={noop} strokeWidth={3} onStrokeChange={noop}
        canUndo={false} canRedo={false} onUndo={noop} onRedo={noop}
        onSave={noop} onDone={noop} />
    )
    fireEvent.click(screen.getByTitle('Rectangle'))
    expect(onToolChange).toHaveBeenCalledWith('rect')
  })

  it('disables Undo button when canUndo is false', () => {
    render(
      <Toolbar activeTool="arrow" onToolChange={noop} color="#ff0000"
        onColorChange={noop} strokeWidth={3} onStrokeChange={noop}
        canUndo={false} canRedo={false} onUndo={noop} onRedo={noop}
        onSave={noop} onDone={noop} />
    )
    expect(screen.getByText('Undo')).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd packages/ui && pnpm test -- Toolbar
```

- [ ] **Step 3: Implement Toolbar.tsx**

```tsx
// packages/ui/src/annotation/Toolbar.tsx
import {
  ArrowRight, Square, Circle, Type, Pen,
  EyeOff, Highlighter, Hash, Undo2, Redo2, Download, Check
} from 'lucide-react'

export type AnnotationTool = 'arrow' | 'rect' | 'circle' | 'text' | 'pen' | 'blur' | 'highlight' | 'counter'

const TOOLS: { id: AnnotationTool; label: string; Icon: React.FC<any> }[] = [
  { id: 'arrow',     label: 'Arrow',     Icon: ArrowRight },
  { id: 'rect',      label: 'Rectangle', Icon: Square },
  { id: 'circle',    label: 'Circle',    Icon: Circle },
  { id: 'text',      label: 'Text',      Icon: Type },
  { id: 'pen',       label: 'Pen',       Icon: Pen },
  { id: 'blur',      label: 'Blur',      Icon: EyeOff },
  { id: 'highlight', label: 'Highlight', Icon: Highlighter },
  { id: 'counter',   label: 'Counter',   Icon: Hash },
]

const PRESET_COLORS = ['#ff4757', '#2ed573', '#1e90ff', '#ffd32a', '#ffffff', '#000000']

interface Props {
  activeTool: AnnotationTool
  onToolChange: (tool: AnnotationTool) => void
  color: string
  onColorChange: (color: string) => void
  strokeWidth: number
  onStrokeChange: (width: number) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onSave: () => void
  onDone: () => void
}

export function Toolbar({
  activeTool, onToolChange, color, onColorChange,
  strokeWidth, onStrokeChange, canUndo, canRedo,
  onUndo, onRedo, onSave, onDone,
}: Props) {
  return (
    <div className="anno-toolbar">
      {TOOLS.map(({ id, label, Icon }) => (
        <button
          key={id}
          title={label}
          className={`tool-btn ${activeTool === id ? 'active' : ''}`}
          onClick={() => onToolChange(id)}
        >
          <Icon size={16} />
        </button>
      ))}

      <div className="toolbar-sep" />

      {PRESET_COLORS.map(c => (
        <button
          key={c}
          className={`color-swatch ${color === c ? 'selected' : ''}`}
          style={{ background: c }}
          onClick={() => onColorChange(c)}
          title={c}
        />
      ))}

      <input
        type="range" min={1} max={12} value={strokeWidth}
        onChange={e => onStrokeChange(Number(e.target.value))}
        className="stroke-slider"
        title="Stroke width"
      />

      <div className="toolbar-sep" />

      <button onClick={onUndo} disabled={!canUndo} className="tool-action">
        <Undo2 size={14} /> Undo
      </button>
      <button onClick={onRedo} disabled={!canRedo} className="tool-action">
        <Redo2 size={14} /> Redo
      </button>

      <div className="toolbar-spacer" />

      <button onClick={onSave} className="btn-save">
        <Download size={14} /> Save
      </button>
      <button onClick={onDone} className="btn-done">
        <Check size={14} /> Done
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
cd packages/ui && pnpm test -- Toolbar
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat(ui): add Toolbar component with all 8 annotation tools"
```

---

### Task 15: AnnotationEditor (Fabric.js canvas)

**Files:**
- Create: `packages/ui/src/annotation/Canvas.tsx`
- Create: `packages/ui/src/annotation/AnnotationEditor.tsx`

- [ ] **Step 1: Implement Canvas.tsx (Fabric.js wrapper)**

```tsx
// packages/ui/src/annotation/Canvas.tsx
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Canvas as FabricCanvas, FabricImage } from 'fabric'

export interface CanvasHandle {
  fabricCanvas: FabricCanvas | null
  toDataURL: () => string
}

interface Props {
  backgroundDataUrl: string
  width: number
  height: number
}

export const Canvas = forwardRef<CanvasHandle, Props>(({ backgroundDataUrl, width, height }, ref) => {
  const canvasEl = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<FabricCanvas | null>(null)

  useImperativeHandle(ref, () => ({
    get fabricCanvas() { return fabricRef.current },
    toDataURL() {
      return fabricRef.current?.toDataURL({ format: 'png', multiplier: 1 }) ?? ''
    },
  }))

  useEffect(() => {
    if (!canvasEl.current) return
    const fc = new FabricCanvas(canvasEl.current, {
      width,
      height,
      isDrawingMode: false,
    })
    fabricRef.current = fc

    FabricImage.fromURL(backgroundDataUrl).then(img => {
      img.set({ selectable: false, evented: false })
      fc.backgroundImage = img
      fc.renderAll()
    })

    return () => { fc.dispose(); fabricRef.current = null }
  }, [backgroundDataUrl, width, height])

  return <canvas ref={canvasEl} />
})

Canvas.displayName = 'Canvas'
```

- [ ] **Step 1b: Write Canvas.tsx smoke test**

```typescript
// packages/ui/tests/annotation/Canvas.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { Canvas } from '../../src/annotation/Canvas'

// Stub Fabric.js canvas — not available in jsdom
vi.mock('fabric', () => ({
  Canvas: vi.fn().mockImplementation(() => ({
    dispose: vi.fn(),
    renderAll: vi.fn(),
    toDataURL: vi.fn(() => 'data:image/png;base64,stub'),
    set: vi.fn(),
    backgroundImage: null,
  })),
  FabricImage: {
    fromURL: vi.fn().mockResolvedValue({ set: vi.fn() }),
  },
}))

describe('Canvas', () => {
  it('renders a canvas element', () => {
    const { container } = render(
      <Canvas ref={null} backgroundDataUrl="data:image/png;base64,abc" width={800} height={600} />
    )
    expect(container.querySelector('canvas')).not.toBeNull()
  })
})
```

- [ ] **Step 1c: Run test — expect PASS**

```bash
cd packages/ui && pnpm test -- Canvas
```

- [ ] **Step 2: Implement AnnotationEditor.tsx** (with `push` wired to canvas `object:added`/`object:removed` events for undo/redo)

```tsx
// packages/ui/src/annotation/AnnotationEditor.tsx
import { useState, useRef, useCallback } from 'react'
import { Canvas, type CanvasHandle } from './Canvas'
import { Toolbar, type AnnotationTool } from './Toolbar'
import { useUndoRedo } from './useUndoRedo'

interface Props {
  screenshotDataUrl: string
  width: number
  height: number
  onSave: (blob: Blob) => void
  onDone: () => void
}

export function AnnotationEditor({ screenshotDataUrl, width, height, onSave, onDone }: Props) {
  const [activeTool, setActiveTool] = useState<AnnotationTool>('arrow')
  const [color, setColor] = useState('#ff4757')
  const [strokeWidth, setStrokeWidth] = useState(3)
  const canvasRef = useRef<CanvasHandle>(null)
  const { push, undo, redo, canUndo, canRedo } = useUndoRedo<string>()

  // Wire Fabric.js events to undo/redo stack after canvas mounts
  const handleCanvasReady = useCallback(() => {
    const fc = canvasRef.current?.fabricCanvas
    if (!fc) return
    const snapshot = () => push(fc.toJSON())
    fc.on('object:added', snapshot)
    fc.on('object:removed', snapshot)
    fc.on('object:modified', snapshot)
    return () => { fc.off('object:added', snapshot); fc.off('object:removed', snapshot); fc.off('object:modified', snapshot) }
  }, [push])

  const handleSave = useCallback(async () => {
    const dataUrl = canvasRef.current?.toDataURL() ?? ''
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    onSave(blob)
  }, [onSave])

  const handleToolChange = useCallback((tool: AnnotationTool) => {
    setActiveTool(tool)
    const fc = canvasRef.current?.fabricCanvas
    if (!fc) return
    fc.isDrawingMode = tool === 'pen' || tool === 'highlight'
    if (fc.isDrawingMode) {
      fc.freeDrawingBrush.color = color
      fc.freeDrawingBrush.width = strokeWidth
    }
  }, [color, strokeWidth])

  return (
    <div className="annotation-editor">
      <Toolbar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        color={color}
        onColorChange={setColor}
        strokeWidth={strokeWidth}
        onStrokeChange={setStrokeWidth}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onSave={handleSave}
        onDone={onDone}
      />
      <div className="canvas-container">
        <Canvas
          ref={canvasRef}
          backgroundDataUrl={screenshotDataUrl}
          width={width}
          height={height}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat(ui): add AnnotationEditor with Fabric.js canvas integration"
```

---

## Chunk 6: @capture/extension Shell

### Task 16: Background service worker

**Files:**
- Create: `packages/extension/src/background/service-worker.ts`
- Create: `packages/extension/src/background/capture-handler.ts`

- [ ] **Step 1: Implement capture-handler.ts**

```typescript
// packages/extension/src/background/capture-handler.ts
import { stitchFrames } from '@capture/core'
import type { CaptureMode, Region } from '@capture/core'

export interface CaptureRequest {
  mode: CaptureMode
  region?: Region
  delayMs?: number
}

export async function handleCapture(
  tabId: number,
  request: CaptureRequest,
): Promise<string> {
  if (request.delayMs) {
    await new Promise(r => setTimeout(r, request.delayMs))
  }

  switch (request.mode) {
    case 'visible':
    case 'region':
    case 'element': {
      const dataUrl = await chrome.tabs.captureVisibleTab({ format: 'png' })
      return dataUrl
    }

    case 'fullpage': {
      const frames: string[] = []
      const { width, height } = await getViewport(tabId)

      const scrollInfo = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => ({
          scrollHeight: document.body.scrollHeight,
          scrollTop: window.scrollY,
        }),
      })
      const { scrollHeight } = scrollInfo[0].result as { scrollHeight: number; scrollTop: number }
      const steps = Math.ceil(scrollHeight / height)

      for (let i = 0; i < steps; i++) {
        await chrome.scripting.executeScript({
          target: { tabId },
          func: (y: number) => window.scrollTo(0, y),
          args: [i * height],
        })
        await new Promise(r => setTimeout(r, 150))
        frames.push(await chrome.tabs.captureVisibleTab({ format: 'png' }))
      }

      await chrome.scripting.executeScript({
        target: { tabId },
        func: () => window.scrollTo(0, 0),
      })

      return stitchFrames(frames, width, height)
    }

    case 'delayed':
      return chrome.tabs.captureVisibleTab({ format: 'png' })

    default:
      throw new Error(`Unknown capture mode: ${request.mode}`)
  }
}

async function getViewport(tabId: number): Promise<{ width: number; height: number }> {
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => ({ width: window.innerWidth, height: window.innerHeight }),
  })
  return result[0].result as { width: number; height: number }
}
```

- [ ] **Step 2: Implement service-worker.ts**

```typescript
// packages/extension/src/background/service-worker.ts
import { handleCapture, type CaptureRequest } from './capture-handler'

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CAPTURE') {
    const tabId = sender.tab?.id ?? message.tabId
    handleCapture(tabId, message.payload as CaptureRequest)
      .then(dataUrl => sendResponse({ ok: true, dataUrl }))
      .catch(err => sendResponse({ ok: false, error: err.message }))
    return true // async response
  }
})
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat(extension): add background service worker and capture handler"
```

---

### Task 17: Content script — overlay injection

**Files:**
- Create: `packages/extension/src/content/overlay.ts`
- Create: `packages/extension/src/content/region-selector.ts`

- [ ] **Step 1: Implement region-selector.ts**

```typescript
// packages/extension/src/content/region-selector.ts
import type { Region } from '@capture/core'

export function startRegionSelector(): Promise<Region> {
  return new Promise(resolve => {
    const overlay = document.createElement('div')
    overlay.id = '__capture-region-overlay'
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', cursor: 'crosshair',
      zIndex: '2147483647', background: 'rgba(0,0,0,0.3)',
    })
    document.body.appendChild(overlay)

    let startX = 0, startY = 0
    const selection = document.createElement('div')
    Object.assign(selection.style, {
      position: 'fixed', border: '2px solid #ff4757',
      background: 'rgba(255,71,87,0.1)', pointerEvents: 'none',
      zIndex: '2147483648',
    })
    document.body.appendChild(selection)

    const onMouseDown = (e: MouseEvent) => {
      startX = e.clientX; startY = e.clientY
    }

    const onMouseMove = (e: MouseEvent) => {
      const x = Math.min(e.clientX, startX)
      const y = Math.min(e.clientY, startY)
      const w = Math.abs(e.clientX - startX)
      const h = Math.abs(e.clientY - startY)
      Object.assign(selection.style, {
        left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`,
      })
    }

    const onMouseUp = (e: MouseEvent) => {
      overlay.removeEventListener('mousedown', onMouseDown)
      overlay.removeEventListener('mousemove', onMouseMove)
      overlay.removeEventListener('mouseup', onMouseUp)
      overlay.remove()
      selection.remove()

      const dpr = window.devicePixelRatio
      resolve({
        x: Math.min(e.clientX, startX) * dpr,
        y: Math.min(e.clientY, startY) * dpr,
        width: Math.abs(e.clientX - startX) * dpr,
        height: Math.abs(e.clientY - startY) * dpr,
      })
    }

    overlay.addEventListener('mousedown', onMouseDown)
    overlay.addEventListener('mousemove', onMouseMove)
    overlay.addEventListener('mouseup', onMouseUp)
  })
}
```

- [ ] **Step 2: Implement overlay.ts**

```typescript
// packages/extension/src/content/overlay.ts
import { createRoot } from 'react-dom/client'
import { createElement } from 'react'
import { AnnotationEditor } from '@capture/ui'
import { LocalProvider } from '@capture/storage'

let overlayRoot: ReturnType<typeof createRoot> | null = null

function injectEditor(dataUrl: string, width: number, height: number) {
  const container = document.createElement('div')
  container.id = '__capture-editor-root'
  Object.assign(container.style, {
    position: 'fixed', inset: '0', zIndex: '2147483647',
    background: 'rgba(0,0,0,0.6)',
  })
  document.body.appendChild(container)

  const storage = new LocalProvider()

  const handleSave = async (blob: Blob) => {
    // Save to local storage + trigger download
    await storage.upload(blob, {
      id: `capture-${Date.now()}`,
      capturedAt: Date.now(),
      url: window.location.href,
      title: document.title,
      width,
      height,
      mode: 'visible',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `capture-${Date.now()}.png`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDone = () => {
    overlayRoot?.unmount()
    container.remove()
    overlayRoot = null
  }

  overlayRoot = createRoot(container)
  overlayRoot.render(
    createElement(AnnotationEditor, {
      screenshotDataUrl: dataUrl,
      width,
      height,
      onSave: handleSave,
      onDone: handleDone,
    }),
  )
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'SHOW_EDITOR') {
    injectEditor(message.dataUrl, message.width, message.height)
  }
})
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat(extension): add overlay injection and region selector content scripts"
```

---

### Task 18: Popup entry point + Vite config

**Files:**
- Create: `packages/extension/src/popup/index.html`
- Create: `packages/extension/src/popup/index.tsx`
- Create: `packages/extension/vite.config.ts`

- [ ] **Step 1: Write popup index.html**

```html
<!-- packages/extension/src/popup/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Screen Capture</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./index.tsx"></script>
</body>
</html>
```

- [ ] **Step 2: Write popup index.tsx**

```tsx
// packages/extension/src/popup/index.tsx
import { createRoot } from 'react-dom/client'
import { Popup } from '@capture/ui'
import type { CaptureMode } from '@capture/core'

async function triggerCapture(mode: CaptureMode) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab.id) return

  const response = await chrome.runtime.sendMessage({
    type: 'CAPTURE',
    tabId: tab.id,
    payload: { mode },
  })

  if (response.ok) {
    const img = new Image()
    img.onload = () => {
      chrome.tabs.sendMessage(tab.id!, {
        type: 'SHOW_EDITOR',
        dataUrl: response.dataUrl,
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
      window.close()
    }
    img.src = response.dataUrl
  }
}

function triggerRecord(type: 'tab' | 'screen') {
  chrome.runtime.sendMessage({ type: 'START_RECORD', payload: { type } })
  window.close()
}

const root = createRoot(document.getElementById('root')!)
root.render(<Popup onCapture={triggerCapture} onRecord={triggerRecord} />)
```

- [ ] **Step 3: Write vite.config.ts**

```typescript
// packages/extension/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: 'src/popup/index.html',
        options: 'src/options/index.html',
      },
    },
  },
})
```

- [ ] **Step 4: Build extension**

```bash
cd packages/extension && pnpm build
```

Expected: `dist/` folder created with `manifest.json`, popup HTML/JS, background service worker.

- [ ] **Step 5: Load extension in Chrome**

```
1. Open chrome://extensions/
2. Enable Developer Mode (top right)
3. Click "Load unpacked"
4. Select packages/extension/dist/
5. Click the extension icon — popup should open
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat(extension): add popup entry, Vite CRXJS config, and extension build"
```

---

## Chunk 7: Icons + Video Recording + Polish

### Task 19: Extension icons (SVG → PNG)

**Files:**
- Create: `packages/extension/icons/icon.svg`
- Create: `packages/extension/scripts/generate-icons.mjs`

- [ ] **Step 1: Write icon.svg (Lucide camera style)**

```svg
<!-- packages/extension/icons/icon.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="28" fill="#ff4757"/>
  <g stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- camera body -->
    <path d="M24 44h80a6 6 0 0 1 6 6v40a6 6 0 0 1-6 6H24a6 6 0 0 1-6-6V50a6 6 0 0 1 6-6z"/>
    <!-- lens notch top -->
    <path d="M46 44l6-12h24l6 12"/>
    <!-- lens circle -->
    <circle cx="64" cy="70" r="16"/>
    <circle cx="64" cy="70" r="8" fill="white" stroke="none"/>
    <!-- flash dot -->
    <circle cx="94" cy="56" r="4" fill="white" stroke="none"/>
  </g>
</svg>
```

- [ ] **Step 2: Write generate-icons.mjs**

```javascript
// packages/extension/scripts/generate-icons.mjs
// Requires: pnpm add -D sharp
import sharp from 'sharp'
import { readFileSync } from 'fs'

const svg = readFileSync('icons/icon.svg')
const sizes = [16, 32, 48, 128]

for (const size of sizes) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(`icons/icon${size}.png`)
  console.log(`✓ icon${size}.png`)
}
```

- [ ] **Step 3: Generate icons**

```bash
cd packages/extension
pnpm add -D sharp
node scripts/generate-icons.mjs
```

Expected: `icons/icon16.png`, `icons/icon32.png`, `icons/icon48.png`, `icons/icon128.png` created.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat(extension): add Lucide-style camera icon in all required sizes"
```

---

### Task 20: Video recording (tab + screen)

**Files:**
- Create: `packages/core/src/video/recorder.ts`
- Create: `packages/extension/src/background/record-handler.ts`

- [ ] **Step 1: Implement recorder.ts**

```typescript
// packages/core/src/video/recorder.ts
export class ScreenRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private chunks: Blob[] = []

  async start(stream: MediaStream): Promise<void> {
    this.chunks = []
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
    })
    this.mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) this.chunks.push(e.data)
    }
    this.mediaRecorder.start(100)
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) return reject(new Error('Not recording'))
      this.mediaRecorder.onstop = () => {
        resolve(new Blob(this.chunks, { type: 'video/webm' }))
      }
      this.mediaRecorder.stop()
    })
  }

  get isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }
}
```

- [ ] **Step 2: Implement record-handler.ts**

```typescript
// packages/extension/src/background/record-handler.ts
import { ScreenRecorder } from '@capture/core'

const recorder = new ScreenRecorder()

export async function startTabRecording(tabId: number): Promise<void> {
  const stream = await chrome.tabCapture.capture({ audio: true, video: true })
  if (!stream) throw new Error('Tab capture failed')
  await recorder.start(stream)
}

export async function stopRecording(): Promise<Blob> {
  return recorder.stop()
}

export function isRecording(): boolean {
  return recorder.isRecording
}
```

- [ ] **Step 3: Wire into service-worker.ts**

Add to `service-worker.ts`:

```typescript
import { startTabRecording, stopRecording } from './record-handler'

// inside onMessage listener, add:
if (message.type === 'START_RECORD') {
  if (message.payload.type === 'tab') {
    startTabRecording(message.tabId)
      .then(() => sendResponse({ ok: true }))
      .catch(err => sendResponse({ ok: false, error: err.message }))
    return true
  }
}

if (message.type === 'STOP_RECORD') {
  stopRecording()
    .then(blob => blob.arrayBuffer())
    .then(buf => sendResponse({ ok: true, buffer: buf }))
    .catch(err => sendResponse({ ok: false, error: err.message }))
  return true
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat(core,extension): add ScreenRecorder and tab capture integration"
```

---

### Task 21: Settings page (StorageProvider config)

**Files:**
- Create: `packages/ui/src/settings/SettingsPage.tsx`
- Create: `packages/ui/src/settings/StorageConfig.tsx`
- Create: `packages/extension/src/options/index.html`
- Create: `packages/extension/src/options/index.tsx`

- [ ] **Step 1: Implement StorageConfig.tsx**

```tsx
// packages/ui/src/settings/StorageConfig.tsx
import { useState } from 'react'
import type { StorageProvider } from '@capture/storage'

interface Props {
  providers: StorageProvider[]
  activeProviderId: string
  onProviderChange: (id: string) => void
}

export function StorageConfig({ providers, activeProviderId, onProviderChange }: Props) {
  return (
    <section className="settings-section">
      <h2>Storage Provider</h2>
      <div className="provider-list">
        {providers.map(p => (
          <label key={p.id} className="provider-option">
            <input
              type="radio"
              name="provider"
              value={p.id}
              checked={activeProviderId === p.id}
              onChange={() => onProviderChange(p.id)}
            />
            <span>{p.name}</span>
          </label>
        ))}
      </div>
      <p className="settings-note">
        All data stays local by default. Cloud providers require your own credentials.
      </p>
    </section>
  )
}
```

- [ ] **Step 2: Implement SettingsPage.tsx**

```tsx
// packages/ui/src/settings/SettingsPage.tsx
import { useState } from 'react'
import { StorageConfig } from './StorageConfig'
import { LocalProvider, ImgurProvider, S3Provider } from '@capture/storage'
import type { StorageProvider } from '@capture/storage'

const PROVIDERS: StorageProvider[] = [
  new LocalProvider(),
  new ImgurProvider(),
  new S3Provider(),
]

export function SettingsPage() {
  const [activeId, setActiveId] = useState('local')

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      <StorageConfig
        providers={PROVIDERS}
        activeProviderId={activeId}
        onProviderChange={setActiveId}
      />
    </div>
  )
}
```

- [ ] **Step 3: Write options entry**

```tsx
// packages/extension/src/options/index.tsx
import { createRoot } from 'react-dom/client'
import { SettingsPage } from '@capture/ui'

createRoot(document.getElementById('root')!).render(<SettingsPage />)
```

- [ ] **Step 4: Rebuild and verify settings page loads**

```bash
cd packages/extension && pnpm build
```

Load in Chrome → right-click extension icon → "Options" → Settings page should render.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat(ui,extension): add settings page with storage provider configuration"
```

---

## Chunk 8: E2E Tests + CI

### Task 22: Playwright E2E tests

**Files:**
- Create: `packages/extension/tests/e2e/popup.spec.ts`
- Create: `packages/extension/playwright.config.ts`

- [ ] **Step 1: Install Playwright**

```bash
cd packages/extension
pnpm add -D @playwright/test playwright-crx
npx playwright install chromium
```

- [ ] **Step 2: Write playwright.config.ts**

```typescript
// packages/extension/playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  // Run headless in CI; use `npx playwright test --headed` locally
  use: { headless: !!process.env.CI },
  projects: [{ name: 'chromium', use: { channel: 'chromium' } }],
})
```

- [ ] **Step 3: Write popup E2E test**

```typescript
// packages/extension/tests/e2e/popup.spec.ts
import { test, expect, chromium } from '@playwright/test'
import path from 'path'

const EXTENSION_PATH = path.resolve('dist')

// Helper: load extension and extract its ID from chrome://extensions
async function loadExtension() {
  const context = await chromium.launchPersistentContext('', {
    headless: !!process.env.CI,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
    ],
  })

  // chrome://extensions lists extension IDs in the DOM
  const page = await context.newPage()
  await page.goto('chrome://extensions/')
  await page.waitForSelector('extensions-manager')

  const extensionId = await page.evaluate(() => {
    const manager = document.querySelector('extensions-manager')
    const shadowRoot = manager?.shadowRoot
    const itemList = shadowRoot?.querySelector('extensions-item-list')
    const item = itemList?.shadowRoot?.querySelector('extensions-item')
    return item?.getAttribute('id') ?? ''
  })

  return { context, extensionId }
}

test('popup renders all capture mode buttons', async () => {
  const { context, extensionId } = await loadExtension()

  expect(extensionId).not.toBe('')

  const popupPage = await context.newPage()
  await popupPage.goto(`chrome-extension://${extensionId}/src/popup/index.html`)
  await popupPage.waitForLoadState('domcontentloaded')

  await expect(popupPage.getByText('Visible Area')).toBeVisible()
  await expect(popupPage.getByText('Full Page')).toBeVisible()
  await expect(popupPage.getByText('Select Region')).toBeVisible()
  await expect(popupPage.getByText('Element')).toBeVisible()
  await expect(popupPage.getByText('Delayed')).toBeVisible()

  await context.close()
})
```

- [ ] **Step 4: Run E2E tests**

```bash
cd packages/extension && npx playwright test
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "test(extension): add Playwright E2E test for popup"
```

---

### Task 23: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write CI workflow**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test
      - run: pnpm typecheck
      - run: pnpm lint
```

- [ ] **Step 2: Add lint script to root package.json**

```json
{
  "scripts": {
    "lint": "turbo run lint"
  }
}
```

- [ ] **Step 3: Commit**

```bash
mkdir -p .github/workflows
git add .
git commit -m "ci: add GitHub Actions workflow for test, build, typecheck, lint"
```

---

### Task 24: README + contributing guide

**Files:**
- Create: `README.md`
- Create: `CONTRIBUTING.md`

- [ ] **Step 1: Write README.md**

```markdown
# my-browser-screen-capture

Open-source Chrome extension for screen capture, annotation, and recording. No SaaS, no paywalls — all features work locally.

## Features

- **Capture**: Visible area, full page, region select, element, delayed
- **Annotate**: Arrow, rectangle, circle, text, pen, blur, highlight, step counter
- **Record**: Tab recording, screen recording, GIF export
- **Storage**: Local-first; bring your own S3, Imgur, Google Drive, or Dropbox credentials

## Install

<!-- TODO: update after Chrome Web Store publish -->
Download the latest release from [GitHub Releases](https://github.com/yourorg/my-browser-screen-capture/releases) and load it as an unpacked extension.

## Development

```bash
pnpm install
pnpm dev          # watch mode for extension
pnpm test         # run all unit tests
pnpm build        # production build → packages/extension/dist/
```

Load `packages/extension/dist/` as an unpacked extension in `chrome://extensions/`.

## Adding a Storage Provider

1. Create `packages/storage/src/providers/your-provider.ts` implementing `StorageProvider`
2. Export it from `packages/storage/src/index.ts`
3. Register it in `packages/ui/src/settings/SettingsPage.tsx`
4. Add tests in `packages/storage/tests/providers/your-provider.test.ts`

## License

MIT
```

- [ ] **Step 2: Write CONTRIBUTING.md**

```markdown
# Contributing

## Adding a StorageProvider

Implement the `StorageProvider` interface from `@capture/storage`:

```typescript
import type { StorageProvider, UploadResult } from '@capture/storage'
import type { CaptureMeta, CaptureRecord } from '@capture/core'

export class MyProvider implements StorageProvider {
  id = 'my-provider'
  name = 'My Provider'
  configure(settings: Record<string, unknown>): void { /* store credentials */ }
  async upload(blob: Blob, meta: CaptureMeta): Promise<UploadResult> { /* ... */ }
  async getHistory(): Promise<CaptureRecord[]> { return [] }
  async delete(id: string): Promise<void> { /* ... */ }
}
```

Then:
1. Export from `packages/storage/src/index.ts`
2. Add to the providers list in `packages/ui/src/settings/SettingsPage.tsx`
3. Write tests in `packages/storage/tests/providers/my-provider.test.ts`

## Running Tests

```bash
pnpm test              # all packages
cd packages/core && pnpm test   # single package
```

## PR Checklist

- [ ] Tests pass (`pnpm test`)
- [ ] Types pass (`pnpm typecheck`)
- [ ] Lint passes (`pnpm lint`)
- [ ] New StorageProviders include tests
```

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "docs: add README and CONTRIBUTING guide"
```
