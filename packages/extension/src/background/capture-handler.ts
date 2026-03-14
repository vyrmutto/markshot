// packages/extension/src/background/capture-handler.ts
import { stitchFrames, cropImageData } from '@capture/core'
import type { CaptureMode, Region } from '@capture/core'

export interface CaptureRequest {
  mode: CaptureMode
  region?: Region
  delayMs?: number
}

export async function handleCapture(
  tabId: number,
  request: CaptureRequest,
): Promise<string> {
  if (request.delayMs != null && request.delayMs > 0) {
    await new Promise(r => setTimeout(r, request.delayMs))
  }

  switch (request.mode) {
    case 'visible':
    case 'element': {
      const dataUrl = await chrome.tabs.captureVisibleTab({ format: 'png' })
      return dataUrl
    }

    case 'region': {
      const dataUrl = await chrome.tabs.captureVisibleTab({ format: 'png' })
      if (request.region) {
        return cropImageData(dataUrl, request.region)
      }
      return dataUrl
    }

    case 'fullpage': {
      const frames: string[] = []
      const { width, height } = await getViewport(tabId)

      const scrollInfo = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => ({
          scrollHeight: document.body.scrollHeight,
          scrollTop: window.scrollY,
        }),
      })
      const { scrollHeight } = scrollInfo[0].result as { scrollHeight: number; scrollTop: number }
      const steps = Math.ceil(scrollHeight / height)

      try {
        for (let i = 0; i < steps; i++) {
          await chrome.scripting.executeScript({
            target: { tabId },
            func: (y: number) => window.scrollTo(0, y),
            args: [i * height],
          })
          await new Promise(r => setTimeout(r, 150))
          frames.push(await chrome.tabs.captureVisibleTab({ format: 'png' }))
        }
      } finally {
        await chrome.scripting.executeScript({
          target: { tabId },
          func: () => window.scrollTo(0, 0),
        })
      }

      return stitchFrames(frames, width, height)
    }

    case 'delayed':
      return chrome.tabs.captureVisibleTab({ format: 'png' })

    default:
      throw new Error(`Unknown capture mode: ${request.mode}`)
  }
}

async function getViewport(tabId: number): Promise<{ width: number; height: number }> {
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => ({ width: window.innerWidth, height: window.innerHeight }),
  })
  return result[0].result as { width: number; height: number }
}
