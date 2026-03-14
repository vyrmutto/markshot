import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ScreenRecorder } from '../../src/video/recorder'

function makeStream() {
  return {} as MediaStream
}

function makeMediaRecorder(chunks: Blob[] = []) {
  const mr: Partial<MediaRecorder> & { _fire: (event: string) => void } = {
    state: 'inactive' as RecordingState,
    ondataavailable: null as unknown as ((e: BlobEvent) => void) | null,
    onstop: null as unknown as (() => void) | null,
    start: vi.fn(function (this: typeof mr) {
      (this as unknown as { state: string }).state = 'recording'
    }),
    stop: vi.fn(function (this: typeof mr) {
      (this as unknown as { state: string }).state = 'inactive'
      // fire queued data then stop
      for (const chunk of chunks) {
        this.ondataavailable?.({ data: chunk } as BlobEvent)
      }
      this.onstop?.()
    }),
    _fire(event: string) {
      if (event === 'stop') this.onstop?.()
    },
  }
  return mr as unknown as MediaRecorder
}

describe('ScreenRecorder', () => {
  let recorder: ScreenRecorder
  let mockMR: MediaRecorder

  beforeEach(() => {
    recorder = new ScreenRecorder()
    const chunk = new Blob(['data'], { type: 'video/webm' })
    mockMR = makeMediaRecorder([chunk])
    vi.stubGlobal('MediaRecorder', vi.fn(() => mockMR))
  })

  it('starts recording on a stream', async () => {
    await recorder.start(makeStream())
    expect(recorder.isRecording).toBe(true)
  })

  it('stops and returns a webm blob', async () => {
    await recorder.start(makeStream())
    const blob = await recorder.stop()
    expect(blob.type).toBe('video/webm')
  })

  it('throws when stopping without starting', async () => {
    await expect(recorder.stop()).rejects.toThrow('Not recording')
  })
})
