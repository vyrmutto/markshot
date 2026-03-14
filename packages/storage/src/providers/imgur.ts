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
    return []
  }

  async delete(_id: string): Promise<void> {}

  async getShareUrl(id: string): Promise<string> {
    return `https://imgur.com/${id}`
  }
}
