module.exports = (tuna, config) => {
  return new tuna.WahWah({
    automode: config.wahwah.automode,
    baseFrequency: config.wahwah.baseFrequency,
    excursionOctaves: config.wahwah.excursionOctaves,
    sweep: config.wahwah.sweep,
    resonance: config.wahwah.resonance,
    sensitivity: config.wahwah.sensitivity
  });
};
