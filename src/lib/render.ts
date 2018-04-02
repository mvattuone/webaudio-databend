export const render = (
  canvas: HTMLCanvasElement,
  imageData: ImageData,
  audioBuffer: AudioBuffer
) => {
  const bufferData = audioBuffer.getChannelData(0)
  const clampedDataArray = new Uint8ClampedArray(audioBuffer.length)
  clampedDataArray.set(bufferData)

  const transformedImage = new ImageData(clampedDataArray, imageData.width, imageData.height)

  const context = canvas.getContext('2d')

  context.putImageData(transformedImage, 0, 0)
}
