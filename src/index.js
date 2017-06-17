import core from './core';
import effects from './config/effects.json';

class Databender {
  constructor(image) {
    // Create an AudioContext
    // @TODO How to handle existing audio context??
    this.audioCtx = new AudioContext();

    // Draw image to canvas and get image data
    this.imageData = core.convert.call(this, image);

    this.effects = effects;

    // Make an audioBuffer on the audioContext to pass to the offlineAudioCtx AudioBufferSourceNode
    // @TODO Channel per color component (i.e. 3 channels)?
    this.channels = 1;
    this.bufferSize = this.imageData.length / this.channels;
    this.audioBuffer = this.audioCtx.createBuffer(this.channels, this.bufferSize, this.audioCtx.sampleRate);

    // This gives us the actual ArrayBuffer that contains the data
    this.nowBuffering = this.audioBuffer.getChannelData(0);


    // set the AudioBuffer buffer to the same as the imageData audioBuffer
    // v. convenient becuase you do not need to convert the data yourself
    this.nowBuffering.set(this.imageData);

    core.bend.call(this, this.imageData);

    return this;
  }

  convert() {
    return core.convert.call(this);
  }

  bend () {
    return core.bend.call(this);
  }

  draw (buffer) {
    return core.draw.call(this);
  }
}

export default Databender
