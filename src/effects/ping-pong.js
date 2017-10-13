if (effects.pingPong.active) {
  var noEffects = false;

  var pingPongDelayNode = new tuna.PingPongDelay({
      wetLevel: effects.pingPong.wetLevel,
      feedback: effects.pingPong.feedback,
      delayTimeLeft: effects.pingPong.delayTimeLeft,
      delayTimeRight: effects.pingPong.delayTimeRight
  });
  bufferSource.connect(pingPongDelayNode);
  pingPongDelayNode.connect(offlineAudioCtx.destination);
}