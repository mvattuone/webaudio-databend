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

export const convolver = (offlineAudioCtx, bufferSource, config) => {
  const tuna = new Tuna(offlineAudioCtx)

  const convolver = new tuna.Chorus(config)
  bufferSource.connect(convolver)

  return Observable.of(convolver)
}
