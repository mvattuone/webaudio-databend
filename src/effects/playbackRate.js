module.exports = (config, tuna, bufferSource) => {
  if (config.playbackRate.randomize) {
    var waveArray = new Float32Array(config.playbackRate.randomValues);
    for (i=0;i<config.playbackRate.randomValues;i++) {
      waveArray[i] = window.random.integer(0.0001, 8); 
    }
    bufferSource.playbackRate.setValueCurveAtTime(waveArray, 0, bufferSource.buffer.duration);
  } else if (config.playbackRate.enablePartial) {
    bufferSource.playbackRate.setTargetAtTime(config.playbackRate.value, config.playbackRate.areaOfEffect, config.playbackRate.areaOfEffect);
  } else {
    bufferSource.playbackRate.value = config.playbackRate.value;
  };
  return bufferSource;
}
