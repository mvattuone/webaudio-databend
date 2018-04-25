// rollup.config.js
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';

export default {
  input: 'src/main.js',
  output: {
    file: 'demo/bundle.js',
    name: 'webaudioDatabend',
    format: 'iife'
  },
  plugins: [
    commonjs(),
    resolve(),
    json({
      exclude: 'node_modules/**',
      preferConst: true
    })
  ]
};
