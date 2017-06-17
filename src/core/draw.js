export default function draw (buffer) {
  // Get buffer data
  var bufferData = buffer.getChannelData(0);

  // ImageData expects a Uint8ClampedArray so we need to make a typed array from our buffer
  // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
  var clampedDataArray = new Uint8ClampedArray(buffer.length)

  // set the renderedBuffer to Uint8ClampedArray to use in ImageData later
  clampedDataArray.set(bufferData);

  // putImageData requires an ImageData Object
  // @see https://developer.mozilla.org/en-US/docs/Web/API/ImageData
  var transformedImage = new ImageData(clampedDataArray, this.canvas.width, this.canvas.height)
  this.ctx.putImageData(transformedImage, 0, 0);
  document.body.prepend(this.canvas);
}
