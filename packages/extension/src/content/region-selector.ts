// packages/extension/src/content/region-selector.ts
import type { Region } from '@capture/core'

export function startRegionSelector(): Promise<Region> {
  return new Promise(resolve => {
    const overlay = document.createElement('div')
    overlay.id = '__capture-region-overlay'
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', cursor: 'crosshair',
      zIndex: '2147483647', background: 'rgba(0,0,0,0.3)',
    })
    document.body.appendChild(overlay)

    let startX = 0, startY = 0
    const selection = document.createElement('div')
    Object.assign(selection.style, {
      position: 'fixed', border: '2px solid #ff4757',
      background: 'rgba(255,71,87,0.1)', pointerEvents: 'none',
      zIndex: '2147483648',
    })
    document.body.appendChild(selection)

    const onMouseDown = (e: MouseEvent) => {
      startX = e.clientX; startY = e.clientY
    }

    const onMouseMove = (e: MouseEvent) => {
      const x = Math.min(e.clientX, startX)
      const y = Math.min(e.clientY, startY)
      const w = Math.abs(e.clientX - startX)
      const h = Math.abs(e.clientY - startY)
      Object.assign(selection.style, {
        left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`,
      })
    }

    const onMouseUp = (e: MouseEvent) => {
      overlay.removeEventListener('mousedown', onMouseDown)
      overlay.removeEventListener('mousemove', onMouseMove)
      overlay.removeEventListener('mouseup', onMouseUp)
      overlay.remove()
      selection.remove()

      const dpr = window.devicePixelRatio
      resolve({
        x: Math.min(e.clientX, startX) * dpr,
        y: Math.min(e.clientY, startY) * dpr,
        width: Math.abs(e.clientX - startX) * dpr,
        height: Math.abs(e.clientY - startY) * dpr,
      })
    }

    overlay.addEventListener('mousedown', onMouseDown)
    overlay.addEventListener('mousemove', onMouseMove)
    overlay.addEventListener('mouseup', onMouseUp)
  })
}
