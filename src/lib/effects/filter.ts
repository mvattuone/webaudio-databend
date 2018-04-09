/**
 * config:
 *  frequency
 *  Q
 *  gain
 *  filterType
 */

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'

import * as Tuna from 'tunajs'

export const filter = (
  offlineAudioCtx: OfflineAudioContext,
  bufferSource: AudioBufferSourceNode,
  config: { [key: string]: any }
) => {
  const tuna = new Tuna(offlineAudioCtx)

  const filter: AudioBufferSourceNode = new tuna.Filter(config)
  bufferSource.connect(filter)

  return Observable.of(filter)
}
