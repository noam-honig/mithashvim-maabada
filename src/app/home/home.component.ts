import { Component, OnInit } from '@angular/core';
import { DataAreaSettings } from '@remult/angular/interfaces';
import { Fields, getValueList, Remult } from 'remult';
import { DialogService } from '../common/dialog';
import { Computer, CPUType } from '../computers/computer';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  compRepo = this.remult.repo(Computer);
  types = getValueList(CPUType);
  input = this.compRepo.create();
  area = new DataAreaSettings({ fields: () => [this.input.$.employee] });

  constructor(private remult: Remult, private ui: DialogService) { }

  ngOnInit() {

  }
  async update() {
    await this.input.save();
    this.ui.info("מחשב נקלט בהצלחה ושוייך ל" + this.input.employee.name);
    this.input = this.compRepo.create();
    this.area = new DataAreaSettings({ fields: () => [this.input.$.employee] });
  }
}

