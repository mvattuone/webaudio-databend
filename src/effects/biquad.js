module.exports  = (config, offlineAudioCtx, bufferSource) => {
  if (config.biquad.randomize) {
    var waveArray = new Float32Array(config.biquad.randomValues);
    for (let i=0;i<config.biquad.randomValues;i++) {
      waveArray[i] = window.random.real(0.0001, config.biquad.biquadFrequency); 
    }
  }
  var biquadFilter = offlineAudioCtx.createBiquadFilter();
  biquadFilter.type = config.biquad.type;
  if (config.biquad.randomize) {
    biquadFilter.frequency.cancelScheduledValues(0);
    biquadFilter.frequency.setValueCurveAtTime(waveArray, 0, bufferSource.buffer.duration);
    biquadFilter.detune.setValueCurveAtTime(waveArray, 0, bufferSource.buffer.duration);
  } else if (config.biquad.enablePartial) {
    biquadFilter.frequency.cancelScheduledValues(0);
    biquadFilter.frequency.setTargetAtTime(config.biquad.biquadFrequency, config.biquad.areaOfEffect, config.biquad.areaOfEffect);
  } else {
    biquadFilter.frequency.cancelScheduledValues(0);
    biquadFilter.frequency.value = config.biquad.biquadFrequency;
  };
  biquadFilter.Q.value = config.biquad.quality;
  biquadFilter.detune.cancelScheduledValues(0);
  biquadFilter.detune.value = config.biquad.detune;
  return biquadFilter;
}
