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

export const pingPong = (
  offlineAudioCtx: OfflineAudioContext,
  bufferSource: AudioBufferSourceNode,
  config: { [key: string]: any }
) => {
  const tuna = new Tuna(offlineAudioCtx)

  const pingPong: AudioBufferSourceNode = new tuna.PingPongDelay(config)
  bufferSource.connect(pingPong)

  return Observable.of(pingPong)
}
