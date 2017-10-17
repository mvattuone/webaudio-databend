import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/fromPromise'
import 'rxjs/add/operator/mergeMap'

const readFile = (file: File): Promise<string> =>  new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = (e: FileReaderEvent) => resolve(e.target.result)
  reader.readAsDataURL(file)
})

const readImage = (imageData: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
  const img = new Image()
  img.onload = () => resolve(img)
  img.src = imageData
})

export const loadImage = (file: File) => {
  const file$: Observable<string> = Observable.fromPromise(readFile(file))

  return file$.mergeMap(imageData => Observable.fromPromise(readImage(imageData)))
}
