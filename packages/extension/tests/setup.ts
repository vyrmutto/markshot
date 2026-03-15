import { vi } from 'vitest'

// Global chrome mock for extension unit tests
const chromeMock = {
  tabs: {
    captureVisibleTab: vi.fn(),
    sendMessage: vi.fn(),
  },
  scripting: {
    executeScript: vi.fn(),
  },
  tabCapture: {
    capture: vi.fn(),
  },
  runtime: {
    onMessage: {
      addListener: vi.fn(),
    },
    sendMessage: vi.fn(),
  },
}

vi.stubGlobal('chrome', chromeMock)
