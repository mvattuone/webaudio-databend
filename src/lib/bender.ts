import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/from'
import 'rxjs/add/observable/fromPromise'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/map'

import { config } from './effects'

type AudioBufferNode = AudioBufferSourceNode | BiquadFilterNode | GainNode | OfflineAudioContext

type Effect = {
  fn: (...any) => any
  config: any
}
type EffectFn = (bufferSrc: AudioBufferSourceNode) => Observable<AudioBufferNode>
type EffectsChain = EffectFn[]

const createAudioBuffer = (image: ImageData) => {
  const audioContext = new AudioContext()
  const audioBuffer = audioContext.createBuffer(1, image.data.length, 44100)
  audioContext.close()
  const nowBuffering = audioBuffer.getChannelData(0)
  nowBuffering.set(image.data)

  const offlineAudioContext = new OfflineAudioContext(1, audioBuffer.length, 44100)
  const bufferSource = offlineAudioContext.createBufferSource()
  bufferSource.buffer = audioBuffer

  return { bufferSource, offlineAudioContext }
}

const createBuffers = (canvas: HTMLCanvasElement, image: HTMLImageElement) => {
  const imageBuffer = createImageBuffer(canvas, image)
  const { bufferSource, offlineAudioContext } = createAudioBuffer(imageBuffer)

  return { imageBuffer, bufferSource, offlineAudioContext }
}

const createImageBuffer = (canvas: HTMLCanvasElement, image: HTMLImageElement) => {
  canvas.height = image.height
  canvas.width = image.width

  const context = canvas.getContext('2d')
  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  const imageBuffer = context.getImageData(0, 0, canvas.width, canvas.height)

  return imageBuffer
}

const complete = (offlineAudioContext: OfflineAudioContext): Promise<AudioBuffer> => {
  return new Promise((resolve, reject) => {
    offlineAudioContext.startRendering()
    offlineAudioContext.oncomplete = e => resolve(e.renderedBuffer)
  })
}

const applyEffects = (
  offlineAudioContext: OfflineAudioContext,
  bufferSource: AudioBufferSourceNode,
  userEffects: Effect[]
) => {
  // const userEffects: EffectsChain = [
  //   bufferSrc => pingPong(offlineAudioContext, bufferSrc, config.pingPong),
  //   bufferSrc => gain(offlineAudioContext, bufferSrc, config.gain),
  // ]

  const effectsChain: EffectsChain = userEffects.map(userEffect => {
    return bufferSrc => userEffect.fn(offlineAudioContext, bufferSrc, userEffect.config)
  })

  const buffer$ = Observable.of(bufferSource)
  const bufferEnd$ = (bufferSrc: AudioBufferSourceNode) => {
    bufferSrc.connect(offlineAudioContext.destination)
    return Observable.of(offlineAudioContext)
  }

  const effectsFnChain = [...effectsChain, bufferEnd$].map(fn => ({ meta: {}, fn }))

  const reduceEffects = (acc, effect) => acc.mergeMap(effect.fn)
  const renderBuffer = (offlineAudioCtx: OfflineAudioContext) =>
    Observable.fromPromise(complete(offlineAudioCtx))

  return effectsFnChain
    .reduce((acc, effect) => acc.mergeMap(effect.fn), buffer$)
    .mergeMap(renderBuffer)
}

export const bender = (
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  userEffects: Effect[]
): Observable<{ canvas: HTMLCanvasElement; imageBuffer: ImageData; audioBuffer: AudioBuffer }> => {
  const { imageBuffer, bufferSource, offlineAudioContext } = createBuffers(canvas, image)

  bufferSource.start()

  const effectsBuffer$ = applyEffects(offlineAudioContext, bufferSource, userEffects)

  return effectsBuffer$.map(audioBuffer => ({ canvas, imageBuffer, audioBuffer }))
}
