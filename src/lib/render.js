export const render = ({imageData, audioBuffer}) => {
  console.log(imageData, audioBuffer)
  const bufferData = audioBuffer.getChannelData(0)
  const clampedDataArray = new Uint8ClampedArray(audioBuffer.length)
  clampedDataArray.set(bufferData)

  const transformedImage = new ImageData(clampedDataArray, imageData.width, imageData.height)

  const canvas = document.querySelector('canvas')
  const context = canvas.getContext('2d')

  context.putImageData(transformedImage, 0, 0)
}