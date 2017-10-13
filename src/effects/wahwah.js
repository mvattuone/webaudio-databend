if(effects.wahwah.active) {
  var noEffects = false;
  var wahwah = new tuna.WahWah({
      automode: effects.wahwah.automode,
      baseFrequency: effects.wahwah.baseFrequency,
      excursionOctaves: effects.wahwah.excursionOctaves,
      sweep: effects.wahwah.sweep,
      resonance: effects.wahwah.resonance,
      sensitivity: effects.wahwah.sensitivity
  });
  bufferSource.connect(wahwah);
  wahwah.connect(offlineAudioCtx.destination);
}