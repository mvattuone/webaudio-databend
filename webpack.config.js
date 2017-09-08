const path = require('path');

module.exports = {
  entry: './databend.js',
  output: {
    filename: 'databend.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'Databender', 
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  resolve: {
    alias: {
      "module": "Databender"
    },
  }
}
