/**
 * config:
 *  gain
 */

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'

import Tuna from 'tunajs'

export const gain = (offlineAudioCtx, bufferSource, config) => {
  const tuna = new Tuna(offlineAudioCtx)

  const gain = offlineAudioCtx.createGain()
  gain.gain.value = config.gain
  bufferSource.connect(gain)

  return Observable.of(gain)
}
