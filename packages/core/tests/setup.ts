import { vi } from 'vitest'

// A minimal stub for CanvasRenderingContext2D that records calls without crashing
function makeContext2DStub() {
  return {
    fillStyle: '',
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })),
    putImageData: vi.fn(),
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    drawFocusIfNeeded: vi.fn(),
  }
}

// jsdom doesn't implement getContext without the native canvas binary.
// Patch HTMLCanvasElement prototype so getContext('2d') always returns our stub,
// and toDataURL returns a valid PNG data URL prefix.
const FAKE_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  writable: true,
  configurable: true,
  value: function (type: string) {
    if (type === '2d') return makeContext2DStub()
    return null
  },
})

Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
  writable: true,
  configurable: true,
  value: function () {
    return FAKE_DATA_URL
  },
})

// jsdom's HTMLImageElement doesn't fire onload automatically.
// Patch Image so that setting src immediately invokes onload.
class MockImage {
  public onload: (() => void) | null = null
  public onerror: ((err: unknown) => void) | null = null
  public width = 0
  public height = 0
  private _src = ''

  get src() {
    return this._src
  }

  set src(value: string) {
    this._src = value
    // Fire onload asynchronously so Promise-based code works correctly
    setTimeout(() => {
      if (this.onload) this.onload()
    }, 0)
  }
}

// Replace the global Image with our mock
Object.defineProperty(globalThis, 'Image', {
  writable: true,
  configurable: true,
  value: MockImage,
})
