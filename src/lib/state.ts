import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/from'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/map'

const storageKey = 'bender_state'
let localState = {}

const loadStore = () => Observable
  .from(localStorage.getItem(storageKey))
  .filter(Boolean)
  .map(data => JSON.parse(data))
  .do(state => localState = Object.assign({}, state))
  .subscribe(state => store.next(state))

const store = new BehaviorSubject(localState)
export const changes = store
  .asObservable()
  .distinctUntilChanged()
  .do(state => localStorage.setItem(storageKey, JSON.stringify(state)))

export const setState = (key, value) => {
  localState = Object.assign({}, localState, { [key]: value })
  store.next(localState)
}
