import { Component, OnInit } from '@angular/core';
import { remult } from 'remult';
import { GridSettings } from '../common-ui-elements/interfaces';
import { Employee } from './employee';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {

  constructor() { }
  grid = new GridSettings(remult.repo(Employee), {
    allowCrud: true
  });
  ngOnInit(): void {
  }

}
