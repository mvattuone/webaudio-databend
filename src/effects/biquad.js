if (effects.biquad.active) {
  var noEffects = false;
  if (effects.biquad.randomize) {
    var waveArray = new Float32Array(effects.biquad.randomValues);
    for (i=0;i<effects.biquad.randomValues;i++) {
      waveArray[i] = window.random.real(0.0001, effects.biquad.biquadFrequency); 
    }
  }
  var biquadFilter = offlineAudioCtx.createBiquadFilter();
  biquadFilter.type = effects.biquad.type;
  if (effects.biquad.randomize) {
    biquadFilter.frequency.setValueCurveAtTime(waveArray, 0, bufferSource.buffer.duration);
    biquadFilter.detune.setValueCurveAtTime(waveArray, 0, bufferSource.buffer.duration);
  } else if (effects.biquad.enablePartial) {
    biquadFilter.frequency.setTargetAtTime(effects.biquad.biquadFrequency, effects.biquad.areaOfEffect, effects.biquad.areaOfEffect);
  } else {
    biquadFilter.frequency.value = effects.biquad.biquadFrequency;
  };
  biquadFilter.Q.value = effects.biquad.quality;
  biquadFilter.detune.value = effects.biquad.detune;
  bufferSource.connect(biquadFilter);
  biquadFilter.connect(offlineAudioCtx.destination);
}