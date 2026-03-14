import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Canvas as FabricCanvas, FabricImage } from 'fabric'

export interface CanvasHandle {
  fabricCanvas: FabricCanvas | null
  toDataURL: () => string
}

interface Props {
  backgroundDataUrl: string
  width: number
  height: number
}

export const Canvas = forwardRef<CanvasHandle, Props>(({ backgroundDataUrl, width, height }, ref) => {
  const canvasEl = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<FabricCanvas | null>(null)

  useImperativeHandle(ref, () => ({
    get fabricCanvas() { return fabricRef.current },
    toDataURL() {
      return fabricRef.current?.toDataURL({ format: 'png', multiplier: 1 }) ?? ''
    },
  }))

  useEffect(() => {
    if (!canvasEl.current) return
    const fc = new FabricCanvas(canvasEl.current, {
      width,
      height,
      isDrawingMode: false,
    })
    fabricRef.current = fc

    FabricImage.fromURL(backgroundDataUrl).then(img => {
      img.set({ selectable: false, evented: false })
      fc.backgroundImage = img
      fc.renderAll()
    })

    return () => { fc.dispose(); fabricRef.current = null }
  }, [backgroundDataUrl, width, height])

  return <canvas ref={canvasEl} />
})

Canvas.displayName = 'Canvas'
