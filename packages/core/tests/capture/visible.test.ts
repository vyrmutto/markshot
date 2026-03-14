import { describe, it, expect } from 'vitest'
import { cropImageData } from '../../src/capture/visible'

describe('cropImageData', () => {
  it('crops a data URL to the given region', async () => {
    // Create a 100x100 red canvas
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 100
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = 'red'
    ctx.fillRect(0, 0, 100, 100)
    const dataUrl = canvas.toDataURL()

    const cropped = await cropImageData(dataUrl, { x: 0, y: 0, width: 50, height: 50 })
    expect(cropped).toMatch(/^data:image\/png/)
  })
})
