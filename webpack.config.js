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
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['env']
        }
      }
    }]
  },
  resolve: {
    alias: {
      "module": "Databender"
    },
  }
}
