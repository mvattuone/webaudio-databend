module.exports = (config, tuna) => { 
  return new tuna.PingPongDelay({
    wetLevel: config.pingPong.wetLevel,
    feedback: config.pingPong.feedback,
    delayTimeLeft: config.pingPong.delayTimeLeft,
    delayTimeRight: config.pingPong.delayTimeRight
  });
};
