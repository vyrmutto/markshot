import { vi, describe, it, expect, beforeAll, beforeEach } from 'vitest'

vi.mock('../../src/background/capture-handler', () => ({
  handleCapture: vi.fn(async () => 'data:image/png;captured'),
}))

vi.mock('../../src/background/record-handler', () => ({
  startTabRecording: vi.fn(async () => {}),
  stopRecording: vi.fn(async () => new Blob(['video'], { type: 'video/webm' })),
  isRecording: vi.fn(() => false),
}))

type MessageListener = (
  msg: unknown,
  sender: unknown,
  sendResponse: (r: unknown) => void
) => boolean | void

let messageListener: MessageListener | undefined
let handleCapture: (tabId: number, req: unknown) => Promise<string>
let startTabRecording: () => Promise<void>
let stopRecording: () => Promise<Blob>

describe('service-worker', () => {
  beforeAll(async () => {
    // Set up the addListener interceptor before loading the module
    ;(chrome.runtime.onMessage.addListener as ReturnType<typeof vi.fn>).mockImplementation(
      (fn: MessageListener) => {
        messageListener = fn
      }
    )

    // Load the service worker (registers the message listener)
    await import('../../src/background/service-worker')

    // Load the mocked dependencies for assertions
    const captureMod = await import('../../src/background/capture-handler')
    handleCapture = captureMod.handleCapture as unknown as typeof handleCapture

    const recordMod = await import('../../src/background/record-handler')
    startTabRecording = recordMod.startTabRecording
    stopRecording = recordMod.stopRecording
  })

  beforeEach(() => {
    // clearAllMocks() clears call history and queued return values but preserves mockImplementation().
    // Do NOT switch to resetAllMocks() — that would remove the addListener implementation.
    vi.clearAllMocks()
    ;(chrome.tabs.sendMessage as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    ;(chrome.scripting.executeScript as ReturnType<typeof vi.fn>).mockResolvedValue([{ result: undefined }])
    // Re-set mock implementations after clearAllMocks
    ;(handleCapture as unknown as ReturnType<typeof vi.fn>).mockResolvedValue('data:image/png;captured')
    ;(startTabRecording as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    // jsdom's Blob doesn't implement arrayBuffer(), so we create a blob-like object
    // that has the method, matching what the service-worker code calls on it
    const fakeBuffer = new ArrayBuffer(5)
    const fakeBlob = { arrayBuffer: async () => fakeBuffer, type: 'video/webm', size: 5 }
    ;(stopRecording as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(fakeBlob)
  })

  async function callListener(msg: unknown, sender: unknown = {}) {
    if (!messageListener) throw new Error('Message listener was not registered')
    return new Promise<unknown>(resolve => {
      messageListener!(msg, sender, resolve)
    })
  }

  it('CAPTURE with no tabId: responds with error', async () => {
    const result = await callListener(
      { type: 'CAPTURE', payload: { mode: 'visible' } },
      {}
    )
    expect(result).toEqual({ ok: false, error: 'No tab ID available' })
  })

  it('CAPTURE with tabId in sender.tab.id: calls handleCapture and responds ok', async () => {
    const result = await callListener(
      { type: 'CAPTURE', payload: { mode: 'visible' } },
      { tab: { id: 1 } }
    )
    expect(handleCapture).toHaveBeenCalledWith(1, expect.objectContaining({ mode: 'visible' }))
    expect(result).toEqual({ ok: true, dataUrl: 'data:image/png;captured' })
  })

  it('CAPTURE with tabId in message: calls handleCapture and responds ok', async () => {
    const result = await callListener(
      { type: 'CAPTURE', payload: { mode: 'visible' }, tabId: 1 },
      {}
    )
    expect(handleCapture).toHaveBeenCalledWith(1, expect.objectContaining({ mode: 'visible' }))
    expect(result).toEqual({ ok: true, dataUrl: 'data:image/png;captured' })
  })

  it('CAPTURE region mode without region: sends START_REGION_SELECTOR and calls handleCapture with region', async () => {
    const region = { x: 0, y: 0, width: 100, height: 100 }
    ;(chrome.tabs.sendMessage as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, region })
      .mockResolvedValueOnce(undefined)

    ;(chrome.scripting.executeScript as ReturnType<typeof vi.fn>).mockResolvedValue([
      { result: { w: 100, h: 100 } },
    ])

    const result = await callListener(
      { type: 'CAPTURE', payload: { mode: 'region' } },
      { tab: { id: 1 } }
    )

    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(1, { type: 'START_REGION_SELECTOR' })
    expect(handleCapture).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ mode: 'region', region })
    )
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ type: 'SHOW_EDITOR', mode: 'region' })
    )
    expect(result).toEqual({ ok: true, dataUrl: 'data:image/png;captured' })
  })

  it('CAPTURE region mode selection cancelled: responds with error', async () => {
    ;(chrome.tabs.sendMessage as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      error: 'cancelled',
    })

    const result = await callListener(
      { type: 'CAPTURE', payload: { mode: 'region' } },
      { tab: { id: 1 } }
    )
    expect(result).toEqual({ ok: false, error: 'cancelled' })
  })

  it('START_RECORD tab: calls startTabRecording and responds ok', async () => {
    const result = await callListener(
      { type: 'START_RECORD', payload: { type: 'tab' } }
    )
    expect(startTabRecording).toHaveBeenCalled()
    expect(result).toEqual({ ok: true })
  })

  it('START_RECORD non-tab type: responds with error', async () => {
    const result = await callListener(
      { type: 'START_RECORD', payload: { type: 'screen' } }
    )
    expect(result).toEqual({
      ok: false,
      error: 'Only tab recording is supported via START_RECORD',
    })
  })

  it('STOP_RECORD: calls stopRecording and responds with buffer', async () => {
    const result = (await callListener({ type: 'STOP_RECORD' })) as {
      ok: boolean
      buffer: ArrayBuffer
    }
    expect(stopRecording).toHaveBeenCalled()
    expect(result.ok).toBe(true)
    expect(result.buffer).toBeInstanceOf(ArrayBuffer)
  })
})
