// packages/extension/src/popup/index.tsx
import { createRoot } from 'react-dom/client'
import { Popup } from '@capture/ui'
import type { CaptureMode } from '@capture/core'

async function triggerCapture(mode: CaptureMode) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab.id) return

  const response = await chrome.runtime.sendMessage({
    type: 'CAPTURE',
    tabId: tab.id,
    payload: { mode },
  })

  if (response.ok) {
    const img = new Image()
    img.onload = () => {
      chrome.tabs.sendMessage(tab.id!, {
        type: 'SHOW_EDITOR',
        dataUrl: response.dataUrl,
        width: img.naturalWidth,
        height: img.naturalHeight,
        mode,
      })
      window.close()
    }
    img.src = response.dataUrl
  } else {
    console.error('Capture failed:', response.error)
  }
}

function triggerRecord(type: 'tab' | 'screen') {
  chrome.runtime.sendMessage({ type: 'START_RECORD', payload: { type } })
  window.close()
}

const root = createRoot(document.getElementById('root')!)
root.render(<Popup onCapture={triggerCapture} onRecord={triggerRecord} />)
