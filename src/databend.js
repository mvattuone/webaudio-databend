export class Databender {
  constructor(image) {
    this.effects = []
    this.audioCtx = new AudioContext()

    this.canvas = document.createElement('canvas')
    this.canvas.width = image.width
    this.canvas.height = image.height

    this.channels = 1

    this.ctx = this.canvas.getContext('2d')
    this.ctx.drawImage(image, 0, 0)

    this.imageData = this.ctx.getImageData(0, 0, image.width, image.height).data

    this.bufferSize = this.imageData.length / this.channels

    this.audioBuffer = this.audioCtx.createBuffer(this.channels, this.bufferSize, this.audioCtx.sampleRate)

    this.nowBuffering = this.audioBuffer.getChannelData(0)
    this.nowBuffering.set(this.imageData)

    this.render(this.imageData)
  }

  render(data) {
    const effects = this.effects

    // @NOTE: This has to be instantiated every time we "render" because
    // `Uncaught (in promise) DOMException: cannot startRendering when an OfflineAudioContext is closed
    const offlineAudioCtx = new OfflineAudioContext(this.channels, this.bufferSize, this.audioCtx.sampleRate)

    // Create an AudioBufferSourceNode, which represents an audio source
    // consisting of in-memory audio data
    const bufferSource = offlineAudioCtx.createBufferSource()

    // Set buffer to audio buffer containing image data
    bufferSource.buffer = this.audioBuffer

    //  @NOTE: Calling this is when the AudioBufferSourceNode becomes unusable
    bufferSource.start()


    if (noEffects) {
      bufferSource.connect(offlineAudioCtx.destination)
    }

    // Kick off the render, callback will contain rendered buffer in event
    offlineAudioCtx.startRendering()

    // Render the databent image.
    offlineAudioCtx.oncomplete = (e) => {
      // Instead of starting the bufferSource, move data back into Canvas land.
      this.draw(e.renderedBuffer)
    }
  }

  draw(buffer) {
    // Get buffer data
    const bufferData = buffer.getChannelData(0)

    // ImageData expects a Uint8ClampedArray so we need to make a typed array from our buffer
    // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
    const clampedDataArray = new Uint8ClampedArray(buffer.length)

    // set the renderedBuffer to Uint8ClampedArray to use in ImageData later
    clampedDataArray.set(bufferData)

    // putImageData requires an ImageData Object
    // @see https://developer.mozilla.org/en-US/docs/Web/API/ImageData
    const transformedImage = new ImageData(clampedDataArray, this.canvas.width, this.canvas.height)
    this.ctx.putImageData(transformedImage, 0, 0)
    document.body.prepend(this.canvas)
  }
}
