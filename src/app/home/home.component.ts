import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { getValueList, remult } from 'remult';
import { DataAreaSettings } from '../common-ui-elements/interfaces';
import { UIToolsService } from '../common/UIToolsService';
import { Computer, CPUType } from '../computers/computer';
import { getConfig } from '../config/config.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  compRepo = remult.repo(Computer);
  types = getValueList(CPUType);
  input!: Computer;
  area!: DataAreaSettings;

  @ViewChild('myField') x!: ElementRef;
  constructor( private ui: UIToolsService) { }

  ngOnInit() {
    this.init();

  }
  async update() {
    if (this.input.status.isIntake) {
      this.input.employee = null;
      await this.input.save();
    } else {
      let c: Computer;
      if (this.input.status.inputPackageBarcode)
        c = await this.compRepo.findFirst({ packageBarcode: this.input.packageBarcode })
      else
        c = await this.compRepo.findFirst({ barcode: this.input.barcode })
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
        if (c.status.inputRecipient) {
          c.recipient = this.input.recipient;
        }

        if (c.status.updatePackageBarcode) {

          c.packageBarcode = this.input.packageBarcode;
        }
        await c.save();
      }
    }
    this.ui.info(`עודכן ${this.input.status.caption} בהצלחה`);
    this.init();
  }
  private init() {
    let prev = this.input;
    this.input = getConfig();
    if (prev) {
      this.input.courier = prev.courier;
      this.input.origin = prev.origin;
      this.input.recipient = prev.recipient;
    }
    this.area = new DataAreaSettings({
      fields: () => [
        { field: this.input.$.origin, click: () => this.input.origin = '', clickIcon: 'clear', visible: () => this.input.status.isIntake },
        { field: this.input.$.courier, click: () => this.input.origin = '', clickIcon: 'clear', visible: () => this.input.status.isIntake },
        { field: this.input.$.recipient, click: () => this.input.recipient = '', clickIcon: 'clear', visible: () => this.input.status.inputRecipient },
      ]
    });
    setTimeout(() => {
      this.x.nativeElement.getElementsByTagName('input')[0].focus()
    }, 0);
  }

}

