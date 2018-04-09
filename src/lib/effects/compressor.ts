/**
 * config:
 *  threshold
 *  makeupGain
 *  attack
 *  release
 *  ratio
 *  knee
 *  automakeup
 */

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'

import * as Tuna from 'tunajs'

export const compressor = (
  offlineAudioCtx: OfflineAudioContext,
  bufferSource: AudioBufferSourceNode,
  config: { [key: string]: any }
) => {
  const tuna = new Tuna(offlineAudioCtx)

  const compressor: AudioBufferSourceNode = new tuna.Compressor(config)
  bufferSource.connect(compressor)

  return Observable.of(compressor)
}
