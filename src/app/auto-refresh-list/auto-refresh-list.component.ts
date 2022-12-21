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
import { UIToolsService } from '../common/UIToolsService'

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
    private ui: UIToolsService
  ) { }
  ngOnDestroy(): void {
    this.updateSubscription.unsubscribe()
  }
  filterStatus = ''
  filterOriginId = '';
  grid: GridSettings<Computer> = new GridSettings(this.remult.repo(Computer), {
    orderBy: { updateDate: 'desc', createDate: 'desc' },
    columnOrderStateKey: 'auto-refresh',
    where: () => ({
      status: this.filterStatus ? ValueListInfo.get(ComputerStatus).byId(this.filterStatus) : undefined,
      originId: this.filterOriginId ? this.filterOriginId : undefined
    })
    ,
    gridButtons: [
      {
        name: 'רענן נתונים בmonday',
        click: async () => {
          this.ui.info(await Computer.updateMondayStats(this.filterOriginId));
        },
        visible: () => Boolean(this.filterOriginId)
      },
      {
        name: 'Excel',
        click: () => saveToExcel(this.grid, 'auto-refresh', this.busy),
      },
    ],
  })
  ngOnInit(): void {
    this.route.queryParamMap.subscribe(async (x) => {
      this.filterOriginId = x.get('originId')!;
      try {
        await this.grid.reloadData()
      } catch { }
    })
    this.route.paramMap.subscribe(async (x) => {
      this.filterStatus = x.get('status')!
      try {
        await this.grid.reloadData()
      } catch { }
    })

    this.updateSubscription = this.data.dataChanged$.subscribe(() => {
      this.busy.donotWait(async () => {
        await this.grid.reloadData()
      })
    })
  }
}

export const refreshList = 'רשימה מתרעננת';