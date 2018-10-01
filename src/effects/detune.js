'use strict';

module.exports = (config, tuna, bufferSource) => {
  if (config.detune.randomize) {
    var waveArray = new Float32Array(config.detune.randomValues);
    for (i=0;i<config.detune.randomValues;i++) {
      waveArray[i] = window.random.real(0.0001, 400); 
    }
  }
  if (config.detune.randomize) {
    bufferSource.detune.setValueCurveAtTime(waveArray, 0, bufferSource.buffer.duration);
  } else if (config.detune.enablePartial) {
    bufferSource.detune.setTargetAtTime(config.detune.value, config.detune.areaOfEffect, config.detune.areaOfEffect);
  } else {
    bufferSource.detune.value = config.detune.value;
  };
  return bufferSource;
}
