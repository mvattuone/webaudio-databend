import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/from'
import 'rxjs/add/observable/fromPromise'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/map'

import { pingPong, gain, config } from './effects'

const createAudioBuffer = (imageBuffer) => {
  const audioContext = new AudioContext()
  const audioBuffer = audioContext.createBuffer(1, imageBuffer.data.length, 44100)
  const nowBuffering = audioBuffer.getChannelData(0)
  nowBuffering.set(imageBuffer.data)

  const offlineAudioContext = new OfflineAudioContext(1, audioBuffer.length, 44100)
  const bufferSource = offlineAudioContext.createBufferSource()
  bufferSource.buffer = audioBuffer

  return { bufferSource, offlineAudioContext }
}

const createBuffers = (image) => {
  const imageBuffer = createImageBuffer(image)
  const { bufferSource, offlineAudioContext } = createAudioBuffer(imageBuffer)

  return { imageBuffer, bufferSource, offlineAudioContext }
}

const createImageBuffer = (image) => {
  const canvas = document.querySelector('canvas')
  canvas.height = 768
  canvas.width = 1280

  const context = canvas.getContext('2d')
  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  const imageBuffer = context.getImageData(0, 0, canvas.width, canvas.height)

  return imageBuffer
}

const complete = (offlineAudioContext) => new Promise((resolve, reject) => {
  offlineAudioContext.startRendering()
  offlineAudioContext.oncomplete = e => resolve(e.renderedBuffer)
})

const applyEffects = (offlineAudioContext, bufferSource) => {
  const userEffects = [
    (bufferSrc) => pingPong(offlineAudioContext, bufferSrc, config.pingPong),
    (bufferSrc) => gain(offlineAudioContext, bufferSrc, config.gain),
  ]

  const buffer$ = Observable.of(bufferSource)
  const bufferEnd$ = (bufferSrc) => {
    bufferSrc.connect(offlineAudioContext.destination)
    return Observable.of(offlineAudioContext)
  }

  const effectsChain = [
    ...userEffects,
    bufferEnd$,
  ].map(fn => ({ meta: {}, fn }))

  const reduceEffects = (acc, effect) => acc.mergeMap(effect.fn)
  const renderBuffer = (offlineAudioCtx) => Observable.fromPromise(complete(offlineAudioCtx))

  return effectsChain
    .reduce(reduceEffects, buffer$)
    .mergeMap(renderBuffer)
}
  
export const bender = (image) => {
  const { imageBuffer, bufferSource, offlineAudioContext } = createBuffers(image)

  bufferSource.start()

  const effectsBuffer$ = applyEffects(offlineAudioContext, bufferSource)

  return effectsBuffer$.map(audioBuffer => ({ imageBuffer, audioBuffer }))
}
