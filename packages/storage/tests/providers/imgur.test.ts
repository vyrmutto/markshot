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

  it('configure: sets clientId used in Authorization header', async () => {
    const provider = new ImgurProvider()
    provider.configure({ clientId: 'my-custom-client-id' })
    const blob = new Blob(['x'], { type: 'image/png' })
    await provider.upload(blob, { id: '1', capturedAt: 0, url: '', title: '', width: 0, height: 0, mode: 'visible' })
    const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(fetchCall[1].headers.Authorization).toBe('Client-ID my-custom-client-id')
  })

  it('getHistory: returns empty array', async () => {
    const provider = new ImgurProvider()
    const history = await provider.getHistory()
    expect(history).toEqual([])
  })

  it('delete: resolves without throwing', async () => {
    const provider = new ImgurProvider()
    await expect(provider.delete('abc123')).resolves.toBeUndefined()
  })

  it('getShareUrl: returns imgur share URL for given id', async () => {
    const provider = new ImgurProvider()
    const url = await provider.getShareUrl('xyz789')
    expect(url).toBe('https://imgur.com/xyz789')
  })
})
