/**
 * config:
 *  feedback
 *  delay
 *  depth
 *  rate
 */

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'

import Tuna from 'tunajs'

export const chorus = (offlineAudioCtx, bufferSource, config) => {
  const tuna = new Tuna(offlineAudioCtx)

  const chorus = new tuna.Chorus(config)
  bufferSource.connect(chorus)

  return Observable.of(chorus)
}
