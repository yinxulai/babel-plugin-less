import path from 'path'
import less from '../src/index'
import { transformFileAsync } from '@babel/core';
const file = path.resolve(__dirname, "./cases/index.ts")

transformFileAsync(file, {
  presets: [
    "@babel/preset-typescript"
  ],
  plugins: [
    [less, {
      autoPrefix: true,
      cssModule: true
    }]
  ]
})
  .then(data => console.log('\nOutCode:\n', data && data.code))
  .catch(err => console.log(err))