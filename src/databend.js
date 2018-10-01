var effects = require('./effects');
var Tuna = require('tunajs');

// Create a Databender instance
module.exports = function (config, audioCtx) {
  this.audioCtx = audioCtx ? audioCtx : new AudioContext();
  this.channels = 1; 
  this.config = config;
  this.configKeys = Object.keys(this.config);
  this.previousConfig = this.config;

  this.convert = function (image) {
    if (image instanceof Image || image instanceof HTMLVideoElement) {
      var canvas = document.createElement('canvas');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      var context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    }
    this.imageData = imageData || image;
    var bufferSize = this.imageData.data.length / this.channels;

    // Make an audioBuffer on the audioContext to pass to the offlineAudioCtx AudioBufferSourceNode
    var audioBuffer = this.audioCtx.createBuffer(this.channels, bufferSize, this.audioCtx.sampleRate); 

    // This gives us the actual ArrayBuffer that contains the data
    var nowBuffering = audioBuffer.getChannelData(0);

    nowBuffering.set(this.imageData.data);

    return Promise.resolve(audioBuffer);
  }

  this.configHasChanged = function () { 
    return JSON.stringify(this.previousConfig) !== JSON.stringify(this.config);
  }

  this.render = function (buffer, bypass = false) {

    // Create offlineAudioCtx that will house our rendered buffer
    var offlineAudioCtx = new OfflineAudioContext(this.channels, buffer.length * this.channels, this.audioCtx.sampleRate);

    var tuna = new Tuna(offlineAudioCtx);

    // Create an AudioBufferSourceNode, which represents an audio source consisting of in-memory audio data
    var bufferSource = offlineAudioCtx.createBufferSource();

    // Set buffer to audio buffer containing image data
    bufferSource.buffer = buffer; 

    var activeEffects = this.configKeys.reduce((acc, cur) => {
      this.config[cur].active ? acc[cur] = effects[cur] : false; 
      return acc;
    }, {});
    var activeEffectsIndex = Object.keys(activeEffects);

    bufferSource.start();

    if (activeEffectsIndex && activeEffectsIndex.length) {
      activeEffectsIndex.forEach((effect) => {
        if (effect === 'detune' || effect === 'playbackRate') {
          effects[effect](this.config, tuna, bufferSource);
          activeEffectsIndex.pop();
        }
      });
    }

    if (!activeEffectsIndex.length) {
      bufferSource.connect(offlineAudioCtx.destination);
    } else {
      var nodes = activeEffectsIndex.map((effect) => { 
        const context = effect === 'biquad' ? offlineAudioCtx : tuna
        return effects[effect](this.config, context, bufferSource);
      }).filter(Boolean);

      nodes.forEach((node) => { 
        bufferSource.connect(node);
        node.connect(offlineAudioCtx.destination);
      });
    }

    this.previousConfig = this.config; 
    // Kick off the render, callback will contain rendered buffer in event
    return offlineAudioCtx.startRendering();
  };

  this.draw = function (buffer, context, x = 0, y = 0) {
    // Get buffer data
    var bufferData = buffer.getChannelData(0);

    // ImageData expects a Uint8ClampedArray so we need to make a typed array from our buffer
    // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
    var clampedDataArray = new Uint8ClampedArray(buffer.length)

    // set the renderedBuffer to Uint8ClampedArray to use in ImageData later
    clampedDataArray.set(bufferData);

    // putImageData requires an ImageData Object
    // @see https://developer.mozilla.org/en-US/docs/Web/API/ImageData
    var transformedImage = new ImageData(clampedDataArray, this.imageData.width, this.imageData.height);
    context.putImageData(transformedImage, x, y);
  };

  this.bend = function (data, context, x = 0, y = 0) { 
    return this.convert(data)
      .then((buffer) => this.render(buffer))
      .then((buffer) => this.draw(buffer, context, x, y))
  };

  return this;
};
