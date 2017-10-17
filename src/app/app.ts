import { Component } from '../lib'

@Component({
  selector: 'app-root',
  template: `<div>First {{ this.name }}</div>
  <div>
    <app-name></app-name>
  </div>
  <app-name></app-name>
  <div>LAST {{ this.name }}</div>`,
})
export class App  {
  name = `app-${Math.random()}`

  constructor() {
    const test = 'foo'
    console.log('invoked app', this.name)
  }

  changeName() {
    this.name = `app-${Math.random()}`
  }
}

@Component({
  selector: 'app-name',
  template: `<div>HELLO {{ this.name }}!</div>`,
})
export class Name  {
  name = `name-${Math.random()}`

  constructor() {
    console.log('invoked name', this.name)
  }
}
