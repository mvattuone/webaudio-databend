const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'awesome-typescript-loader'
      },
      {
        test: /\.html$/,
        loaders: 'html-loader'
      },
    ],
  },
  devServer: {
    port: 3000,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html')
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      polymer$: path.resolve(__dirname,'node_modules/@polymer/polymer/polymer.js'),
      polymerElement$: path.resolve(__dirname,'node_modules/@polymer/polymer/polymer-element.js')
    },
  },
}
