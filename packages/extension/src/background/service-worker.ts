// packages/extension/src/background/service-worker.ts
import { handleCapture, type CaptureRequest } from './capture-handler'

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CAPTURE') {
    const tabId = sender.tab?.id ?? message.tabId
    if (tabId == null) {
      sendResponse({ ok: false, error: 'No tab ID available' })
      return true
    }
    handleCapture(tabId, message.payload as CaptureRequest)
      .then(dataUrl => sendResponse({ ok: true, dataUrl }))
      .catch(err => sendResponse({ ok: false, error: err.message }))
    return true // async response
  }
  if (message.type === 'START_RECORD') {
    console.warn('START_RECORD not yet implemented')
    sendResponse({ ok: false, error: 'Not implemented' })
    return true
  }
})
