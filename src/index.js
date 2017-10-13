import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/fromEvent'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/operator/take'

import {
  setState,
  changes,
  loadImage,
  render,
  bender
} from './lib'

const init = () => {
  const canvas = document.createElement('canvas')
  document.querySelector('body').appendChild(canvas)

  const filePicker = document.querySelector('[type="file"]')
  const obs = Observable
    .fromEvent(filePicker, 'change')
    .map(event => event.target.files[0])
    .mergeMap(file => loadImage(file))
    .mergeMap(img => bender(img))
    .subscribe((data) => render(data))
}

Observable
  .fromEvent(document, 'DOMContentLoaded')
  .take(1)
  .subscribe(() => init())
