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
