import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataAreaSettings } from '@remult/angular/interfaces';
import { Fields, getValueList, Remult } from 'remult';
import { DialogService } from '../common/dialog';
import { Computer, ComputerStatus, CPUType } from '../computers/computer';
import { getConfig } from '../config/config.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  compRepo = this.remult.repo(Computer);
  types = getValueList(CPUType);
  input!: Computer;
  area!: DataAreaSettings;

  @ViewChild('myField') x!: ElementRef;
  constructor(private remult: Remult, private ui: DialogService) { }

  ngOnInit() {
    this.init();

  }
  async update() {
    if (this.input.status.isIntake) {
      this.input.employee = null;
      await this.input.save();
    } else {
      const c = await this.compRepo.findFirst({ barcode: this.input.barcode })
      if (!c) {
        this.ui.error("ברקוד לא נמצא");
        return;
      }
      else {
        c.status = this.input.status;
        if (c.status.updateEmployee) {
          c.employee = this.input.employee;
        }
        if (c.status.inputCpu) {
          c.cpu = this.input.cpu;
        }
        await c.save();
      }
    }
    this.ui.info(`עודכן ${this.input.status.caption} בהצלחה`);
    this.init();
  }
  private init() {
    let prev = this.input;
    this.input = getConfig(this.remult);
    if (prev) {
      this.input.courier = prev.courier;
      this.input.origin = prev.origin;
    }
    this.area = new DataAreaSettings({
      fields: () => [
        { field: this.input.$.origin, click: () => this.input.origin = '', clickIcon: 'clear' },
        { field: this.input.$.courier, click: () => this.input.origin = '', clickIcon: 'clear' }
      ]
    });
    setTimeout(() => {
      this.x.nativeElement.getElementsByTagName('input')[0].focus()
    }, 0);
  }

}

