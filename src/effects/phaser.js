module.exports = (config, tuna) => { 
  return new tuna.Phaser({
    rate: config.phaser.rate,
    depth: config.phaser.depth,
    feedback: config.phaser.feedback,
    stereoPhase: config.phaser.stereoPhase,
    baseModulationFrequency: config.phaser.baseModulationFrequency
  });
};
