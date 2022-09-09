import { Component, OnInit } from '@angular/core';
import { openDialog } from '@remult/angular';
import { GridSettings } from '@remult/angular/interfaces';
import { Remult } from 'remult';
import { ChangeLogComponent } from '../change-log/change-log.component';
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
