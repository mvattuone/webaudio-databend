import { CustomElement } from './custom-element'

export const bootstrap = (rootClass) => {
  const selector = rootClass.selector
  const rootElems = document.querySelectorAll(selector)

  if (rootElems.length > 1) {
    throw new Error('Cannot have more than 1 root element.')
  } else if (rootElems.length === 0) {
    throw new Error(`${selector} not found.`)
  }

  const rootElem = rootElems[0]
  const root = rootClass.__init(rootElem, false)

  const draw = (parent) => {
    if (parent.children && parent.children.length) {
      parent.children.forEach(child => {
        draw(child)
        parent.elem.appendChild(child.elem)
      })
    }
  }

  draw(root)
}
