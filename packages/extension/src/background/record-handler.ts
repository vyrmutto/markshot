// packages/extension/src/background/record-handler.ts
import { ScreenRecorder } from '@capture/core'

const recorder = new ScreenRecorder()

export async function startTabRecording(tabId: number): Promise<void> {
  const stream = await chrome.tabCapture.capture({ audio: true, video: true })
  if (!stream) throw new Error('Tab capture failed')
  await recorder.start(stream)
}

export async function stopRecording(): Promise<Blob> {
  return recorder.stop()
}

export function isRecording(): boolean {
  return recorder.isRecording
}
