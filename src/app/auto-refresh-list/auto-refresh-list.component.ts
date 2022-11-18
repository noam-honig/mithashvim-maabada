import { Component, OnDestroy, OnInit } from '@angular/core'
import { Remult, ValueListInfo } from 'remult'
import { Computer } from '../computers/computer'
import { ComputerStatus } from "../computers/ComputerStatus"
import { Observable, Subscription, interval } from 'rxjs'
import { GridSettings } from '../common-ui-elements/interfaces'
import { BusyService } from '../common-ui-elements'
import { saveToExcel } from '../common-ui-elements/interfaces/src/saveGridToExcel'
import { DataRefreshService } from '../data-refresh/data-refresh.service'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'app-auto-refresh-list',
  templateUrl: './auto-refresh-list.component.html',
  styleUrls: ['./auto-refresh-list.component.scss'],
})
export class AutoRefreshListComponent implements OnInit, OnDestroy {
  private updateSubscription!: Subscription

  constructor(
    private remult: Remult,
    private busy: BusyService,
    private data: DataRefreshService,
    private route: ActivatedRoute,
  ) {}
  ngOnDestroy(): void {
    this.updateSubscription.unsubscribe()
  }
  filterStatus = ''
  grid: GridSettings<Computer> = new GridSettings(this.remult.repo(Computer), {
    orderBy: { updateDate: 'desc', createDate: 'desc' },
    columnOrderStateKey: 'auto-refresh',
    where: () => {
      if (this.filterStatus)
        return {
          status: ValueListInfo.get(ComputerStatus).byId(this.filterStatus),
        }
      return {}
    },
    gridButtons: [
      {
        name: 'Excel',
        click: () => saveToExcel(this.grid, 'auto-refresh', this.busy),
      },
    ],
  })
  ngOnInit(): void {
    this.route.paramMap.subscribe(async (x) => {
      this.filterStatus = x.get('status')!
      try {
        await this.grid.reloadData()
      } catch {}
    })

    this.updateSubscription = this.data.dataChanged$.subscribe(() => {
      this.busy.donotWait(async () => {
        await this.grid.reloadData()
      })
    })
  }
}

export const refreshList= 'רשימה מתרעננת';