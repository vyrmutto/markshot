// packages/core/src/video/recorder.ts
export class ScreenRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private chunks: Blob[] = []

  async start(stream: MediaStream): Promise<void> {
    this.chunks = []
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
    })
    this.mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) this.chunks.push(e.data)
    }
    this.mediaRecorder.start(100)
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) return reject(new Error('Not recording'))
      this.mediaRecorder.onstop = () => {
        resolve(new Blob(this.chunks, { type: 'video/webm' }))
      }
      this.mediaRecorder.stop()
    })
  }

  get isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }
}
