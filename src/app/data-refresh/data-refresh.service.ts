import { Injectable } from '@angular/core';
import { defer, interval, repeat, Subject } from 'rxjs';
import { BusyService } from '../common-ui-elements';
import { DataRefreshController } from './data-refresh.controller';

@Injectable({
  providedIn: 'root'
})
export class DataRefreshService {
  private lastUpdate = '';
  constructor(busy: BusyService) {
    // consider using rxjs shared when we switch to server side events
    // https://rxjs.dev/api/operators/share
    interval(1000).subscribe(async () => {
      if (this.dataChanged$.observed) {
        const z = await busy.donotWait(() => DataRefreshController.lastUpdate());
        if (z !== this.lastUpdate) {
          this.lastUpdate = z;
          this.dataChanged$.next();
        }
      }
    });
  }
  observe<T>(what: () => Promise<T>) {
    return defer(what).pipe(
      repeat({ delay: () => this.dataChanged$ })
    );
  }
  dataChanged$ = new Subject<void>();

}
