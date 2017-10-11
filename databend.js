    var Tuna = require('tunajs'); 
    window.random = require('random-js')();
    var effects = require('./effects.json');

    // Create a Databender instance
    module.exports = function (audioCtx, channels) {
      this.effects = effects;

      // Create an AudioContext or use existing one
      this.audioCtx = audioCtx ? audioCtx : new AudioContext();
      
      this.channels = channels ? channels : 1;

      this.bend = function (imageData) {
        this.imageData = imageData;
        var bufferSize = imageData.data.length / this.channels;

        // Make an audioBuffer on the audioContext to pass to the offlineAudioCtx AudioBufferSourceNode
        var audioBuffer = this.audioCtx.createBuffer(this.channels, bufferSize, databender.effects.sampleRate); 

        // This gives us the actual ArrayBuffer that contains the data
        var nowBuffering = audioBuffer.getChannelData(0);

        // set the AudioBuffer buffer to the same as the imageData audioBuffer
        // v. convenient becuase you do not need to convert the data yourself
        nowBuffering.set(imageData.data);

        return this.render(audioBuffer);
      }

      this.render = function (buffer) {
        return new Promise(function (resolve, reject) {
          var _this = this;
          var effects = this.databender.effects;

          // Create offlineAudioCtx that will house our rendered buffer
          var offlineAudioCtx = new OfflineAudioContext(this.databender.channels, buffer.length, this.audioCtx.sampleRate);

          // Create an AudioBufferSourceNode, which represents an audio source consisting of in-memory audio data
          var bufferSource = offlineAudioCtx.createBufferSource();

          // Set buffer to audio buffer containing image data
          bufferSource.buffer = buffer; 

          // Seems to rotate the image, clockwise if postitive ccw if negative
          if (effects.detune.active) {
            var noEffects = false;
            if (effects.detune.randomize) {
              var waveArray = new Float32Array(effects.detune.randomValues);
              for (i=0;i<effects.detune.randomValues;i++) {
                waveArray[i] = window.random.real(0.0001, 400); 
              }
            }
            if (effects.detune.randomize) {
              bufferSource.detune.setValueCurveAtTime(waveArray, 0, bufferSource.buffer.duration);
            } else if (effects.detune.enablePartial) {
              bufferSource.detune.setTargetAtTime(effects.detune.value, effects.detune.areaOfEffect, effects.detune.areaOfEffect);
            } else {
              bufferSource.detune.value = effects.detune.value;
            };
          }

          // Seems to "play back" the image at a rate equal to the number
          // (i.e. 4 yields 4 smaller rendered images)
          if (effects.playbackRate.active) {
            var noEffects = false;
            if (effects.playbackRate.randomize) {
              var waveArray = new Float32Array(effects.playbackRate.randomValues);
              for (i=0;i<effects.playbackRate.randomValues;i++) {
                waveArray[i] = window.random.integer(0.0001, 8); 
              }
            }
            if (effects.playbackRate.randomize) {
              bufferSource.playbackRate.setValueCurveAtTime(waveArray, 0, bufferSource.buffer.duration);
            } else if (effects.playbackRate.enablePartial) {
              
              bufferSource.playbackRate.setTargetAtTime(effects.playbackRate.value, effects.playbackRate.areaOfEffect, effects.playbackRate.areaOfEffect);
            } else {
              bufferSource.playbackRate.value = effects.playbackRate.value;
            };
          }

          //  @NOTE: Calling this is when the AudioBufferSourceNode becomes unusable
          bufferSource.start();

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

          if (effects.chorus.active) {
            var noEffects = false;

            var chorus = new tuna.Chorus({
                feedback: effects.chorus.feedback,
                delay: effects.chorus.delay,
                depth: effects.chorus.depth,
                rate: effects.chorus.rate,
            });
            bufferSource.connect(chorus);
            chorus.connect(offlineAudioCtx.destination);
          }

          if (effects.biquad.active) {
            var noEffects = false;
            if (effects.biquad.randomize) {
              var waveArray = new Float32Array(effects.biquad.randomValues);
              for (i=0;i<effects.biquad.randomValues;i++) {
                waveArray[i] = window.random.real(0.0001, effects.biquad.biquadFrequency); 
              }
            }
            var biquadFilter = offlineAudioCtx.createBiquadFilter();
            biquadFilter.type = effects.biquad.type;
            if (effects.biquad.randomize) {
              biquadFilter.frequency.setValueCurveAtTime(waveArray, 0, bufferSource.buffer.duration);
              biquadFilter.detune.setValueCurveAtTime(waveArray, 0, bufferSource.buffer.duration);
            } else if (effects.biquad.enablePartial) {
              biquadFilter.frequency.setTargetAtTime(effects.biquad.biquadFrequency, effects.biquad.areaOfEffect, effects.biquad.areaOfEffect);
            } else {
              biquadFilter.frequency.value = effects.biquad.biquadFrequency;
            };
            biquadFilter.Q.value = effects.biquad.quality;
            biquadFilter.detune.value = effects.biquad.detune;
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
              highCut: effects.convolver.highCut,
              lowCut: effects.convolver.lowCut,
              dryLevel: effects.convolver.dryLevel,
              wetLevel: effects.convolver.wetLevel,
              level: effects.convolver.level,
              impulse: effects.convolver.impulse
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
            resolve(e.renderedBuffer);
          };
        });
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

        if (!document.querySelector('canvas')) {
          var canvas = document.createElement('canvas');
          canvas.width = this.imageData.width;
          canvas.height = this.imageData.height;
          document.body.prepend(canvas);
        }

        document.querySelector('canvas').getContext('2d').putImageData(transformedImage, 0, 0);
      };


      return this;
    };
