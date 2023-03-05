import { Injectable } from '@angular/core'
import { defer, interval, Observable, repeat, Subject } from 'rxjs'
import { BusyService } from '../common-ui-elements'
import { dataChangedChannel } from './data-refresh.controller'

@Injectable({
  providedIn: 'root',
})
export class DataRefreshService {
  constructor(busy: BusyService) {}
  observe<T>(what: () => Promise<T>) {
    return new Observable<T>((next) => {
      console.log('subscribe')
      what().then((x) => next.next(x))
      let result: Promise<VoidFunction> = dataChangedChannel.subscribe(() =>
        what().then((x) => next.next(x)),
      )
      return () => {
        console.log('unsubscribe')
        result.then((x) => x())
      }
    })
  }
}
