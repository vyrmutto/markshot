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
