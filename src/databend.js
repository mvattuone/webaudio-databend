    var Tuna = require('tunajs'); 
    var effects = require('./effects');
    window.random = require('random-js')();
    var config = require('./config.json');

    // Create a Databender instance
    module.exports = function (audioCtx, renderCanvas) {
      this.config = config;
      this.configIndex = Object.keys(config);

      // Create an AudioContext or use existing one
      this.audioCtx = audioCtx ? audioCtx : new AudioContext();
      this.renderCanvas = renderCanvas;
      
      this.channels = 1; // @TODO: What would multiple channels look like? 

      this.bend = function (image) {
        if (image instanceof Image || image instanceof HTMLVideoElement) {
          var canvas = document.createElement('canvas');
          canvas.width = 1280;
          canvas.height = 768;
          var context = canvas.getContext('2d');
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        }
        this.imageData = imageData || image;
        var bufferSize = this.imageData.data.length / this.channels;

        // Make an audioBuffer on the audioContext to pass to the offlineAudioCtx AudioBufferSourceNode
        var audioBuffer = this.audioCtx.createBuffer(this.channels, bufferSize, this.config.sampleRate); 

        // This gives us the actual ArrayBuffer that contains the data
        var nowBuffering = audioBuffer.getChannelData(0);

        nowBuffering.set(this.imageData.data);

        return Promise.resolve(audioBuffer);
      }

      this.render = function (buffer) {
        this.previousConfig = this.previousConfig || JSON.parse(JSON.stringify(this.config));

        // Create offlineAudioCtx that will house our rendered buffer
        var offlineAudioCtx = new OfflineAudioContext(this.channels, buffer.length * this.channels, this.audioCtx.sampleRate);

        // Create an AudioBufferSourceNode, which represents an audio source consisting of in-memory audio data
        var bufferSource = offlineAudioCtx.createBufferSource();

        // Set buffer to audio buffer containing image data
        bufferSource.buffer = buffer; 

        if (this.previousConfig !== this.config) {
          var activeConfig = this.configIndex.reduce((acc, cur) => {
            config[cur].active ? acc[cur] = config[cur] : false; 
            return acc;
          }, {});
          var activeConfigIndex = Object.keys(activeConfig);
          this.previousConfig = JSON.parse(JSON.stringify(this.config));
        }

        if (this.config !== this.config && activeConfigIndex && activeConfigIndex.length) {
          activeConfigIndex.forEach((effect) => {
            if (effect === 'detune' || effect === 'playbackRate') {
              return effects[effect](bufferSource, config)
            }
          });
        }

        bufferSource.start();

        if (activeConfigIndex && activeConfigIndex.length) {
          var tuna = new Tuna(offlineAudioCtx);

          var nodes = activeConfigIndex.map((effect) => { 
            if (effect !== 'detune' && effect !== 'playbackRate') {
              if (effect === 'biquad') {
                return effects[effect](bufferSource, offlineAudioCtx, config);
              } else {
                return effects[effect](tuna, config);
              }
            }
          }).filter(Boolean);
        }

        if (!nodes || nodes.length === 0) {
          bufferSource.connect(offlineAudioCtx.destination);
        } else {
          nodes.forEach((node) => { 
            bufferSource.connect(node);
            node.connect(offlineAudioCtx.destination);
          });
        }

        // Kick off the render, callback will contain rendered buffer in event
        return offlineAudioCtx.startRendering();
      };

      this.draw = function (buffer) {

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

        renderCanvas.getContext('2d').putImageData(transformedImage, 0, 0);
      };


      return this;
    };
