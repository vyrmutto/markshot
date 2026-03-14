import { handleCapture, type CaptureRequest } from './capture-handler'
import { startTabRecording, stopRecording } from './record-handler'

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
    return true
  }

  if (message.type === 'START_RECORD') {
    if (message.payload?.type === 'tab') {
      startTabRecording(message.tabId)
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
