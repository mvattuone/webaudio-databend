module.exports = (config, tuna) => {
  console.log(tuna);
  return new tuna.Bitcrusher({
    bits: config.bitcrusher.bits,
    normfreq: config.bitcrusher.normfreq,
    bufferSize: config.bitcrusher.bufferSize
  });
}
