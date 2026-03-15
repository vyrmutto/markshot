import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

vi.mock('@capture/core', () => ({
  stitchFrames: vi.fn(async () => 'data:image/png;stitched'),
  cropImageData: vi.fn(async (_url: string, _region: unknown) => 'data:image/png;cropped'),
}))

import { handleCapture } from '../../src/background/capture-handler'
import { stitchFrames, cropImageData } from '@capture/core'

describe('capture-handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('visible mode: calls captureVisibleTab once and returns its result', async () => {
    const mockUrl = 'data:image/png;visible'
    ;(chrome.tabs.captureVisibleTab as ReturnType<typeof vi.fn>).mockResolvedValue(mockUrl)

    const result = await handleCapture(1, { mode: 'visible' })

    expect(chrome.tabs.captureVisibleTab).toHaveBeenCalledTimes(1)
    expect(chrome.tabs.captureVisibleTab).toHaveBeenCalledWith({ format: 'png' })
    expect(result).toBe(mockUrl)
  })

  it('element mode: calls captureVisibleTab once and returns its result', async () => {
    const mockUrl = 'data:image/png;element'
    ;(chrome.tabs.captureVisibleTab as ReturnType<typeof vi.fn>).mockResolvedValue(mockUrl)

    const result = await handleCapture(1, { mode: 'element' })

    expect(chrome.tabs.captureVisibleTab).toHaveBeenCalledTimes(1)
    expect(chrome.tabs.captureVisibleTab).toHaveBeenCalledWith({ format: 'png' })
    expect(result).toBe(mockUrl)
  })

  it('region mode with region: calls captureVisibleTab then cropImageData, returns cropped url', async () => {
    const mockUrl = 'data:image/png;region'
    ;(chrome.tabs.captureVisibleTab as ReturnType<typeof vi.fn>).mockResolvedValue(mockUrl)

    const region = { x: 0, y: 0, width: 100, height: 100 }
    const result = await handleCapture(1, { mode: 'region', region })

    expect(chrome.tabs.captureVisibleTab).toHaveBeenCalledTimes(1)
    expect(cropImageData).toHaveBeenCalledWith(mockUrl, region)
    expect(result).toBe('data:image/png;cropped')
  })

  it('region mode without region: calls captureVisibleTab, returns uncropped url', async () => {
    const mockUrl = 'data:image/png;region-no-crop'
    ;(chrome.tabs.captureVisibleTab as ReturnType<typeof vi.fn>).mockResolvedValue(mockUrl)

    const result = await handleCapture(1, { mode: 'region' })

    expect(chrome.tabs.captureVisibleTab).toHaveBeenCalledTimes(1)
    expect(cropImageData).not.toHaveBeenCalled()
    expect(result).toBe(mockUrl)
  })

  it('fullpage mode: scrolls through pages and stitches frames', async () => {
    const frameUrl = 'data:image/png;frame'
    ;(chrome.tabs.captureVisibleTab as ReturnType<typeof vi.fn>).mockResolvedValue(frameUrl)

    // executeScript mock: 1st call = getViewport, 2nd call = scrollInfo, remaining = scroll steps + restore
    ;(chrome.scripting.executeScript as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([{ result: { width: 800, height: 600 } }])   // getViewport call
      .mockResolvedValueOnce([{ result: { scrollHeight: 1200, scrollTop: 0 } }])  // scrollInfo call
      .mockResolvedValue([{ result: undefined }])  // scroll step(s) + restore scroll

    const result = await handleCapture(1, { mode: 'fullpage' })

    // 1200 / 600 = 2 frames
    expect(chrome.tabs.captureVisibleTab).toHaveBeenCalledTimes(2)
    expect(stitchFrames).toHaveBeenCalledWith([frameUrl, frameUrl], 800, 600)
    expect(result).toBe('data:image/png;stitched')
  })

  describe('delayed mode', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it('waits delayMs before capturing', async () => {
      const mockUrl = 'data:image/png;delayed'
      ;(chrome.tabs.captureVisibleTab as ReturnType<typeof vi.fn>).mockResolvedValue(mockUrl)

      const capturePromise = handleCapture(1, { mode: 'delayed', delayMs: 50 })

      // Advance timers by the delay amount
      await vi.advanceTimersByTimeAsync(50)

      const result = await capturePromise

      expect(chrome.tabs.captureVisibleTab).toHaveBeenCalledTimes(1)
      expect(result).toBe(mockUrl)
    })
  })

  it('unknown mode: throws Unknown capture mode error', async () => {
    await expect(
      handleCapture(1, { mode: 'unknown' as never })
    ).rejects.toThrow('Unknown capture mode: unknown')
  })
})
