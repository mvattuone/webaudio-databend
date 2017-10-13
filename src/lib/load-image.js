import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/fromPromise'
import 'rxjs/add/operator/mergeMap'

const readFile = (file) =>  new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = (e) => resolve(e.target.result)
  reader.readAsDataURL(file)
})

const readImage = (imageData) => new Promise((resolve, reject) => {
  const img = new Image()
  img.onload = () => resolve(img)
  img.src = imageData
})

export const loadImage = (file) => {
  const file$ = Observable.fromPromise(readFile(file))

  return file$.mergeMap(imageData => Observable.fromPromise(readImage(imageData)))
}
