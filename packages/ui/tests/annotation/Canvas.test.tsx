import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { Canvas } from '../../src/annotation/Canvas'

vi.mock('fabric', () => ({
  Canvas: vi.fn().mockImplementation(() => ({
    dispose: vi.fn(),
    renderAll: vi.fn(),
    toDataURL: vi.fn(() => 'data:image/png;base64,stub'),
    set: vi.fn(),
    backgroundImage: null,
    on: vi.fn(),
    off: vi.fn(),
    isDrawingMode: false,
    freeDrawingBrush: { color: '', width: 0 },
  })),
  FabricImage: {
    fromURL: vi.fn().mockResolvedValue({ set: vi.fn() }),
  },
}))

describe('Canvas', () => {
  it('renders a canvas element', () => {
    const { container } = render(
      <Canvas ref={null} backgroundDataUrl="data:image/png;base64,abc" width={800} height={600} />
    )
    expect(container.querySelector('canvas')).not.toBeNull()
  })
})
