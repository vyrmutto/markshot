import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HistoryTab } from '../../src/popup/HistoryTab'
import type { CaptureRecord } from '@capture/core'

const record: CaptureRecord = {
  id: 'r1', capturedAt: Date.now(), url: 'https://x.com', title: 'X',
  width: 800, height: 600, mode: 'visible',
  blob: new Blob(['x'], { type: 'image/png' }),
  thumbnailDataUrl: 'data:image/png;base64,abc',
}

describe('HistoryTab', () => {
  it('shows a thumbnail for each record', () => {
    render(<HistoryTab records={[record]} onDelete={vi.fn()} onCopy={vi.fn()} />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('shows empty state when no records', () => {
    render(<HistoryTab records={[]} onDelete={vi.fn()} onCopy={vi.fn()} />)
    expect(screen.getByText(/no captures/i)).toBeInTheDocument()
  })

  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn()
    render(<HistoryTab records={[record]} onDelete={onDelete} onCopy={vi.fn()} />)
    fireEvent.click(screen.getByTitle('Delete'))
    expect(onDelete).toHaveBeenCalledWith('r1')
  })
})
