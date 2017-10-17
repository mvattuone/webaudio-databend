/**
 * config:
 *  highCut
 *  lowCut
 *  dryLevel
 *  wetLevel
 *  level
 *  impulse
 */

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'

import Tuna from 'tunajs'

export const convolver = (offlineAudioCtx: OfflineAudioContext, bufferSource: AudioBufferSourceNode, config: { [key: string]: any }) => {
  const tuna = new Tuna(offlineAudioCtx)

  const convolver: AudioBufferSourceNode = new tuna.Convolver(config)
  bufferSource.connect(convolver)

  return Observable.of(convolver)
}
