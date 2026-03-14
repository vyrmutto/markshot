// packages/extension/src/content/overlay.ts
import { createRoot } from 'react-dom/client'
import { createElement } from 'react'
import { AnnotationEditor } from '@capture/ui'
import { LocalProvider } from '@capture/storage'

let overlayRoot: ReturnType<typeof createRoot> | null = null

function injectEditor(dataUrl: string, width: number, height: number) {
  const container = document.createElement('div')
  container.id = '__capture-editor-root'
  Object.assign(container.style, {
    position: 'fixed', inset: '0', zIndex: '2147483647',
    background: 'rgba(0,0,0,0.6)',
  })
  document.body.appendChild(container)

  const storage = new LocalProvider()

  const handleSave = async (blob: Blob) => {
    // Save to local storage + trigger download
    await storage.upload(blob, {
      id: `capture-${Date.now()}`,
      capturedAt: Date.now(),
      url: window.location.href,
      title: document.title,
      width,
      height,
      mode: 'visible',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `capture-${Date.now()}.png`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDone = () => {
    overlayRoot?.unmount()
    container.remove()
    overlayRoot = null
  }

  overlayRoot = createRoot(container)
  overlayRoot.render(
    createElement(AnnotationEditor, {
      screenshotDataUrl: dataUrl,
      width,
      height,
      onSave: handleSave,
      onDone: handleDone,
    }),
  )
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'SHOW_EDITOR') {
    injectEditor(message.dataUrl, message.width, message.height)
  }
})
