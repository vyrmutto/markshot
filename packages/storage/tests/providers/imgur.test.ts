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
