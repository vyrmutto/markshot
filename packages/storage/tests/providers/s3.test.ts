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
