import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/from'
import 'rxjs/add/observable/fromPromise'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/map'

import {
  config,
  biquad,
  bitcrusher,
  chorus,
  convolver,
  gain,
  phaser,
  pingPong,
  wahwah
} from './effects'

const createBuffers = (image) => {
  const audioContext = new AudioContext()
  
  const canvas = document.querySelector('canvas')
  canvas.height = 768
  canvas.width = 1280

  const context = canvas.getContext('2d')
  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  const bufferSize = imageData.data.length

  const audioBuffer = audioContext.createBuffer(1, bufferSize, 44100)
  const nowBuffering = audioBuffer.getChannelData(0)
  nowBuffering.set(imageData.data)

  const offlineAudioContext = new OfflineAudioContext(1, audioBuffer.length, 44100)
  const bufferSource = offlineAudioContext.createBufferSource()
  bufferSource.buffer = audioBuffer

  return { imageData, bufferSource, offlineAudioContext }
}

const complete = (offlineAudioContext) => new Promise((resolve, reject) => {
  offlineAudioContext.startRendering()
  offlineAudioContext.oncomplete = e => resolve(e.renderedBuffer)
})

export const bender = (image) => {
  const { imageData, bufferSource, offlineAudioContext } = createBuffers(image)

  bufferSource.start()

  const userEffects = [
    (bufferSrc) => phaser(offlineAudioContext, bufferSrc, config.phaser),
  ]
  
  const buffer$ = Observable.of(bufferSource)
  const effectsChain = [
    ...userEffects,
    (bufferSrc) => {
      bufferSrc.connect(offlineAudioContext.destination)
      return Observable.of(offlineAudioContext)
    },
  ].map(fn => ({ meta: {}, fn }))

  const reduceEffects = (acc, effect) => acc
    .do(data => console.log(data))
    .mergeMap(effect.fn)
  const render = (offlineAudioCtx) => Observable.fromPromise(complete(offlineAudioCtx))

  return effectsChain
    .reduce(reduceEffects, buffer$)
    .mergeMap(render)
    .map(buffer => ({imageData, audioBuffer: buffer}))
}
