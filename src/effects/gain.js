if (effects.gain.active) {
  var noEffects = false;
  var gainNode = offlineAudioCtx.createGain();
  bufferSource.connect(gainNode);
  gainNode.gain.value = effects.gain.value;
  gainNode.connect(offlineAudioCtx.destination);
}