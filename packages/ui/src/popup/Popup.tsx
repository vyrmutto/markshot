import { useState } from 'react'
import { Camera } from 'lucide-react'
import { CaptureTab } from './CaptureTab'
import { HistoryTab } from './HistoryTab'
import type { CaptureMode, CaptureRecord } from '@capture/core'
import './popup.css'

type Tab = 'capture' | 'record' | 'history'

interface Props {
  onCapture: (mode: CaptureMode) => void
  onRecord: (type: 'tab' | 'screen') => void
  history?: CaptureRecord[]
  onDeleteHistory?: (id: string) => void
  onCopyHistory?: (record: CaptureRecord) => void
}

export function Popup({ onCapture, onRecord, history = [], onDeleteHistory, onCopyHistory }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('capture')

  return (
    <div className="popup">
      <header className="popup-header">
        <Camera size={28} color="white" className="popup-logo" aria-hidden />
        <div>
          <div className="popup-title">Markshot</div>
          <div className="popup-subtitle">Open source · Local first</div>
        </div>
      </header>

      <nav className="popup-tabs">
        {(['capture', 'record', 'history'] as Tab[]).map(tab => (
          <button
            key={tab}
            className={`popup-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      <div className="popup-body">
        {activeTab === 'capture' && <CaptureTab onCapture={onCapture} />}
        {activeTab === 'record' && (
          <div className="record-grid">
            <button className="capture-btn" onClick={() => onRecord('tab')}>
              🎬 <span className="btn-label">Record Tab</span>
            </button>
            <button className="capture-btn" onClick={() => onRecord('screen')}>
              🖥 <span className="btn-label">Record Screen</span>
            </button>
          </div>
        )}
        {activeTab === 'history' && (
          <HistoryTab
            records={history}
            onDelete={onDeleteHistory ?? (() => {})}
            onCopy={onCopyHistory ?? (() => {})}
          />
        )}
      </div>
    </div>
  )
}
