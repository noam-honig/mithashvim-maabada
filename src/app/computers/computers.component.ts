import { Component, OnInit } from '@angular/core';
import { GridSettings } from '@remult/angular/interfaces';
import { Remult } from 'remult';
import { Computer } from './computer';

@Component({
  selector: 'app-computers',
  templateUrl: './computers.component.html',
  styleUrls: ['./computers.component.scss']
})
export class ComputersComponent implements OnInit {

  constructor(private remult: Remult) {

  }
  grid = new GridSettings(this.remult.repo(Computer), { allowCrud: true })

  ngOnInit(): void {
  }

}
