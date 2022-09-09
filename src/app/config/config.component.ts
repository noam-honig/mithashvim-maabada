import { Component, OnInit } from '@angular/core';
import { RouteHelperService } from '@remult/angular';
import { DataAreaSettings } from '@remult/angular/interfaces';
import { ControllerBase, Remult } from 'remult';
import { DialogService } from '../common/dialog';
import { Computer } from '../computers/computer';
import { HomeComponent } from '../home/home.component';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {

  constructor(private remult: Remult, private routeHelper: RouteHelperService, private dialog: DialogService) { }
  input = getConfig(this.remult);
  area = new DataAreaSettings({
    fields: () => [
      { field: this.input.$.status },
      { field: this.input.$.employee, visible: () => this.input.status.updateEmployee }
    ]
  })
  ngOnInit(): void {
  }
  update() {
    if (this.input.status.updateEmployee && !this.input.employee) {
      this.dialog.error("חובה לבחור עובד");
    }
    else {
      localStorage.setItem('config', JSON.stringify({
        status: this.input.$.status.inputValue,
        employee: this.input.$.employee.inputValue
      }));
      this.routeHelper.navigateToComponent(HomeComponent);
    }
  }

}


export function getConfig(remult: Remult) {
  let r = remult.repo(Computer).create();
  let stored = localStorage.getItem("config");
  if (stored) {
    const obj = JSON.parse(stored);
    r.$.status.inputValue = obj.status;
    r.$.employee.inputValue = obj.employee;
    r.$.recipient.inputValue = obj.recipient;
    r.$.employee.load();
  }
  return r;
}