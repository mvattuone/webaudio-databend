export default function convert (image) {
  // Create in-memory (i.e. non-rendered canvas for getting Image Data
  var canvas = this.canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height= image.height;
  canvas.id = 'canvas-' + Date.now();
  var ctx = this.ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  var imageData = ctx.getImageData(0, 0, image.width, image.height).data;
  return imageData;
}
