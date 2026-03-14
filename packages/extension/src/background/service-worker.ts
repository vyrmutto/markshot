import { handleCapture, type CaptureRequest } from './capture-handler'
import { startTabRecording, stopRecording } from './record-handler'

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CAPTURE') {
    const tabId = sender.tab?.id ?? message.tabId
    if (tabId == null) {
      sendResponse?.({ ok: false, error: 'No tab ID available' })
      return true
    }

    const payload = message.payload as CaptureRequest

    const run = async (): Promise<void> => {
      let request: CaptureRequest = { mode: payload.mode, region: payload.region, delayMs: payload.delayMs }

      // For region mode without a pre-supplied region: first trigger region selector in content script
      if (payload.mode === 'region' && !payload.region) {
        const selResult = await chrome.tabs.sendMessage(tabId, { type: 'START_REGION_SELECTOR' })
        if (!selResult?.ok) throw new Error(selResult?.error ?? 'Region selection cancelled')
        request = { ...request, region: selResult.region }
      }

      const dataUrl = await handleCapture(tabId, request)

      // For region mode, service worker sends SHOW_EDITOR directly (popup is already closed)
      if (payload.mode === 'region') {
        // Resolve image dimensions via content script since Image API is unavailable in service workers
        const dims = await chrome.scripting.executeScript({
          target: { tabId },
          func: (src: string): Promise<{ w: number; h: number }> =>
            new Promise(resolve => {
              const img = new Image()
              img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
              img.onerror = () => resolve({ w: 0, h: 0 })
              img.src = src
            }),
          args: [dataUrl],
        })
        const { w, h } = (dims[0].result as { w: number; h: number }) ?? { w: 0, h: 0 }
        await chrome.tabs.sendMessage(tabId, {
          type: 'SHOW_EDITOR',
          dataUrl,
          width: w,
          height: h,
          mode: 'region',
        })
        sendResponse?.({ ok: true, dataUrl })
        return
      }

      sendResponse?.({ ok: true, dataUrl })
    }

    run().catch(err => sendResponse?.({ ok: false, error: err.message }))
    return true
  }

  if (message.type === 'START_RECORD') {
    if (message.payload?.type === 'tab') {
      startTabRecording()
        .then(() => sendResponse({ ok: true }))
        .catch(err => sendResponse({ ok: false, error: err.message }))
      return true
    }
    sendResponse({ ok: false, error: 'Only tab recording is supported via START_RECORD' })
    return true
  }

  if (message.type === 'STOP_RECORD') {
    stopRecording()
      .then(blob => blob.arrayBuffer())
      .then(buf => sendResponse({ ok: true, buffer: buf }))
      .catch(err => sendResponse({ ok: false, error: err.message }))
    return true
  }
})
