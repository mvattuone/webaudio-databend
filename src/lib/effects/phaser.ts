/**
 * config:
 *  rate
 *  depth
 *  feedback
 *  stereoPhase
 *  baseModulationFrequency
 */

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'

import Tuna from 'tunajs'

export const phaser = (offlineAudioCtx: OfflineAudioContext, bufferSource: AudioBufferSourceNode, config: { [key: string]: any }) => {
  const tuna = new Tuna(offlineAudioCtx)

  const phaser: AudioBufferSourceNode = new tuna.Phaser(config)
  bufferSource.connect(phaser)

  return Observable.of(phaser)
}
