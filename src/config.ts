import { config } from './lib/effects/config'

export interface Effect {
  id?: string
  label: string
  enabled: boolean
  params: {
    label: string
    key: string
    value: string | number | boolean
    type: 'select' | 'slider' | 'switch'
    values?: {
      label: string
      value: string
    }[]
    range?: [number, number]
    step?: number
  }[]
}

export interface Effects {
  [key: string]: Effect
}

export const effects: Effects = {
  biquad: {
    label: 'Biquad',
    enabled: false,
    params: [
      {
        label: 'Type',
        key: 'type',
        value: config.biquad.type,
        type: 'select',
        values: [
          { label: 'Lowpass', value: 'lowpass' },
          { label: 'Highpass', value: 'highpass' },
          { label: 'Bandpass', value: 'bandpass' },
          { label: 'Lowshelf', value: 'lowshelf' },
          { label: 'Highshelf', value: 'highshelf' },
          { label: 'Peaking', value: 'peaking' },
          { label: 'Notch', value: 'notch' },
          { label: 'Allpass', value: 'allpass' },
        ],
      },
      {
        label: 'Frequency',
        key: 'frequency',
        value: config.biquad.frequency,
        type: 'slider',
        range: [20, 30000],
        step: 10,
      },
      {
        label: 'Detune',
        key: 'detune',
        value: config.biquad.detune,
        type: 'slider',
        range: [-24, 24],
        step: 0.1,
      },
      {
        label: 'Gain',
        key: 'gain',
        value: config.biquad.gain,
        type: 'slider',
        range: [0, 10],
        step: 0.01,
      },
      {
        label: 'Resonance',
        key: 'q',
        value: config.biquad.q,
        type: 'slider',
        range: [0, 10],
        step: 0.01,
      },
    ],
  },
  bitcrusher: {
    label: 'Bitcrusher',
    enabled: false,
    params: [
      {
        label: 'Bits',
        key: 'bits',
        value: config.bitcrusher.bits,
        type: 'slider',
        range: [0, 10],
        step: 0.01,
      },
      {
        label: 'Normal Frequency',
        key: 'normfreq',
        value: config.bitcrusher.normfreq,
        type: 'slider',
        range: [0, 10],
        step: 0.01,
      },
      {
        label: 'Buffer Size',
        key: 'bufferSize',
        value: config.bitcrusher.bufferSize,
        type: 'slider',
        range: [1024, 8192],
        step: 1024,
      },
    ],
  },
  convolver: {
    label: 'Convolver',
    enabled: false,
    params: [
      {
        label: 'HighCut',
        key: 'highCut',
        value: config.convolver.highCut,
        type: 'slider',
        range: [20, 30000],
        step: 10,
      },
      {
        label: 'LowCut',
        key: 'lowCut',
        value: config.convolver.lowCut,
        type: 'slider',
        range: [20, 30000],
        step: 10,
      },
      {
        label: 'DryLevel',
        key: 'dryLevel',
        value: config.convolver.dryLevel,
        type: 'slider',
        range: [20, 30000],
        step: 10,
      },
      {
        label: 'WetLevel',
        key: 'wetLevel',
        value: config.convolver.wetLevel,
        type: 'slider',
        range: [0, 1],
        step: 0.01,
      },
      {
        label: 'Level',
        key: 'level',
        value: config.convolver.level,
        type: 'slider',
        range: [0, 1],
        step: 0.01,
      },
      // {
      //   label: 'Impulse',
      //   key: 'impulse',
      //   value: config.convolver.impulse,
      //   type: 'slider',
      //   range: [0, 1],
      //   step: 0.01,
      // },
      // impulse: 'CathedralRoom.wav',
    ],
  },
  gain: {
    label: 'Gain',
    enabled: false,
    params: [
      {
        label: 'Value',
        key: 'gain',
        value: config.gain.value,
        type: 'slider',
        range: [0, 10],
        step: 0.01,
      },
    ],
  },
  detune: {
    label: 'Detune',
    enabled: false,
    params: [
      {
        label: 'Value',
        key: 'detune',
        value: config.detune.value,
        type: 'slider',
        range: [-24, 24],
        step: 0.1,
      },
    ],
  },
  playbackRate: {
    label: 'Playback Rate',
    enabled: false,
    params: [
      {
        label: 'Value',
        key: 'detune',
        value: config.playbackRate.value,
        type: 'slider',
        range: [-24, 24],
        step: 0.1,
      },
    ],
  },
  pingPong: {
    label: 'Ping Pong',
    enabled: false,
    params: [
      {
        label: 'Feedback',
        key: 'feedback',
        value: config.pingPong.feedback,
        type: 'slider',
        range: [0, 1],
        step: 0.01,
      },
      {
        label: 'Wet Level',
        key: 'wetLevel',
        value: config.pingPong.wetLevel,
        type: 'slider',
        range: [0, 1],
        step: 0.01,
      },
      {
        label: 'Delay Time Left',
        key: 'delayTimeLeft',
        value: config.pingPong.delayTimeLeft,
        type: 'slider',
        range: [0, 100],
        step: 1,
      },
      {
        label: 'Delay Time Right',
        key: 'delayTimeRight',
        value: config.pingPong.delayTimeRight,
        type: 'slider',
        range: [0, 100],
        step: 1,
      },
    ],
  },
  phaser: {
    label: 'Phaser',
    enabled: false,
    params: [
      {
        label: 'Rate',
        key: 'rate',
        value: config.phaser.rate,
        type: 'slider',
        range: [0, 10],
        step: 0.1,
      },
      {
        label: 'Depth',
        key: 'depth',
        value: config.phaser.depth,
        type: 'slider',
        range: [0, 1],
        step: 0.01,
      },
      {
        label: 'Feedback',
        key: 'feedback',
        value: config.phaser.feedback,
        type: 'slider',
        range: [0, 1],
        step: 0.01,
      },
      {
        label: 'Stereo Phase',
        key: 'stereoPhase',
        value: config.phaser.stereoPhase,
        type: 'slider',
        range: [0, 100],
        step: 1,
      },
      {
        label: 'Base Modulation Frequency',
        key: 'baseModulationFrequency',
        value: config.phaser.baseModulationFrequency,
        type: 'slider',
        range: [10, 30000],
        step: 10,
      },
    ],
  },
  wahwah: {
    label: 'Wahwah',
    enabled: false,
    params: [
      {
        label: 'Auto Mode',
        key: 'automode',
        value: config.wahwah.automode,
        type: 'switch',
      },
      {
        label: 'Base Frequency',
        key: 'baseFrequency',
        value: config.wahwah.baseFrequency,
        type: 'slider',
        range: [10, 30000],
        step: 10,
      },
      {
        label: 'Excursion Octaves',
        key: 'excursionOctaves',
        value: config.wahwah.excursionOctaves,
        type: 'slider',
        range: [0, 10],
        step: 1,
      },
      {
        label: 'Sweep',
        key: 'sweep',
        value: config.wahwah.sweep,
        type: 'slider',
        range: [0, 1],
        step: 0.01,
      },
      {
        label: 'Resonance',
        key: 'resonance',
        value: config.wahwah.resonance,
        type: 'slider',
        range: [0, 10],
        step: 0.01,
      },
      {
        label: 'Sensitivity',
        key: 'sensitivity',
        value: config.wahwah.sensitivity,
        type: 'slider',
        range: [0, 10],
        step: 0.01,
      },
    ],
  },
}
