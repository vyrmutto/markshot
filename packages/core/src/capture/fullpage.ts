/**
 * Stitches an array of viewport-height data URLs into one tall image.
 */
export async function stitchFrames(
  frames: string[],
  viewportWidth: number,
  viewportHeight: number,
): Promise<string> {
  if (frames.length === 0) throw new Error('No frames to stitch')

  const totalHeight = viewportHeight * frames.length
  const canvas = document.createElement('canvas')
  canvas.width = viewportWidth
  canvas.height = totalHeight
  const ctx = canvas.getContext('2d')!

  for (let i = 0; i < frames.length; i++) {
    await new Promise<void>((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, i * viewportHeight)
        resolve()
      }
      img.onerror = reject
      img.src = frames[i]
    })
  }

  return canvas.toDataURL('image/png')
}
