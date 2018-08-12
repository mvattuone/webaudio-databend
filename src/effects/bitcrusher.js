module.exports = (tuna, config) => {
  return new tuna.Bitcrusher({
    bits: config.bitcrusher.bits,
    normfreq: config.bitcrusher.normfreq,
    bufferSize: config.bitcrusher.bufferSize
  });
}
