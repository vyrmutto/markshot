import type { Region } from '../types'

export function elementToRegion(rect: DOMRect, devicePixelRatio: number): Region {
  return {
    x: Math.round(rect.x * devicePixelRatio),
    y: Math.round(rect.y * devicePixelRatio),
    width: Math.round(rect.width * devicePixelRatio),
    height: Math.round(rect.height * devicePixelRatio),
  }
}
