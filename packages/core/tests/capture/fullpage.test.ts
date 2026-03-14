import { describe, it, expect } from 'vitest'
import { stitchFrames } from '../../src/capture/fullpage'

describe('stitchFrames', () => {
  it('stitches two equally-sized frames vertically', async () => {
    const makeFrame = (color: string): Promise<string> =>
      new Promise(resolve => {
        const c = document.createElement('canvas')
        c.width = 100; c.height = 200
        const ctx = c.getContext('2d')!
        ctx.fillStyle = color
        ctx.fillRect(0, 0, 100, 200)
        resolve(c.toDataURL())
      })

    const frames = await Promise.all([makeFrame('red'), makeFrame('blue')])
    const result = await stitchFrames(frames, 100, 200)
    expect(result).toMatch(/^data:image\/png/)
  })

  it('throws when frames array is empty', async () => {
    await expect(stitchFrames([], 100, 200)).rejects.toThrow('No frames')
  })
})
