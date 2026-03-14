import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Toolbar } from '../../src/annotation/Toolbar'

const noop = vi.fn()

describe('Toolbar', () => {
  it('renders all 8 annotation tools', () => {
    render(
      <Toolbar activeTool="arrow" onToolChange={noop} color="#ff0000"
        onColorChange={noop} strokeWidth={3} onStrokeChange={noop}
        canUndo={false} canRedo={false} onUndo={noop} onRedo={noop}
        onSave={noop} onDone={noop} />
    )
    expect(screen.getByTitle('Arrow')).toBeInTheDocument()
    expect(screen.getByTitle('Rectangle')).toBeInTheDocument()
    expect(screen.getByTitle('Circle')).toBeInTheDocument()
    expect(screen.getByTitle('Text')).toBeInTheDocument()
    expect(screen.getByTitle('Pen')).toBeInTheDocument()
    expect(screen.getByTitle('Blur')).toBeInTheDocument()
    expect(screen.getByTitle('Highlight')).toBeInTheDocument()
    expect(screen.getByTitle('Counter')).toBeInTheDocument()
  })

  it('calls onToolChange when a tool is clicked', () => {
    const onToolChange = vi.fn()
    render(
      <Toolbar activeTool="arrow" onToolChange={onToolChange} color="#ff0000"
        onColorChange={noop} strokeWidth={3} onStrokeChange={noop}
        canUndo={false} canRedo={false} onUndo={noop} onRedo={noop}
        onSave={noop} onDone={noop} />
    )
    fireEvent.click(screen.getByTitle('Rectangle'))
    expect(onToolChange).toHaveBeenCalledWith('rect')
  })

  it('disables Undo button when canUndo is false', () => {
    render(
      <Toolbar activeTool="arrow" onToolChange={noop} color="#ff0000"
        onColorChange={noop} strokeWidth={3} onStrokeChange={noop}
        canUndo={false} canRedo={false} onUndo={noop} onRedo={noop}
        onSave={noop} onDone={noop} />
    )
    expect(screen.getByText('Undo')).toBeDisabled()
  })
})
