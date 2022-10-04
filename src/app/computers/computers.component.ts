import { Component, OnInit } from '@angular/core';
import { remult } from 'remult';
import { ChangeLogComponent } from '../change-log/change-log.component';
import { BusyService, openDialog } from '../common-ui-elements';
import { GridSettings } from '../common-ui-elements/interfaces';
import { saveToExcel } from '../common-ui-elements/interfaces/src/saveGridToExcel';
import { Computer } from './computer';

@Component({
  selector: 'app-computers',
  templateUrl: './computers.component.html',
  styleUrls: ['./computers.component.scss']
})
export class ComputersComponent implements OnInit {

  constructor(private busyService: BusyService) {

  }
  grid: GridSettings<Computer> = new GridSettings(remult.repo(Computer), {
    numOfColumnsInGrid: 100,
    knowTotalRows: true,
    columnOrderStateKey: 'computers',
    gridButtons: [{
      name: "Excel",
      click: () => saveToExcel(this.grid, "computers", this.busyService)
    }],
    allowCrud: true, rowButtons: [{
      name: 'שינויים', click: c => openDialog(ChangeLogComponent, x => x.args = {
        for: c
      })
    }]
  })

  ngOnInit(): void {
  }

}
