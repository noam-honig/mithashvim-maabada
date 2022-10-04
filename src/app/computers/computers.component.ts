import { Component, OnInit } from '@angular/core';
import { Remult } from 'remult';
import { ChangeLogComponent } from '../change-log/change-log.component';
import { openDialog } from '../common-ui-elements';
import { GridSettings } from '../common-ui-elements/interfaces';
import { Computer } from './computer';

@Component({
  selector: 'app-computers',
  templateUrl: './computers.component.html',
  styleUrls: ['./computers.component.scss']
})
export class ComputersComponent implements OnInit {

  constructor(private remult: Remult) {

  }
  grid = new GridSettings(this.remult.repo(Computer), {
    numOfColumnsInGrid: 100,
    knowTotalRows: true,
    allowCrud: true, rowButtons: [{
      name: 'שינויים', click: c => openDialog(ChangeLogComponent, x => x.args = {
        for: c
      })
    }]
  })

  ngOnInit(): void {
  }

}
