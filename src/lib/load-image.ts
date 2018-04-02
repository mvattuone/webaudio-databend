import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/fromPromise'
import 'rxjs/add/operator/mergeMap'

interface FileReaderEventTarget extends EventTarget {
  result: string
}

interface FileReaderEvent extends Event {
  target: FileReaderEventTarget
  getMessage(): string
}

declare var FileReaderEvent: {
  prototype: FileReaderEvent
  new (): FileReaderEvent
}

const readFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e: any) => resolve(e.target.result)
    reader.readAsDataURL(file)
  })

const readImage = (imageData: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = imageData
  })

export const loadImage = (file: File): Observable<HTMLImageElement> => {
  return Observable.fromPromise(readFile(file)).mergeMap(imageData =>
    Observable.fromPromise(readImage(imageData))
  )
}
