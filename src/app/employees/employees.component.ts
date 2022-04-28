import { Component, OnInit } from '@angular/core';
import { GridSettings } from '@remult/angular/interfaces';
import { Remult } from 'remult';
import { Employee } from './employee';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {

  constructor(private remult: Remult) { }
  grid = new GridSettings(this.remult.repo(Employee), {
    allowCrud: true
  });
  ngOnInit(): void {
  }

}
