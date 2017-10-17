import { CustomElement } from './custom-element'

interface ComponentOptions {
  selector: string
  template: string
}

export const Component = (options: ComponentOptions) => (controllerClass) => CustomElement.register(options, controllerClass)
