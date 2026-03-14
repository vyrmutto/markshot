import {
  ArrowRight, Square, Circle, Type, Pen,
  EyeOff, Highlighter, Hash, Undo2, Redo2, Download, Check
} from 'lucide-react'

export type AnnotationTool = 'arrow' | 'rect' | 'circle' | 'text' | 'pen' | 'blur' | 'highlight' | 'counter'

const TOOLS: { id: AnnotationTool; label: string; Icon: React.FC<any> }[] = [
  { id: 'arrow',     label: 'Arrow',     Icon: ArrowRight },
  { id: 'rect',      label: 'Rectangle', Icon: Square },
  { id: 'circle',    label: 'Circle',    Icon: Circle },
  { id: 'text',      label: 'Text',      Icon: Type },
  { id: 'pen',       label: 'Pen',       Icon: Pen },
  { id: 'blur',      label: 'Blur',      Icon: EyeOff },
  { id: 'highlight', label: 'Highlight', Icon: Highlighter },
  { id: 'counter',   label: 'Counter',   Icon: Hash },
]

const PRESET_COLORS = ['#ff4757', '#2ed573', '#1e90ff', '#ffd32a', '#ffffff', '#000000']

interface Props {
  activeTool: AnnotationTool
  onToolChange: (tool: AnnotationTool) => void
  color: string
  onColorChange: (color: string) => void
  strokeWidth: number
  onStrokeChange: (width: number) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onSave: () => void
  onDone: () => void
}

export function Toolbar({
  activeTool, onToolChange, color, onColorChange,
  strokeWidth, onStrokeChange, canUndo, canRedo,
  onUndo, onRedo, onSave, onDone,
}: Props) {
  return (
    <div className="anno-toolbar">
      {TOOLS.map(({ id, label, Icon }) => (
        <button
          key={id}
          title={label}
          className={`tool-btn ${activeTool === id ? 'active' : ''}`}
          onClick={() => onToolChange(id)}
        >
          <Icon size={16} />
        </button>
      ))}

      <div className="toolbar-sep" />

      {PRESET_COLORS.map(c => (
        <button
          key={c}
          className={`color-swatch ${color === c ? 'selected' : ''}`}
          style={{ background: c }}
          onClick={() => onColorChange(c)}
          title={c}
        />
      ))}

      <input
        type="range" min={1} max={12} value={strokeWidth}
        onChange={e => onStrokeChange(Number(e.target.value))}
        className="stroke-slider"
        title="Stroke width"
      />

      <div className="toolbar-sep" />

      <button onClick={onUndo} disabled={!canUndo} className="tool-action">
        <Undo2 size={14} /> Undo
      </button>
      <button onClick={onRedo} disabled={!canRedo} className="tool-action">
        <Redo2 size={14} /> Redo
      </button>

      <div className="toolbar-spacer" />

      <button onClick={onSave} className="btn-save">
        <Download size={14} /> Save
      </button>
      <button onClick={onDone} className="btn-done">
        <Check size={14} /> Done
      </button>
    </div>
  )
}
