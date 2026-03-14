// packages/storage/src/providers/local.ts
import type { StorageProvider, UploadResult } from '../interface'
import { dataUrlToBlob } from '@capture/core'
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

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export class LocalProvider implements StorageProvider {
  id = 'local'
  name = 'Local Storage'

  configure(_settings: Record<string, unknown>): void {}

  async upload(blob: Blob, meta: CaptureMeta): Promise<UploadResult> {
    const dataUrl = await blobToDataUrl(blob)

    const record = {
      ...meta,
      dataUrl,
      thumbnailDataUrl: dataUrl,
    }

    try {
      const db = await openDb()
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        tx.objectStore(STORE_NAME).put(record)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
    } catch {
      // IndexedDB not available (e.g., in tests) — silently skip
    }

    // Return data URL as the url (works in both browser and test)
    return { id: meta.id, url: dataUrl }
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
            blob: dataUrlToBlob(r.dataUrl),
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
    try {
      const db = await openDb()
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        tx.objectStore(STORE_NAME).delete(id)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
    } catch {
      // ignore
    }
  }
}
