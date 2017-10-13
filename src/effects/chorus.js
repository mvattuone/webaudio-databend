if (effects.chorus.active) {
  var noEffects = false;

  var chorus = new tuna.Chorus({
      feedback: effects.chorus.feedback,
      delay: effects.chorus.delay,
      depth: effects.chorus.depth,
      rate: effects.chorus.rate,
  });
  bufferSource.connect(chorus);
  chorus.connect(offlineAudioCtx.destination);
}