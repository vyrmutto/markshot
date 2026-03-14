import type { Region } from '../types'

export function clipRegion(region: Region, imageWidth: number, imageHeight: number): Region {
  const x = Math.max(0, region.x)
  const y = Math.max(0, region.y)
  const width = Math.min(region.width + Math.min(0, region.x), imageWidth - x)
  const height = Math.min(region.height + Math.min(0, region.y), imageHeight - y)
  return { x, y, width, height }
}
