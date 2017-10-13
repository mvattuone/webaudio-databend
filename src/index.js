import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/fromEvent'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/operator/take'

import { loadImage } from './lib/load-image'
import { render } from './lib/render'

const init = () => {
  const canvas = document.createElement('canvas')
  document.querySelector('body').appendChild(canvas)

  const filePicker = document.querySelector('[type="file"]')
  Observable
    .fromEvent(filePicker, 'change')
    .map(event => event.target.files[0])
    .mergeMap(file => loadImage(file))
    .subscribe(img => render(img))
}

Observable
  .fromEvent(document, 'DOMContentLoaded')
  .take(1)
  .subscribe(() => init())
