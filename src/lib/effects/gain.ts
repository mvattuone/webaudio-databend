/**
 * config:
 *  gain
 */

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'

export const gain = (
  offlineAudioCtx: OfflineAudioContext,
  bufferSource: AudioBufferSourceNode,
  config: { [key: string]: any }
) => {
  const gain = offlineAudioCtx.createGain()
  gain.gain.value = config.gain
  bufferSource.connect(gain)

  return Observable.of(gain)
}
