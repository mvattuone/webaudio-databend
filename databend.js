import { Tuna } from 'tunajs'
import * as effects from './effects.json'

export class Databender {
  constructor(image) {
    this.effects = effects
    this.audioCtx = new AudioContext()

    this.canvas = document.createElement('canvas')
    this.canvas.width = image.width
    this.canvas.height = image.height

    this.channels = 1

    this.ctx = this.canvas.getContext('2d')
    this.ctx.drawImage(imnage, 0, 0)

    this.imageData = this.ctx.getImageData(0, 0, image.width, imnage.height).data

    this.bufferSize = this.imageData.length / this.channels

    this.audioBuffer = this.audioCtx.createBuffer(this.channels, this.bufferSize, this.audioCtx.sampleRate)

    this.nowBuffering = this.audioBuffer.getChannelData(0)
    this.nowBuffering.set(this.imageData)

    this.render(this.imageData)
  }

  setParam(effect, paramName, paramValue) {
    this.effects[effect][paramName] = paramValue
    return this.render(this.imageData)
  }

  toggleEffect(effect, params) {
    this.effects[effect].active = !this.effects[effect].active
    return this.render(this.imageData)
  }

  setEffect(effect) {
    this.effects[effect].active = true
    return this.render(this.imageData)
  }

  unsetEffect(effect) {
    effects[effect].active = false
    return this.render(this.imageData)
  }

  render(data) {
    const effects = this.effects

    // @NOTE: This has to be instantiated every time we "render" because
    // `Uncaught (in promise) DOMException: cannot startRendering when an OfflineAudioContext is closed
    const offlineAudioCtx = new OfflineAudioContext(this.channels, this.bufferSize, this.audioCtx.sampleRate)

    // Create an AudioBufferSourceNode, which represents an audio source
    // consisting of in-memory audio data
    const bufferSource = offlineAudioCtx.createBufferSource()

    // Set buffer to audio buffer containing image data
    bufferSource.buffer = this.audioBuffer

    // Seems to rotate the image, clockwise if postitive ccw if negative
    if (effects.detune.active) {
      const noEffects = false
      bufferSource.detune.value = effects.detune.value
    }

    // Seems to "play back" the image at a rate equal to the number
    // (i.e. 4 yields 4 smaller rendered images)
    if (effects.playbackRate.active) {
      const noEffects = false
      bufferSource.playbackRate.value = effects.playbackRate.value
    }

    //  @NOTE: Calling this is when the AudioBufferSourceNode becomes unusable
    bufferSource.start()

    // @TODO Can we decouple effects from this?
    let tuna = new Tuna(offlineAudioCtx)
    
    let noEffects = true
    if (effects.bitcrusher.active) {
      noEffects = false

      const crusher = new tuna.Bitcrusher({
          bits: effects.bitcrusher.bits,
          normfreq: effects.bitcrusher.normfreq,
          bufferSize: effects.bitcrusher.bufferSize
      })
      bufferSource.connect(crusher)
      crusher.connect(offlineAudioCtx.destination)
    }

    if (effects.biquad.active) {
      noEffects = false
      const biquadFilter = offlineAudioCtx.createBiquadFilter()
      biquadFilter.type = effects.biquad.type
      biquadFilter.frequency.value = effects.biquad.biquadFrequency
      biquadFilter.gain.value = effects.biquad.biquadGain
      bufferSource.connect(biquadFilter)
      biquadFilter.connect(offlineAudioCtx.destination)
    }

    if (effects.gain.active) {
      noEffects = false
      const gainNode = offlineAudioCtx.createGain()
      bufferSource.connect(gainNode)
      gainNode.gain.value = effects.gain.value
      gainNode.connect(offlineAudioCtx.destination)
    }

    if (effects.pingPong.active) {
      noEffects = false

      const pingPongDelayNode = new tuna.PingPongDelay({
          wetLevel: effects.pingPong.wetLevel,
          feedback: effects.pingPong.feedback,
          delayTimeLeft: effects.pingPong.delayTimeLeft,
          delayTimeRight: effects.pingPong.delayTimeRight
      })
      bufferSource.connect(pingPongDelayNode)
      pingPongDelayNode.connect(offlineAudioCtx.destination)
    }

    if (effects.phaser.active) {
      noEffects = false

      tuna = new Tuna(offlineAudioCtx)
      const phaser = new tuna.Phaser({
        rate: effects.phaser.rate,
        depth: effects.phaser.depth,
        feedback: effects.phaser.feedback,
        stereoPhase: effects.phaser.stereoPhase,
        baseModulationFrequency: effects.phaser.baseModulationFrequency
      })
      bufferSource.connect(phaser)
      phaser.connect(offlineAudioCtx.destination)
    }

    if (effects.convolver.active) {
      noEffects = false
      const convolver = new tuna.Convolver({
        highCut: this.effects.convolver.highCut,
        lowCut: this.effects.convolver.lowCut,
        dryLevel: this.effects.convolver.dryLevel,
        wetLevel: this.effects.convolver.wetLevel,
        level: this.effects.convolver.level,
        impulse: this.effects.convolver.impulse
      })
      bufferSource.connect(convolver)
      convolver.connect(offlineAudioCtx.destination)
    }

    if(effects.wahwah.active) {
      noEffects = false
      const wahwah = new tuna.WahWah({
          automode: effects.wahwah.automode,
          baseFrequency: effects.wahwah.baseFrequency,
          excursionOctaves: effects.wahwah.excursionOctaves,
          sweep: effects.wahwah.sweep,
          resonance: effects.wahwah.resonance,
          sensitivity: effects.wahwah.sensitivity
      })
      bufferSource.connect(wahwah)
      wahwah.connect(offlineAudioCtx.destination)
    }

    if (noEffects) {
      bufferSource.connect(offlineAudioCtx.destination)
    }

    // Kick off the render, callback will contain rendered buffer in event
    offlineAudioCtx.startRendering()

    // Render the databent image.
    offlineAudioCtx.oncomplete = (e) => {
      // Instead of starting the bufferSource, move data back into Canvas land.
      this.draw(e.renderedBuffer)
    }
  }

  draw(buffer) {
    // Get buffer data
    const bufferData = buffer.getChannelData(0)

    // ImageData expects a Uint8ClampedArray so we need to make a typed array from our buffer
    // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
    const clampedDataArray = new Uint8ClampedArray(buffer.length)

    // set the renderedBuffer to Uint8ClampedArray to use in ImageData later
    clampedDataArray.set(bufferData)

    // putImageData requires an ImageData Object
    // @see https://developer.mozilla.org/en-US/docs/Web/API/ImageData
    const transformedImage = new ImageData(clampedDataArray, this.canvas.width, this.canvas.height)
    this.ctx.putImageData(transformedImage, 0, 0)
    document.body.prepend(this.canvas)
  }
}
