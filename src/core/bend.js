import effects from '../config/effects.json';
import core from './';

export default function bend () {
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
    core.draw.call(_this, e.renderedBuffer);
  };
}
