import { Component, OnDestroy, OnInit } from '@angular/core';
import { GridSettings } from '@remult/angular/interfaces';
import { Remult } from 'remult';
import { Computer } from '../computers/computer';
import { Observable, Subscription, interval } from 'rxjs';
import { BusyService } from '@remult/angular';


@Component({
  selector: 'app-auto-refresh-list',
  templateUrl: './auto-refresh-list.component.html',
  styleUrls: ['./auto-refresh-list.component.scss']
})
export class AutoRefreshListComponent implements OnInit, OnDestroy {
  private updateSubscription!: Subscription;

  constructor(private remult: Remult, private busy: BusyService) { }
  ngOnDestroy(): void {
    this.updateSubscription.unsubscribe();
  }
  grid = new GridSettings(this.remult.repo(Computer), {
    orderBy: { updateDate: "desc", createDate: "desc" },
    numOfColumnsInGrid: 100,
    knowTotalRows: true
  });
  ngOnInit(): void {
    this.updateSubscription = interval(1000).subscribe(
      (val) => {
        this.busy.donotWait(async () => {
          await this.grid.reloadData();
        });
      });


  }

}
