interface FileReaderEventTarget extends EventTarget {
  result:string
}

interface FileReaderEvent extends Event {
  target: FileReaderEventTarget;
  getMessage():string;
}

declare var FileReaderEvent: {
  prototype: FileReaderEvent
  new(): FileReaderEvent
}
