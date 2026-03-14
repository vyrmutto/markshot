import { useState, useRef, useCallback } from 'react'
import { Canvas, type CanvasHandle } from './Canvas'
import { Toolbar, type AnnotationTool } from './Toolbar'
import { useUndoRedo } from './useUndoRedo'

interface Props {
  screenshotDataUrl: string
  width: number
  height: number
  onSave: (blob: Blob) => void
  onDone: () => void
}

export function AnnotationEditor({ screenshotDataUrl, width, height, onSave, onDone }: Props) {
  const [activeTool, setActiveTool] = useState<AnnotationTool>('arrow')
  const [color, setColor] = useState('#ff4757')
  const [strokeWidth, setStrokeWidth] = useState(3)
  const canvasRef = useRef<CanvasHandle>(null)
  const { push, undo, redo, canUndo, canRedo } = useUndoRedo<string>()

  const handleCanvasReady = useCallback(() => {
    const fc = canvasRef.current?.fabricCanvas
    if (!fc) return
    const snapshot = () => push(fc.toJSON())
    fc.on('object:added', snapshot)
    fc.on('object:removed', snapshot)
    fc.on('object:modified', snapshot)
    return () => { fc.off('object:added', snapshot); fc.off('object:removed', snapshot); fc.off('object:modified', snapshot) }
  }, [push])

  const handleSave = useCallback(async () => {
    const dataUrl = canvasRef.current?.toDataURL() ?? ''
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    onSave(blob)
  }, [onSave])

  const handleToolChange = useCallback((tool: AnnotationTool) => {
    setActiveTool(tool)
    const fc = canvasRef.current?.fabricCanvas
    if (!fc) return
    fc.isDrawingMode = tool === 'pen' || tool === 'highlight'
    if (fc.isDrawingMode && fc.freeDrawingBrush) {
      fc.freeDrawingBrush.color = color
      fc.freeDrawingBrush.width = strokeWidth
    }
  }, [color, strokeWidth])

  return (
    <div className="annotation-editor">
      <Toolbar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        color={color}
        onColorChange={setColor}
        strokeWidth={strokeWidth}
        onStrokeChange={setStrokeWidth}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onSave={handleSave}
        onDone={onDone}
      />
      <div className="canvas-container">
        <Canvas
          ref={canvasRef}
          backgroundDataUrl={screenshotDataUrl}
          width={width}
          height={height}
        />
      </div>
    </div>
  )
}
