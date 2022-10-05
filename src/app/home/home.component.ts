import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { getValueList, remult } from 'remult';
import { BusyService } from '../common-ui-elements';
import { DataAreaSettings } from '../common-ui-elements/interfaces';
import { UIToolsService } from '../common/UIToolsService';
import { Computer, ComputerStatus, CPUType, NewComputersDate, StatusDate } from '../computers/computer';
import { getConfig } from '../config/config.component';
import { Roles } from '../users/roles';


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
  newComputers: NewComputersDate[] = [];
  newStatusDates: StatusDate[] = [];
  displayedColumns: string[] = ['origin', 'quantity'];

  @ViewChild('myField') x!: ElementRef;
  constructor(private ui: UIToolsService, private busyService: BusyService) { }

  async ngOnInit() {
    this.init();
  }
  allowedForManager() {
    return !remult.isAllowed(Roles.anyManager) || this.input.status.allowed();
  }

  private async loadNewComputers() {
    if (this.isStatusEqualsToIntake())
      await this.busyService.donotWait(async () => {
        this.newComputers = await Computer.getNewComputers(ComputerStatus.intakeTrash === this.input.status)
      });
  }
  private async loadStatusDates() {
    if (this.isStatusEqualsToSuccessfulUpgrade())
      await this.busyService.donotWait(async () => {
        this.newStatusDates = await Computer.getStatusChanges()
      });
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
    this.loadNewComputers();
    this.loadStatusDates();
    setTimeout(() => {
      if (this.allowedForManager())
        this.x.nativeElement.getElementsByTagName('input')[0].focus()
    }, 0);
  }

  isStatusEqualsToIntake() {
    return ComputerStatus.intake === this.input.status || this.input
      .status === ComputerStatus.intakeTrash;
  }

  isStatusEqualsToSuccessfulUpgrade() {
    return ComputerStatus.successfulUpgrade === this.input.status;
  }

}

