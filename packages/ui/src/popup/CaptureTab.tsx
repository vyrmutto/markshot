import { Monitor, FileText, Scissors, Square, Timer } from 'lucide-react'
import type { CaptureMode } from '@capture/core'

interface Props {
  onCapture: (mode: CaptureMode) => void
}

const MODES: { mode: CaptureMode; label: string; sub: string; Icon: React.FC<any> }[] = [
  { mode: 'visible', label: 'Visible Area', sub: 'Current viewport', Icon: Monitor },
  { mode: 'fullpage', label: 'Full Page', sub: 'Scroll & stitch', Icon: FileText },
  { mode: 'region', label: 'Select Region', sub: 'Drag to select', Icon: Scissors },
  { mode: 'element', label: 'Element', sub: 'Click to pick', Icon: Square },
  { mode: 'delayed', label: 'Delayed', sub: 'After 3s', Icon: Timer },
]

export function CaptureTab({ onCapture }: Props) {
  return (
    <div className="capture-tab">
      <p className="section-label">Screenshot Mode</p>
      <div className="capture-grid">
        {MODES.map(({ mode, label, sub, Icon }) => (
          <button key={mode} className="capture-btn" onClick={() => onCapture(mode)}>
            <Icon size={22} />
            <span className="btn-label">{label}</span>
            <span className="btn-sub">{sub}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
