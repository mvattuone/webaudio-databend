/**
 * config:
 *  type
 *  frequency
 *  Q
 *  detune
 */

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'

export const biquad = (
  offlineAudioCtx: OfflineAudioContext,
  bufferSource: AudioBufferSourceNode,
  config: { [key: string]: any }
) => {
  const biquad = offlineAudioCtx.createBiquadFilter()

  biquad.type = config.type
  biquad.frequency.value = config.frequency
  biquad.Q.value = config.Q
  biquad.detune.value = config.detune

  bufferSource.connect(biquad)

  return Observable.of(biquad)
}
