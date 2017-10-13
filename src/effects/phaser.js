if (effects.phaser.active) {
  var noEffects = false;

  tuna = new Tuna(offlineAudioCtx);
  var phaser = new tuna.Phaser({
    rate: effects.phaser.rate,
    depth: effects.phaser.depth,
    feedback: effects.phaser.feedback,
    stereoPhase: effects.phaser.stereoPhase,
    baseModulationFrequency: effects.phaser.baseModulationFrequency
  });
  bufferSource.connect(phaser);
  phaser.connect(offlineAudioCtx.destination);
}