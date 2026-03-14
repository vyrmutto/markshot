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

  async upload(_blob: Blob, _meta: CaptureMeta): Promise<UploadResult> {
    if (!this.endpoint || !this.bucket) throw new Error('S3Provider not configured')
    throw new Error('S3Provider.upload: not yet implemented')
  }

  async getHistory(): Promise<CaptureRecord[]> { return [] }
  async delete(_id: string): Promise<void> {}
}
