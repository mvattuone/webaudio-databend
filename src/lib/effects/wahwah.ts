/**
 * config:
 *  automode
 *  baseFrequency
 *  excursionOctaves
 *  sweep
 *  resonance
 *  sensitivity
 */

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'

import * as Tuna  from 'tunajs'

export const wahwah = (offlineAudioCtx: OfflineAudioContext, bufferSource: AudioBufferSourceNode, config: { [key: string]: any }) => {
  const tuna = new Tuna(offlineAudioCtx)

  const wahwah: AudioBufferSourceNode = new tuna.PingPongDelay(config)
  bufferSource.connect(wahwah)

  return Observable.of(wahwah)
}
