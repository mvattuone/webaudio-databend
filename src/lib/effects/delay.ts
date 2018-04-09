/**
 * config:
 *  feedback
 *  delay
 *  depth
 *  rate
 */

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'

import * as Tuna from 'tunajs'

export const delay = (
  offlineAudioCtx: OfflineAudioContext,
  bufferSource: AudioBufferSourceNode,
  config: { [key: string]: any }
) => {
  const tuna = new Tuna(offlineAudioCtx)

  const delay: AudioBufferSourceNode = new tuna.Delay(config)
  bufferSource.connect(delay)

  return Observable.of(delay)
}
