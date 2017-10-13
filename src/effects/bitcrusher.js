if (effects.bitcrusher.active) {
  var noEffects = false;

  var crusher = new tuna.Bitcrusher({
      bits: effects.bitcrusher.bits,
      normfreq: effects.bitcrusher.normfreq,
      bufferSize: effects.bitcrusher.bufferSize
  });
  bufferSource.connect(crusher);
  crusher.connect(offlineAudioCtx.destination);
}