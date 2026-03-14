import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CaptureTab } from '../../src/popup/CaptureTab'

describe('CaptureTab', () => {
  it('renders all 5 capture mode buttons', () => {
    render(<CaptureTab onCapture={vi.fn()} />)
    expect(screen.getByText('Visible Area')).toBeInTheDocument()
    expect(screen.getByText('Full Page')).toBeInTheDocument()
    expect(screen.getByText('Select Region')).toBeInTheDocument()
    expect(screen.getByText('Element')).toBeInTheDocument()
    expect(screen.getByText('Delayed')).toBeInTheDocument()
  })

  it('calls onCapture with the correct mode when clicked', () => {
    const onCapture = vi.fn()
    render(<CaptureTab onCapture={onCapture} />)
    fireEvent.click(screen.getByText('Full Page'))
    expect(onCapture).toHaveBeenCalledWith('fullpage')
  })
})
