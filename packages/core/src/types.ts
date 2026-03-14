export interface CaptureMeta {
  id: string
  capturedAt: number
  url: string
  title: string
  width: number
  height: number
  mode: CaptureMode
}

export type CaptureMode =
  | 'visible'
  | 'fullpage'
  | 'region'
  | 'element'
  | 'delayed'

export interface CaptureRecord extends CaptureMeta {
  blob: Blob
  thumbnailDataUrl: string
}

export interface Region {
  x: number
  y: number
  width: number
  height: number
}
