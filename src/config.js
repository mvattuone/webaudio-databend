const options = {
  playAudio: false,
  frameRate: 30
}

const tools = {
  Brush: {
    active: false,
    size: 48
  },
  Eraser: {
    active: false,
    size: 48
  },
  Fill: {
    active: false
  }
};

const effects = {
  bitcrusher: {
    active: false,
    bits: 4,
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
    impulse: "CathedralRoom.wav" 
  },
  chorus: {
    active: false,
    feedback: 0.4,
    delay: 0.0045,
    depth: 0.7,
    rate: 1.5,
    bypass: 0
  },
  biquad: {
    active: false,
    areaOfEffect: 1,
    detune: 0,
    enablePartial: false,
    randomize: false,
    quality: 1,
    randomValues: 2,
    type: "highpass",
    biquadFrequency: 4000
  },
  gain: {
    active: false,
    value: 1
  },
  detune: {
    active: false,
    areaOfEffect: 1,
    enablePartial: false,
    randomize: false,
    randomValues: 2,
    value: 0
  },
  playbackRate: {
    active: false,
    areaOfEffect: 1,
    enablePartial: false,
    randomize: false,
    randomValues: 2,
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
    sensitivity: 0.5
  }
}

module.exports = {
  options,
  tools,
  effects
}
