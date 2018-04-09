/**
 * config:
 *  intensity
 *  rate
 *  stereoPhase
 */

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'

import * as Tuna from 'tunajs'

export const tremelo = (
  offlineAudioCtx: OfflineAudioContext,
  bufferSource: AudioBufferSourceNode,
  config: { [key: string]: any }
) => {
  const tuna = new Tuna(offlineAudioCtx)

  const tremelo: AudioBufferSourceNode = new tuna.Tremelo(config)
  bufferSource.connect(tremelo)

  return Observable.of(tremelo)
}
