import { Component, OnInit } from '@angular/core'
import { remult } from 'remult'
import { ChangeLogComponent } from '../change-log/change-log.component'
import { BusyService, openDialog } from '../common-ui-elements'
import { GridSettings } from '../common-ui-elements/interfaces'
import { saveToExcel } from '../common-ui-elements/interfaces/src/saveGridToExcel'
import { UIToolsService } from '../common/UIToolsService'
import { Roles } from '../users/roles'
import { Computer } from './computer'

@Component({
  selector: 'app-computers',
  templateUrl: './computers.component.html',
  styleUrls: ['./computers.component.scss'],
})
export class ComputersComponent implements OnInit {
  constructor(private busyService: BusyService, private ui: UIToolsService) { }
  grid: GridSettings<Computer> = new GridSettings(remult.repo(Computer), {
    numOfColumnsInGrid: 100,
    knowTotalRows: true,
    columnOrderStateKey: 'computers',
    gridButtons: [
      {
        name: 'Excel',
        click: () =>
          saveToExcel<Computer>(
            this.grid,
            'computers',
            this.busyService,
            (e, c) => e.$.id === c,
          ),
      },
    ],
    allowCrud: remult.isAllowed(Roles.updateComputers),
    rowButtons: [
      {
        name: 'רענן נתונים בmonday',
        click: async (c) => {
          this.ui.info(await Computer.updateMondayStats(c.originId));
        },
        visible: (c) => Boolean(c.originId)
      },
      {
        name: 'שינויים',
        click: (c) =>
          openDialog(
            ChangeLogComponent,
            (x) =>
            (x.args = {
              for: c,
            }),
          ),
      },
    ],
  })

  ngOnInit(): void { }
}
