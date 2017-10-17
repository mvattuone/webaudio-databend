/**
 * config:
 *  bits
 *  normfreq
 *  bufferSize
 */

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'

import Tuna from 'tunajs'

export const bitcrusher = (offlineAudioCtx: OfflineAudioContext, bufferSource: AudioBufferSourceNode, config: { [key: string]: any }) => {
  const tuna = new Tuna(offlineAudioCtx)
  
  const bitcrusher: AudioBufferSourceNode = new tuna.Bitcrusher(config)
  bufferSource.connect(bitcrusher)

  return Observable.of(bitcrusher)
}
