import { biquad } from './biquad'
import { bitcrusher } from './bitcrusher'
import { chorus } from './chorus'
import { compressor } from './compressor'
import { convolver } from './convolver'
import { delay } from './delay'
import { filter } from './filter'
import { gain } from './gain'
import { phaser } from './phaser'
import { pingPong } from './ping-pong'
import { tremelo } from './tremolo'
import { wahwah } from './wahwah'

import { defaults } from './defaults'

export interface Effect {
  id?: string
  effect: any
  label: string
  enabled: boolean
  params: {
    label: string
    key: string
    value: string | number | boolean
    type: 'select' | 'slider' | 'switch'
    values?: {
      label: string
      value: string | number
    }[]
    range?: [number, number]
    step?: number
  }[]
}

export interface Effects {
  [key: string]: Effect
}

export const config: Effects = {
  biquad: {
    label: 'Biquad',
    effect: biquad,
    enabled: false,
    params: [
      {
        label: 'Type',
        key: 'type',
        value: defaults.biquad.type,
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
        value: defaults.biquad.frequency,
        type: 'slider',
        range: [20, 30000],
        step: 10,
      },
      {
        label: 'Detune',
        key: 'detune',
        value: defaults.biquad.detune,
        type: 'slider',
        range: [-24, 24],
        step: 0.1,
      },
      {
        label: 'Gain',
        key: 'gain',
        value: defaults.biquad.gain,
        type: 'slider',
        range: [0, 10],
        step: 0.01,
      },
      {
        label: 'Resonance',
        key: 'q',
        value: defaults.biquad.q,
        type: 'slider',
        range: [0, 10],
        step: 0.01,
      },
    ],
  },
  bitcrusher: {
    label: 'Bitcrusher',
    effect: bitcrusher,
    enabled: false,
    params: [
      {
        label: 'Bits',
        key: 'bits',
        value: defaults.bitcrusher.bits,
        type: 'slider',
        range: [0, 10],
        step: 0.01,
      },
      {
        label: 'Normal Frequency',
        key: 'normfreq',
        value: defaults.bitcrusher.normfreq,
        type: 'slider',
        range: [0, 1],
        step: 0.001,
      },
      {
        label: 'Buffer Size',
        key: 'bufferSize',
        value: defaults.bitcrusher.bufferSize,
        type: 'select',
        values: [
          { label: '256', value: 256 },
          { label: '512', value: 512 },
          { label: '1024', value: 1024 },
          { label: '2048', value: 2048 },
          { label: '4096', value: 4096 },
          { label: '8192', value: 8192 },
          { label: '16384', value: 16384 },
        ],
      },
    ],
  },
  chorus: {
    label: 'Convolver',
    effect: chorus,
    enabled: false,
    params: [
      {
        label: 'Rate',
        key: 'rate',
        value: defaults.chrorus.rate,
        type: 'slider',
        range: [0.01, 8],
        step: 0.01,
      },
      {
        label: 'Feedback',
        key: 'feedback',
        value: defaults.chrorus.feedback,
        type: 'slider',
        range: [0, 5],
        step: 0.1,
      },
      {
        label: 'Delay',
        key: 'delay',
        value: defaults.chrorus.delay,
        type: 'slider',
        range: [0, 1],
        step: 0.0001,
      },
      {
        label: 'Bypass',
        key: 'bypass',
        value: defaults.chrorus.bypass,
        type: 'slider',
        range: [0, 1],
        step: 0.01,
      },
    ],
  },
  compressor: {
    label: 'Compressor',
    effect: compressor,
    enabled: false,
    params: [
      {
        label: 'Threshold',
        key: 'threshold',
        value: defaults.compressor.threshold,
        type: 'slider',
        range: [-100, 0],
        step: 1,
      },
      {
        label: 'Makeup Gain',
        key: 'makeupGain',
        value: defaults.compressor.makeupGain,
        type: 'slider',
        range: [0, 100],
        step: 1,
      },
      {
        label: 'Attack',
        key: 'attack',
        value: defaults.compressor.attack,
        type: 'slider',
        range: [0, 1000],
        step: 1,
      },
      {
        label: 'Release',
        key: 'release',
        value: defaults.compressor.release,
        type: 'slider',
        range: [0, 3000],
        step: 1,
      },
      {
        label: 'Ratio',
        key: 'ratio',
        value: defaults.compressor.ratio,
        type: 'slider',
        range: [1, 20],
        step: 1,
      },
      {
        label: 'Knee',
        key: 'knee',
        value: defaults.compressor.knee,
        type: 'slider',
        range: [0, 40],
        step: 1,
      },
      {
        label: 'Automakeup',
        key: 'automakeup',
        value: defaults.compressor.automakeup,
        type: 'switch',
      },
    ],
  },
  convolver: {
    label: 'Convolver',
    effect: convolver,
    enabled: false,
    params: [
      {
        label: 'HighCut',
        key: 'highCut',
        value: defaults.convolver.highCut,
        type: 'slider',
        range: [20, 30000],
        step: 10,
      },
      {
        label: 'LowCut',
        key: 'lowCut',
        value: defaults.convolver.lowCut,
        type: 'slider',
        range: [20, 30000],
        step: 10,
      },
      {
        label: 'DryLevel',
        key: 'dryLevel',
        value: defaults.convolver.dryLevel,
        type: 'slider',
        range: [20, 30000],
        step: 10,
      },
      {
        label: 'WetLevel',
        key: 'wetLevel',
        value: defaults.convolver.wetLevel,
        type: 'slider',
        range: [0, 1],
        step: 0.01,
      },
      {
        label: 'Level',
        key: 'level',
        value: defaults.convolver.level,
        type: 'slider',
        range: [0, 1],
        step: 0.01,
      },
      // {
      //   label: 'Impulse',
      //   key: 'impulse',
      //   value: defaults.convolver.impulse,
      //   type: 'slider',
      //   range: [0, 1],
      //   step: 0.01,
      // },
      // impulse: 'CathedralRoom.wav',
    ],
  },
  delay: {
    label: 'Delay',
    effect: delay,
    enabled: false,
    params: [
      {
        label: 'Feedback',
        key: 'feedback',
        value: defaults.delay.feedback,
        type: 'slider',
        range: [0, 1],
        step: 0.01,
      },
      {
        label: 'Delay Time',
        key: 'delayTime',
        value: defaults.delay.delayTime,
        type: 'slider',
        range: [0, 10000],
        step: 1,
      },
      {
        label: 'Wet Level',
        key: 'wetLevel',
        value: defaults.delay.wetLevel,
        type: 'slider',
        range: [0, 1],
        step: 0.01,
      },
      {
        label: 'Dry Level',
        key: 'dryLevel',
        value: defaults.delay.dryLevel,
        type: 'slider',
        range: [0, 1],
        step: 0.01,
      },
      {
        label: 'Cutoff',
        key: 'cutoff',
        value: defaults.delay.cutoff,
        type: 'slider',
        range: [20, 22050],
        step: 1,
      },
    ],
  },
  filter: {
    label: 'Filter',
    effect: filter,
    enabled: false,
    params: [
      {
        label: 'Frequency',
        key: 'frequency',
        value: defaults.filter.frequency,
        type: 'slider',
        range: [20, 22050],
        step: 1,
      },
      {
        label: 'Q',
        key: 'Resonance',
        value: defaults.filter.Q,
        type: 'slider',
        range: [0.001, 100],
        step: 0.001,
      },
      {
        label: 'Gain',
        key: 'gain',
        value: defaults.filter.gain,
        type: 'slider',
        range: [-40, 40],
        step: 1,
      },
      {
        label: 'FilterType',
        key: 'filterType',
        value: defaults.filter.filterType,
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
    ],
  },
  gain: {
    label: 'Gain',
    effect: gain,
    enabled: false,
    params: [
      {
        label: 'Value',
        key: 'gain',
        value: defaults.gain.value,
        type: 'slider',
        range: [0, 10],
        step: 0.01,
      },
    ],
  },
  pingPong: {
    label: 'Ping Pong',
    effect: pingPong,
    enabled: false,
    params: [
      {
        label: 'Feedback',
        key: 'feedback',
        value: defaults.pingPong.feedback,
        type: 'slider',
        range: [0, 1],
        step: 0.01,
      },
      {
        label: 'Wet Level',
        key: 'wetLevel',
        value: defaults.pingPong.wetLevel,
        type: 'slider',
        range: [0, 1],
        step: 0.01,
      },
      {
        label: 'Delay Time Left',
        key: 'delayTimeLeft',
        value: defaults.pingPong.delayTimeLeft,
        type: 'slider',
        range: [0, 10000],
        step: 1,
      },
      {
        label: 'Delay Time Right',
        key: 'delayTimeRight',
        value: defaults.pingPong.delayTimeRight,
        type: 'slider',
        range: [0, 10000],
        step: 1,
      },
    ],
  },
  phaser: {
    label: 'Phaser',
    effect: phaser,
    enabled: false,
    params: [
      {
        label: 'Rate',
        key: 'rate',
        value: defaults.phaser.rate,
        type: 'slider',
        range: [0, 10],
        step: 0.01,
      },
      {
        label: 'Depth',
        key: 'depth',
        value: defaults.phaser.depth,
        type: 'slider',
        range: [0, 1],
        step: 0.01,
      },
      {
        label: 'Feedback',
        key: 'feedback',
        value: defaults.phaser.feedback,
        type: 'slider',
        range: [0, 5],
        step: 0.01,
      },
      {
        label: 'Stereo Phase',
        key: 'stereoPhase',
        value: defaults.phaser.stereoPhase,
        type: 'slider',
        range: [0, 180],
        step: 1,
      },
      {
        label: 'Base Modulation Frequency',
        key: 'baseModulationFrequency',
        value: defaults.phaser.baseModulationFrequency,
        type: 'slider',
        range: [500, 1500],
        step: 10,
      },
    ],
  },
  tremelo: {
    label: 'Tremelo',
    effect: tremelo,
    enabled: false,
    params: [
      {
        label: 'Intensity',
        key: 'intensity',
        value: defaults.termelo.intensity,
        type: 'slider',
        range: [0, 1],
        step: 0.01,
      },
      {
        label: 'Rate',
        key: 'rate',
        value: defaults.termelo.rate,
        type: 'slider',
        range: [0.001, 8],
        step: 0.001,
      },
      {
        label: 'StereoPhase',
        key: 'stereoPhase',
        value: defaults.termelo.stereoPhase,
        type: 'slider',
        range: [0, 180],
        step: 1,
      },
    ],
  },
  wahwah: {
    label: 'Wahwah',
    effect: wahwah,
    enabled: false,
    params: [
      {
        label: 'Auto Mode',
        key: 'automode',
        value: defaults.wahwah.automode,
        type: 'switch',
      },
      {
        label: 'Base Frequency',
        key: 'baseFrequency',
        value: defaults.wahwah.baseFrequency,
        type: 'slider',
        range: [0, 1],
        step: 0.001,
      },
      {
        label: 'Excursion Octaves',
        key: 'excursionOctaves',
        value: defaults.wahwah.excursionOctaves,
        type: 'slider',
        range: [1, 6],
        step: 0.1,
      },
      {
        label: 'Sweep',
        key: 'sweep',
        value: defaults.wahwah.sweep,
        type: 'slider',
        range: [0, 1],
        step: 0.01,
      },
      {
        label: 'Resonance',
        key: 'resonance',
        value: defaults.wahwah.resonance,
        type: 'slider',
        range: [0, 10],
        step: 0.01,
      },
      {
        label: 'Sensitivity',
        key: 'sensitivity',
        value: defaults.wahwah.sensitivity,
        type: 'slider',
        range: [-1, 1],
        step: 0.01,
      },
    ],
  },
}
