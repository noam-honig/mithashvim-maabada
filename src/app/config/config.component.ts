import { Component, OnInit } from '@angular/core';
import { remult } from 'remult';
import { defer, repeat } from 'rxjs';
import { RouteHelperService } from '../common-ui-elements';
import { DataAreaSettings } from '../common-ui-elements/interfaces';
import { UIToolsService } from '../common/UIToolsService';
import { Computer } from '../computers/computer';
import { DataRefreshService } from '../data-refresh/data-refresh.service';
import { HomeComponent } from '../home/home.component';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {

  constructor(private routeHelper: RouteHelperService, private dialog: UIToolsService) { }

  input = getConfig();
  area = new DataAreaSettings({
    fields: () => [
      { field: this.input.$.status, width: "" },
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


export function getConfig() {
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