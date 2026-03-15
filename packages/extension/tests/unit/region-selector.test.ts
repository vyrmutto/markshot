import { describe, it, expect, beforeEach } from 'vitest'
import { startRegionSelector } from '../../src/content/region-selector'

describe('region-selector', () => {
  beforeEach(() => {
    // Clean up any leftover DOM elements
    document.body.innerHTML = ''
    // Reset devicePixelRatio to 1 for predictable calculations
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      configurable: true,
      value: 1,
    })
  })

  it('creates overlay on call', async () => {
    const promise = startRegionSelector()
    const overlay = document.getElementById('__capture-region-overlay')
    expect(overlay).not.toBeNull()
    // Clean up: cancel with Escape so the promise settles
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await promise.catch(() => {})
  })

  it('resolves with correct region on mousedown+mouseup', async () => {
    const promise = startRegionSelector()
    const overlay = document.getElementById('__capture-region-overlay')!

    overlay.dispatchEvent(new MouseEvent('mousedown', { clientX: 10, clientY: 20, bubbles: true }))
    overlay.dispatchEvent(new MouseEvent('mouseup', { clientX: 60, clientY: 80, bubbles: true }))

    const region = await promise
    expect(region).toEqual({ x: 10, y: 20, width: 50, height: 60 })
  })

  it('handles drag in reverse direction (Math.min logic)', async () => {
    const promise = startRegionSelector()
    const overlay = document.getElementById('__capture-region-overlay')!

    overlay.dispatchEvent(new MouseEvent('mousedown', { clientX: 60, clientY: 80, bubbles: true }))
    overlay.dispatchEvent(new MouseEvent('mouseup', { clientX: 10, clientY: 20, bubbles: true }))

    const region = await promise
    expect(region).toEqual({ x: 10, y: 20, width: 50, height: 60 })
  })

  it('removes overlay and selection elements on mouseup', async () => {
    const promise = startRegionSelector()
    const overlay = document.getElementById('__capture-region-overlay')!

    overlay.dispatchEvent(new MouseEvent('mousedown', { clientX: 0, clientY: 0, bubbles: true }))
    overlay.dispatchEvent(new MouseEvent('mouseup', { clientX: 10, clientY: 10, bubbles: true }))

    await promise

    expect(document.getElementById('__capture-region-overlay')).toBeNull()
    const overlays = document.querySelectorAll('[id="__capture-region-overlay"]')
    expect(overlays.length).toBe(0)
  })

  it('Escape key rejects with Region selection cancelled', async () => {
    const promise = startRegionSelector()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

    await expect(promise).rejects.toThrow('Region selection cancelled')
  })

  it('Escape key removes overlay and selection elements', async () => {
    const promise = startRegionSelector()
    expect(document.getElementById('__capture-region-overlay')).not.toBeNull()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

    await promise.catch(() => {})

    expect(document.getElementById('__capture-region-overlay')).toBeNull()
  })

  it('applies devicePixelRatio scaling to region coordinates', async () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 2, writable: true, configurable: true })

    const promise = startRegionSelector()
    const overlay = document.getElementById('__capture-region-overlay')!

    overlay.dispatchEvent(new MouseEvent('mousedown', { clientX: 10, clientY: 20, bubbles: true }))
    overlay.dispatchEvent(new MouseEvent('mouseup', { clientX: 60, clientY: 80, bubbles: true }))

    const region = await promise
    expect(region).toEqual({ x: 20, y: 40, width: 100, height: 120 })
  })
})
