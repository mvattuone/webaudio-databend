if (effects.convolver.active) {
  var noEffects = false;
  var convolver = new tuna.Convolver({
    highCut: effects.convolver.highCut,
    lowCut: effects.convolver.lowCut,
    dryLevel: effects.convolver.dryLevel,
    wetLevel: effects.convolver.wetLevel,
    level: effects.convolver.level,
    impulse: effects.convolver.impulse
  });
  bufferSource.connect(convolver);
  convolver.connect(offlineAudioCtx.destination);
}