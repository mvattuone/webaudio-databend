    var Tuna = require('tunajs'); 

    // Create a Databender instance
    module.exports = function (image, audioCtx) {
      var _this = this;

      this.effects = {
        channelShift: {
          active: false,
          weight: 40,
          shiftRed: false,
          shiftBlue: false,
          shiftGreen: false
        },
        bitcrusher: {
          active: false,
          bits: 16,
          normfreq: 0.1,
          bufferSize: 4096
        },
        convolver: {
          active: false,
          highCut: 22050,
          lowCut: 20,
          dryLevel: 1,
          wetLevel: 1,
          level: 1,
          impulse: "CathedralRoom.wav " // @TODO add more options, maybe API call for search in real time?
        },
        biquad: {
          active: false,
          type: "highpass",
          biquadFrequency: 4000,
          biquadGain: 1
        },
        gain: {
          active: false,
          value: 1
        },
        detune: {
          active: false,
          value: 0
        },
        playbackRate: {
          active: false,
          value: 1
        },
        pingPong: {
          active: false,
          feedback: 0.3,
          wetLevel: 0.5,
          delayTimeLeft: 10,
          delayTimeRight: 10
        },
        phaser: {
          active: false,
          rate: 1.2,
          depth: 0.4,
          feedback: 0.5,
          stereoPhase: 10,
          baseModulationFrequency: 500
        },
        wahwah: {
          active: false,
          automode: true,
          baseFrequency: 0.5,
          excursionOctaves: 2,
          sweep: 0.2,
          resonance: 10,
          sensitivity: 0.5,
        }
      }

      // Create an AudioContext or use existing one
      this.audioCtx = audioCtx ? audioCtx : new AudioContext();

      // Create in-memory (i.e. non-rendered canvas for getting Image Data)
      var canvas = this.canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height= image.height;

      this.channels = 1;
      var ctx = this.ctx = canvas.getContext('2d');

      // Draw image to canvas and get image data
      ctx.drawImage(image, 0, 0);
      this.imageData = ctx.getImageData(0, 0, image.width, image.height).data;

      this.bufferSize = this.imageData.length / this.channels;

      // flag to determine if channelShifting has occured, as it mutates buffer
      this.channelShifted = false;

      // Make an audioBuffer on the audioContext to pass to the offlineAudioCtx AudioBufferSourceNode
      this.audioBuffer = this.audioCtx.createBuffer(this.channels, this.bufferSize, this.audioCtx.sampleRate);

      // This gives us the actual ArrayBuffer that contains the data
      this.nowBuffering = this.audioBuffer.getChannelData(0);


      // set the AudioBuffer buffer to the same as the imageData audioBuffer
      // v. convenient becuase you do not need to convert the data yourself
      this.nowBuffering.set(this.imageData);

      this.setParam = function (effect, paramName, paramValue)  {
        this.effects[effect][paramName] = paramValue;
        return this.render(this.imageData);
      }

      this.toggleEffect = function (effect, params) {
        this.effects[effect].active = !this.effects[effect].active
        return this.render(this.imageData);
      }

      this.setEffect = function (effect) {
        this.effects[effect].active = true
        return this.render(this.imageData);
      }

      this.unsetEffect = function (effect) {
        effects[effect].active = false
        return this.render(this.imageData);
      }

      this.render = function (data) {
        var _this = this;
        var effects = this.effects;

        // @NOTE: This has to be instantiated every time we "render" because
        // `Uncaught (in promise) DOMException: cannot startRendering when an OfflineAudioContext is closed
        var offlineAudioCtx = new OfflineAudioContext(this.channels, this.bufferSize, this.audioCtx.sampleRate);

        if (!this.effects.channelShift.active && this.channelShifted) {
          this.nowBuffering.set(this.imageData);
        }

        // Create an AudioBufferSourceNode, which represents an audio source
        // consisting of in-memory audio data
        var bufferSource = offlineAudioCtx.createBufferSource();

        // Channel shifting is moving certain color components from one pixel to another pixel
        // @NOTE pretty janky and could be better, doesn't really fit w/ this type of databending
        if (effects.channelShift.active) {
          var nowBuffering = this.audioBuffer.getChannelData(0);
          var weight = effects.channelShift.weight;
          for (var i = 0; i < this.bufferSize; i+=4) {
            if (i % (this.canvas.width / weight) === 0) {
              if (effects.channelShift.shiftRed) {
                nowBuffering[i] = 0;
              }

              if (effects.channelShift.shiftGreen) {
                nowBuffering[i+1] = 0;
              }

              if (effects.channelShift.shiftBlue) {
                nowBuffering[i+2] = 0;
              }

            }
          }
          this.channelShifted = true;
        }

        // Set buffer to audio buffer containing image data
        bufferSource.buffer = this.audioBuffer;

        // Seems to rotate the image, clockwise if postitive ccw if negative
        if (effects.detune.active) {
          var noEffects = false;
          bufferSource.detune.value = effects.detune.value;
        }

        // Seems to "play back" the image at a rate equal to the number
        // (i.e. 4 yields 4 smaller rendered images)
        if (effects.playbackRate.active) {
          var noEffects = false;
          bufferSource.playbackRate.value = effects.playbackRate.value;
        }

        //  @NOTE: Calling this is when the AudioBufferSourceNode becomes unusable
        bufferSource.start();

        // @TODO Can we decouple effects from this?
        var noEffects = true;
        var tuna = new Tuna(offlineAudioCtx);


        if (effects.bitcrusher.active) {
          var noEffects = false;

          var crusher = new tuna.Bitcrusher({
              bits: effects.bitcrusher.bits,
              normfreq: effects.bitcrusher.normfreq,
              bufferSize: effects.bitcrusher.bufferSize
          });
          bufferSource.connect(crusher);
          crusher.connect(offlineAudioCtx.destination);
        }

        if (effects.biquad.active) {
          var noEffects = false;
          var biquadFilter = offlineAudioCtx.createBiquadFilter();
          biquadFilter.type = effects.biquad.type;
          biquadFilter.frequency.value = effects.biquad.biquadFrequency;
          biquadFilter.gain.value = effects.biquad.biquadGain;
          bufferSource.connect(biquadFilter);
          biquadFilter.connect(offlineAudioCtx.destination);
        }


        if (effects.gain.active) {
          var noEffects = false;
          var gainNode = offlineAudioCtx.createGain();
          bufferSource.connect(gainNode);
          gainNode.gain.value = effects.gain.value;
          gainNode.connect(offlineAudioCtx.destination);
        }


        if (effects.pingPong.active) {
          var noEffects = false;

          var pingPongDelayNode = new tuna.PingPongDelay({
              wetLevel: effects.pingPong.wetLevel,
              feedback: effects.pingPong.feedback,
              delayTimeLeft: effects.pingPong.delayTimeLeft,
              delayTimeRight: effects.pingPong.delayTimeRight
          });
          bufferSource.connect(pingPongDelayNode);
          pingPongDelayNode.connect(offlineAudioCtx.destination);
        }

        if (effects.phaser.active) {
          var noEffects = false;

          tuna = new Tuna(offlineAudioCtx);
          var phaser = new tuna.Phaser({
            rate: effects.phaser.rate,
            depth: effects.phaser.depth,
            feedback: effects.phaser.feedback,
            stereoPhase: effects.phaser.stereoPhase,
            baseModulationFrequency: effects.phaser.baseModulationFrequency
          });
          bufferSource.connect(phaser);
          phaser.connect(offlineAudioCtx.destination);
        }

        if (effects.convolver.active) {
          var noEffects = false;
          var convolver = new tuna.Convolver({
            highCut: this.effects.convolver.highCut,
            lowCut: this.effects.convolver.lowCut,
            dryLevel: this.effects.convolver.dryLevel,
            wetLevel: this.effects.convolver.wetLevel,
            level: this.effects.convolver.level,
            impulse: this.effects.convolver.impulse
          });
          bufferSource.connect(convolver);
          convolver.connect(offlineAudioCtx.destination);
        }

        if(effects.wahwah.active) {
          var noEffects = false;
          var wahwah = new tuna.WahWah({
              automode: effects.wahwah.automode,
              baseFrequency: effects.wahwah.baseFrequency,
              excursionOctaves: effects.wahwah.excursionOctaves,
              sweep: effects.wahwah.sweep,
              resonance: effects.wahwah.resonance,
              sensitivity: effects.wahwah.sensitivity
          });
          bufferSource.connect(wahwah);
          wahwah.connect(offlineAudioCtx.destination);
        }

        if (noEffects) {
          bufferSource.connect(offlineAudioCtx.destination);
        }

        // Kick off the render, callback will contain rendered buffer in event
        offlineAudioCtx.startRendering();

        // Render the databent image.
        offlineAudioCtx.oncomplete = function (e) {
          // Instead of starting the bufferSource, move data back into Canvas land.
          _this.draw(e.renderedBuffer);
        };
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
        var transformedImage = new ImageData(clampedDataArray, this.canvas.width, this.canvas.height)
        this.ctx.putImageData(transformedImage, 0, 0);
        document.body.prepend(this.canvas);
      };

      this.render(this.imageData);

      return this;
    };
