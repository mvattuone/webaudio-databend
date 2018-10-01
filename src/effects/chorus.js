module.exports = (config, tuna) => {
  return new tuna.Chorus({
    feedback: config.chorus.feedback,
    delay: config.chorus.delay,
    depth: config.chorus.depth,
    rate: config.chorus.rate,
  });
}
