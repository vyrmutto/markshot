import { describe, it, expect } from 'vitest'
import { clipRegion } from '../../src/capture/region'
import { elementToRegion } from '../../src/capture/element'

describe('clipRegion', () => {
  it('clamps region to image bounds', () => {
    const result = clipRegion({ x: -10, y: -10, width: 200, height: 200 }, 100, 100)
    expect(result).toEqual({ x: 0, y: 0, width: 100, height: 100 })
  })

  it('returns region as-is when within bounds', () => {
    const region = { x: 10, y: 10, width: 50, height: 50 }
    expect(clipRegion(region, 100, 100)).toEqual(region)
  })
})

describe('elementToRegion', () => {
  it('converts DOMRect to Region', () => {
    const rect = { x: 20, y: 30, width: 80, height: 40, top: 30, left: 20, right: 100, bottom: 70 } as DOMRect
    expect(elementToRegion(rect, 1)).toEqual({ x: 20, y: 30, width: 80, height: 40 })
  })

  it('applies devicePixelRatio scaling', () => {
    const rect = { x: 10, y: 10, width: 50, height: 50 } as DOMRect
    expect(elementToRegion(rect, 2)).toEqual({ x: 20, y: 20, width: 100, height: 100 })
  })
})
