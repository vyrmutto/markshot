// packages/extension/src/background/service-worker.ts
import { handleCapture, type CaptureRequest } from './capture-handler'

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CAPTURE') {
    const tabId = sender.tab?.id ?? message.tabId
    handleCapture(tabId, message.payload as CaptureRequest)
      .then(dataUrl => sendResponse({ ok: true, dataUrl }))
      .catch(err => sendResponse({ ok: false, error: err.message }))
    return true // async response
  }
})
