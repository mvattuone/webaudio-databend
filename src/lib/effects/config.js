export const config = {
  biquad: {
    type: [
      "lowpass",
      "highpass",
      "bandpass",
      "lowshelf",
      "highshel",
      "peaking",
      "notch",
      "allpass",
    ],
    biquadFrequency: 4000,
    biquadGain: 1
  },
  bitcrusher: {
    bits: 16,
    normfreq: 0.44,
    bufferSize: 4096
  },
  convolver: {
    highCut: 22050,
    lowCut: 20,
    dryLevel: 1,
    wetLevel: 1,
    level: 1,
    impulse: "CathedralRoom.wav"
  },
  gain: {
    value: 1
  },
  detune: {
    value: 0
  },
  playbackRate: {
    value: 1
  },
  pingPong: {
    feedback: 0.3,
    wetLevel: 0.5,
    delayTimeLeft: 10,
    delayTimeRight: 10
  },
  phaser: {
    rate: 1.2,
    depth: 0.6,
    feedback: 0.5,
    stereoPhase: 10,
    baseModulationFrequency: 1500
  },
  wahwah: {
    automode: true,
    baseFrequency: 0.5,
    excursionOctaves: 2,
    sweep: 0.2,
    resonance: 10,
    sensitivity: 0.5
  }
}
