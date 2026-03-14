import { Clipboard, Trash2 } from 'lucide-react'
import type { CaptureRecord } from '@capture/core'

interface Props {
  records: CaptureRecord[]
  onDelete: (id: string) => void
  onCopy: (record: CaptureRecord) => void
}

export function HistoryTab({ records, onDelete, onCopy }: Props) {
  if (records.length === 0) {
    return <p className="empty-state">No captures yet</p>
  }

  return (
    <ul className="history-list">
      {records.map(record => (
        <li key={record.id} className="history-item">
          <img
            src={record.thumbnailDataUrl}
            alt={record.title}
            className="history-thumb"
          />
          <div className="history-info">
            <p className="history-name">{record.title || record.url}</p>
            <p className="history-time">{new Date(record.capturedAt).toLocaleTimeString()}</p>
          </div>
          <div className="history-actions">
            <button title="Copy" onClick={() => onCopy(record)}>
              <Clipboard size={14} />
            </button>
            <button title="Delete" onClick={() => onDelete(record.id)}>
              <Trash2 size={14} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
