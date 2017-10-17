import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import * as parse5 from 'parse5'

const tags = new Map()

export class CustomElement {
  private static registry = new Map()
  
  static register(options, controllerClass) {
    if (CustomElement.registry.has(options.selector)) {
      throw new Error(`${options.selector} already registered.`)
    }

    const init = (elem: Element) => {
      const treeAdapter = parse5.treeAdapters.htmlparser2
      const doc: parse5.AST.HtmlParser2.ParentNode = (<any>parse5.parseFragment)(options.template, { treeAdapter })

      const name = options.selector
      const controller = new controllerClass()

      Reflect.ownKeys(controller)
      .forEach(key => {
        console.log({name, key})
        Reflect.defineProperty(controller, `__${key}`, {
          value: new BehaviorSubject(controller[key]),
          writable: false
        })
        Reflect.defineProperty(controller, key, {
            get: function() {
              return this[`__${key}`].asObservable()
            },
            set: function(val) {
              this[`__${key}`].next(val)
            }
          })
        })

      controller.instanceId = Math.random()

      const parent = {
        name,
        elem,
        controller,
        children: doc.children
          .map((child: any) => CustomElement.render(child as parse5.AST.HtmlParser2.Element))
        }

      const applyParent = (parent, child) => {
        if (child.children && child.children.length) {
          child.children = child.children.map(grandChild => applyParent(child, grandChild))
        }
        
        child.parent = parent
        child.controller = child.controller || controller
        
        const regex = new RegExp('{{([^{}]+)}}', 'g')
        if (child.name === 'text' && regex.test(child.elem.data)) {
          const text = child.elem.data
          const matches = text
            .match(regex)
            .forEach(match => {
              match
                .replace(/[{}]/g, '')
                .trim()
                .split('.')
                .filter(key => key !== 'this')
                .reduce((obj, key) => (obj[key]), child.controller)
                .subscribe(val => {
                  const newText = text.replace(new RegExp(match, 'g'), val)
                  child.elem.data = newText
                })
            })
        }

        return child
      }
      
      console.log({name, controller})
      parent.children = parent.children
        .map(child => applyParent(parent, child))

      return parent
    }

    controllerClass.__init = init
    controllerClass.selector = options.selector

    CustomElement.registry.set(options.selector, { options, controllerClass })

    return controllerClass
  }

  static get(selector) {
    if (!CustomElement.registry.has(selector)) {
      throw new Error(`${selector} not registered.`)
    }
    return CustomElement.registry.get(selector)
  }

  private static render(node) {
    const name = node.name || 'text'

    if (CustomElement.registry.has(name)) {
      return CustomElement.get(name).controllerClass.__init(document.createElement(name))
    }

    const data = (<any>node).data
    const nodeChildren = node.children && node.children.length
      ? node.children as parse5.AST.HtmlParser2.Element[]
      : []
  
    
    if (node.type === 'tag') {
      const elem = document.createElement(name)
      const children = nodeChildren
        .map(child => CustomElement.render(child))
        .map(child => (child.parent = elem, child))
      return { name, elem, children }
    } else {
      const elem = document.createTextNode(data)
      return { name, elem, parent: node }
    }
  }
}
