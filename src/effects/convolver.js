module.exports = (config, tuna) => {
  return new tuna.Convolver({
    highCut: config.convolver.highCut,
    lowCut: config.convolver.lowCut,
    dryLevel: config.convolver.dryLevel,
    wetLevel: config.convolver.wetLevel,
    level: config.convolver.level,
    impulse: config.convolver.impulse
  });
};
