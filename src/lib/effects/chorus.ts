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

export const chorus = (
  offlineAudioCtx: OfflineAudioContext,
  bufferSource: AudioBufferSourceNode,
  config: { [key: string]: any }
) => {
  const tuna = new Tuna(offlineAudioCtx)

  const chorus: AudioBufferSourceNode = new tuna.Chorus(config)
  bufferSource.connect(chorus)

  return Observable.of(chorus)
}
