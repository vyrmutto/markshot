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
