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

export const phaser = (offlineAudioCtx, bufferSource, config) => {
  const tuna = new Tuna(offlineAudioCtx)

  const phaser = new tuna.Phaser(config)
  bufferSource.connect(phaser)

  return Observable.of(phaser)
}
