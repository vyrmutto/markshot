import { vi, describe, it, expect, beforeEach } from 'vitest'

// We'll use dynamic imports + resetModules to get fresh module state per test
describe('record-handler', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  async function importModule() {
    // Mock @capture/core fresh each time
    const mockRecorder = {
      isRecording: false,
      start: vi.fn(async () => {
        mockRecorder.isRecording = true
      }),
      stop: vi.fn(async () => new Blob(['video'], { type: 'video/webm' })),
    }
    vi.doMock('@capture/core', () => ({
      ScreenRecorder: vi.fn(() => mockRecorder),
    }))
    const mod = await import('../../src/background/record-handler')
    return { mod, mockRecorder }
  }

  it('startTabRecording: calls recorder.start with the stream from tabCapture', async () => {
    const { mod, mockRecorder } = await importModule()
    const fakeStream = { id: 'fake-stream' } as unknown as MediaStream
    ;(chrome.tabCapture.capture as ReturnType<typeof vi.fn>).mockImplementation(
      (_opts: unknown, cb: (s: MediaStream | null) => void) => cb(fakeStream)
    )

    await mod.startTabRecording()

    expect(chrome.tabCapture.capture).toHaveBeenCalledWith(
      { audio: true, video: true },
      expect.any(Function)
    )
    expect(mockRecorder.start).toHaveBeenCalledWith(fakeStream)
  })

  it('startTabRecording with null stream: throws Tab capture failed', async () => {
    const { mod } = await importModule()
    ;(chrome.tabCapture.capture as ReturnType<typeof vi.fn>).mockImplementation(
      (_opts: unknown, cb: (s: MediaStream | null) => void) => cb(null)
    )

    await expect(mod.startTabRecording()).rejects.toThrow('Tab capture failed')
  })

  it('stopRecording: calls recorder.stop and returns a blob', async () => {
    const { mod, mockRecorder } = await importModule()
    ;(chrome.tabCapture.capture as ReturnType<typeof vi.fn>).mockImplementation(
      (_opts: unknown, cb: (s: MediaStream | null) => void) => cb({ id: 'stream' } as unknown as MediaStream)
    )

    // Start recording first so stop has context
    await mod.startTabRecording()
    const blob = await mod.stopRecording()

    expect(mockRecorder.stop).toHaveBeenCalled()
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('video/webm')
  })

  it('isRecording: returns the recorder isRecording state', async () => {
    const { mod, mockRecorder } = await importModule()

    expect(mod.isRecording()).toBe(false)

    // Simulate recording started
    mockRecorder.isRecording = true
    expect(mod.isRecording()).toBe(true)
  })

  it('stopRecording throws when called before startTabRecording', async () => {
    // Use a mock that faithfully rejects when stop() is called before start()
    const mockRecorderThrowing = {
      isRecording: false,
      start: vi.fn(async () => { mockRecorderThrowing.isRecording = true }),
      stop: vi.fn(async () => { throw new Error('Not recording') }),
    }
    vi.doMock('@capture/core', () => ({
      ScreenRecorder: vi.fn(() => mockRecorderThrowing),
    }))
    const { stopRecording } = await import('../../src/background/record-handler')
    await expect(stopRecording()).rejects.toThrow('Not recording')
  })

  it('isRecording returns true after startTabRecording', async () => {
    ;(chrome.tabCapture.capture as ReturnType<typeof vi.fn>).mockImplementation((_opts: unknown, cb: (s: MediaStream | null) => void) =>
      cb({} as MediaStream)
    )
    const { startTabRecording, isRecording } = await import('../../src/background/record-handler')
    await startTabRecording()
    expect(isRecording()).toBe(true)
  })
})
