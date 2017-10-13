/**
 * config:
 *  bits
 *  normfreq
 *  bufferSize
 */

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'

import Tuna from 'tunajs'

export const bitcrusher = (offlineAudioCtx, bufferSource, config) => {
  const tuna = new Tuna(offlineAudioCtx)
  
  const bitcrusher = new tuna.Bitcrusher(config)
  bufferSource.connect(bitcrusher)

  return Observable.of(bitcrusher)
}
