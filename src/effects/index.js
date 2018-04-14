// @TODO: Separate into separate files and import into here

exports.detune = (bufferSource, config) => {
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

exports.playbackRate = (bufferSource, config) => {
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

exports.bitcrusher = (tuna, config) => {
  return new tuna.Bitcrusher({
    bits: config.bitcrusher.bits,
    normfreq: config.bitcrusher.normfreq,
    bufferSize: config.bitcrusher.bufferSize
  });
}

exports.chorus = (tuna, config) => {
  return new tuna.Chorus({
    feedback: config.chorus.feedback,
    delay: config.chorus.delay,
    depth: config.chorus.depth,
    rate: config.chorus.rate,
  });
}

exports.biquad = (config) => {
  if (config.biquad.randomize) {
    var waveArray = new Float32Array(config.biquad.randomValues);
    for (i=0;i<config.biquad.randomValues;i++) {
      waveArray[i] = window.random.real(0.0001, config.biquad.biquadFrequency); 
    }
  }
  var biquadFilter = offlineAudioCtx.createBiquadFilter();
  biquadFilter.type = config.biquad.type;
  if (config.biquad.randomize) {
    biquadFilter.frequency.setValueCurveAtTime(waveArray, 0, bufferSource.buffer.duration);
    biquadFilter.detune.setValueCurveAtTime(waveArray, 0, bufferSource.buffer.duration);
  } else if (config.biquad.enablePartial) {
    biquadFilter.frequency.setTargetAtTime(config.biquad.biquadFrequency, config.biquad.areaOfEffect, config.biquad.areaOfEffect);
  } else {
    biquadFilter.frequency.value = config.biquad.biquadFrequency;
  };
  biquadFilter.Q.value = config.biquad.quality;
  biquadFilter.detune.value = config.biquad.detune;
  return biquadFilter;
}


exports.gain = (config) => {
  const gainNode = offlineAudioCtx.createGain();
  gainNode.gain.value = config.gain.value;
  return gainNode;
};

exports.pingPong = (tuna, config) => { 
  return new tuna.PingPongDelay({
    wetLevel: config.pingPong.wetLevel,
    feedback: config.pingPong.feedback,
    delayTimeLeft: config.pingPong.delayTimeLeft,
    delayTimeRight: config.pingPong.delayTimeRight
  });
};

exports.phaser = (tuna, config) => { 
  return new tuna.Phaser({
    rate: config.phaser.rate,
    depth: config.phaser.depth,
    feedback: config.phaser.feedback,
    stereoPhase: config.phaser.stereoPhase,
    baseModulationFrequency: config.phaser.baseModulationFrequency
  });
};

exports.convolver = (tuna, config) => {
  return new tuna.Convolver({
    highCut: config.convolver.highCut,
    lowCut: config.convolver.lowCut,
    dryLevel: config.convolver.dryLevel,
    wetLevel: config.convolver.wetLevel,
    level: config.convolver.level,
    impulse: config.convolver.impulse
  });
};

exports.wahwah = (tuna, config) => {
  return new tuna.WahWah({
    automode: config.wahwah.automode,
    baseFrequency: config.wahwah.baseFrequency,
    excursionOctaves: config.wahwah.excursionOctaves,
    sweep: config.wahwah.sweep,
    resonance: config.wahwah.resonance,
    sensitivity: config.wahwah.sensitivity
  });
};


