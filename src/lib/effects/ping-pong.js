/**
 * config:
 *  wetLevel
 *  feedback
 *  delayTimeLeft
 *  delayTimeRight
 */

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'

import Tuna from 'tunajs'

export const pingPong = (offlineAudioCtx, bufferSource, config) => {
  const tuna = new Tuna(offlineAudioCtx)

  const pingPong = new tuna.PingPongDelay(config)
  bufferSource.connect(pingPong)

  return Observable.of(pingPong)
}
