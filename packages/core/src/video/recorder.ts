// packages/core/src/video/recorder.ts
export class ScreenRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private chunks: Blob[] = []

  async start(stream: MediaStream): Promise<void> {
    if (this.isRecording) {
      throw new Error('Already recording')
    }
    this.chunks = []

    const mimeType = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
    ].find(t => MediaRecorder.isTypeSupported(t)) ?? ''

    this.mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})
    this.mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) this.chunks.push(e.data)
    }
    this.mediaRecorder.start(100)
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) return reject(new Error('Not recording'))
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.mediaRecorder?.mimeType ?? 'video/webm' })
        this.mediaRecorder = null
        resolve(blob)
      }
      this.mediaRecorder.stop()
    })
  }

  get isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }
}
