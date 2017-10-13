export const render = (image, buffer) => {
  const canvas = document.querySelector('canvas')

  canvas.height = image.height
  canvas.width = image.width

  const context = canvas.getContext('2d')
  context.drawImage(image, 0, 0)
}