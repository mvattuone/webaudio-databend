    var Tuna = require('tunajs'); 
    window.random = require('random-js')();
    var config = require('./config.json');

    // Create a Databender instance
    module.exports = function (audioCtx, channels) {
      this.config = config;

      // Create an AudioContext or use existing one
      this.audioCtx = audioCtx ? audioCtx : new AudioContext();
      
      this.channels = channels ? channels : 1;

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

        // set the AudioBuffer buffer to the same as the imageData audioBuffer
        // v. convenient becuase you do not need to convert the data yourself
        nowBuffering.set(this.imageData.data);

        return this.render(audioBuffer);
      }

      this.render = function (buffer) {
        var _this = this;
        return new Promise(function (resolve, reject) {
          var config = this.databender.config;

          // Create offlineAudioCtx that will house our rendered buffer
          var offlineAudioCtx = new OfflineAudioContext(_this.channels, buffer.length * _this.channels, this.audioCtx.sampleRate);

          // Create an AudioBufferSourceNode, which represents an audio source consisting of in-memory audio data
          var bufferSource = offlineAudioCtx.createBufferSource();

          // Set buffer to audio buffer containing image data
          bufferSource.buffer = buffer; 

          // Seems to rotate the image, clockwise if postitive ccw if negative
          if (config.detune.active) {
            var noEffects = false;
            if (config.detune.randomize) {
              var waveArray = new Float32Array(config.detune.randomValues);
              for (i=0;i<config.detune.randomValues;i++) {
                waveArray[i] = window.random.real(0.0001, 400); 
              }
            }
            if (config.detune.randomize) {
              bufferSource.detune.setValueCurveAtTime(waveArray, 0, bufferSource.buffer.duration);
            } else if (config.detune.enablePartial) {
              bufferSource.detune.setTargetAtTime(config.detune.value, config.detune.areaOfEffect, config.detune.areaOfEffect);
            } else {
              bufferSource.detune.value = config.detune.value;
            };
          }

          // Seems to "play back" the image at a rate equal to the number
          // (i.e. 4 yields 4 smaller rendered images)
          if (config.playbackRate.active) {
            var noEffects = false;
            if (config.playbackRate.randomize) {
              var waveArray = new Float32Array(config.playbackRate.randomValues);
              for (i=0;i<config.playbackRate.randomValues;i++) {
                waveArray[i] = window.random.integer(0.0001, 8); 
              }
            }
            if (config.playbackRate.randomize) {
              bufferSource.playbackRate.setValueCurveAtTime(waveArray, 0, bufferSource.buffer.duration);
            } else if (config.playbackRate.enablePartial) {
              
              bufferSource.playbackRate.setTargetAtTime(config.playbackRate.value, config.playbackRate.areaOfEffect, config.playbackRate.areaOfEffect);
            } else {
              bufferSource.playbackRate.value = config.playbackRate.value;
            };
          }

          //  @NOTE: Calling this is when the AudioBufferSourceNode becomes unusable
          bufferSource.start();

          var noEffects = true;
          var tuna = new Tuna(offlineAudioCtx);

          if (config.bitcrusher.active) {
            var noEffects = false;

            var crusher = new tuna.Bitcrusher({
                bits: config.bitcrusher.bits,
                normfreq: config.bitcrusher.normfreq,
                bufferSize: config.bitcrusher.bufferSize
            });
            bufferSource.connect(crusher);
            crusher.connect(offlineAudioCtx.destination);
          }

          if (config.chorus.active) {
            var noEffects = false;

            var chorus = new tuna.Chorus({
                feedback: config.chorus.feedback,
                delay: config.chorus.delay,
                depth: config.chorus.depth,
                rate: config.chorus.rate,
            });
            bufferSource.connect(chorus);
            chorus.connect(offlineAudioCtx.destination);
          }

          if (config.biquad.active) {
            var noEffects = false;
            if (config.biquad.randomize) {
              var waveArray = new Float32Array(config.biquad.randomValues);
              for (i=0;i<config.biquad.randomValues;i++) {
                waveArray[i] = window.random.real(0.0001, config.biquad.biquadFrequency); 
              }
            }
            var biquadFilter = offlineAudioCtx.createBiquadFilter();
            biquadFilter.type = config.biquad.type;
            if (config.biquad.randomize) {
              biquadFilter.frequency.setValueCurveAtTime(waveArray, 0, bufferSource.buffer.duration);
              biquadFilter.detune.setValueCurveAtTime(waveArray, 0, bufferSource.buffer.duration);
            } else if (config.biquad.enablePartial) {
              biquadFilter.frequency.setTargetAtTime(config.biquad.biquadFrequency, config.biquad.areaOfEffect, config.biquad.areaOfEffect);
            } else {
              biquadFilter.frequency.value = config.biquad.biquadFrequency;
            };
            biquadFilter.Q.value = config.biquad.quality;
            biquadFilter.detune.value = config.biquad.detune;
            bufferSource.connect(biquadFilter);
            biquadFilter.connect(offlineAudioCtx.destination);
          }

          if (config.gain.active) {
            var noEffects = false;
            var gainNode = offlineAudioCtx.createGain();
            bufferSource.connect(gainNode);
            gainNode.gain.value = config.gain.value;
            gainNode.connect(offlineAudioCtx.destination);
          }

          if (config.pingPong.active) {
            var noEffects = false;

            var pingPongDelayNode = new tuna.PingPongDelay({
                wetLevel: config.pingPong.wetLevel,
                feedback: config.pingPong.feedback,
                delayTimeLeft: config.pingPong.delayTimeLeft,
                delayTimeRight: config.pingPong.delayTimeRight
            });
            bufferSource.connect(pingPongDelayNode);
            pingPongDelayNode.connect(offlineAudioCtx.destination);
          }

          if (config.phaser.active) {
            var noEffects = false;

            tuna = new Tuna(offlineAudioCtx);
            var phaser = new tuna.Phaser({
              rate: config.phaser.rate,
              depth: config.phaser.depth,
              feedback: config.phaser.feedback,
              stereoPhase: config.phaser.stereoPhase,
              baseModulationFrequency: config.phaser.baseModulationFrequency
            });
            bufferSource.connect(phaser);
            phaser.connect(offlineAudioCtx.destination);
          }

          if (config.convolver.active) {
            var noEffects = false;
            var convolver = new tuna.Convolver({
              highCut: config.convolver.highCut,
              lowCut: config.convolver.lowCut,
              dryLevel: config.convolver.dryLevel,
              wetLevel: config.convolver.wetLevel,
              level: config.convolver.level,
              impulse: config.convolver.impulse
            });
            bufferSource.connect(convolver);
            convolver.connect(offlineAudioCtx.destination);
          }

          if(config.wahwah.active) {
            var noEffects = false;
            var wahwah = new tuna.WahWah({
                automode: config.wahwah.automode,
                baseFrequency: config.wahwah.baseFrequency,
                excursionOctaves: config.wahwah.excursionOctaves,
                sweep: config.wahwah.sweep,
                resonance: config.wahwah.resonance,
                sensitivity: config.wahwah.sensitivity
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
            resolve(e.renderedBuffer);
          };
        });
      };

      this.draw = function (buffer, canvas) {

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

        canvas.getContext('2d').putImageData(transformedImage, 0, 0);
      };


      return this;
    };
