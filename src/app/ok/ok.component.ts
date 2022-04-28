import { Component, Input, OnInit } from '@angular/core';
import { DataAreaSettings } from '@remult/angular/interfaces';
import { Remult } from 'remult';
import { DialogService } from '../common/dialog';
import { Computer, ComputerStatus } from '../computers/computer';

@Component({
  selector: 'app-ok',
  templateUrl: './ok.component.html',
  styleUrls: ['./ok.component.scss']
})
export class OkComponent implements OnInit {

  compRepo = this.remult.repo(Computer);
  input = this.compRepo.create();

  @Input() trash = false;
  status = ComputerStatus.successfulUpgrade;

  constructor(private remult: Remult, private ui: DialogService) { }

  ngOnInit(): void {
    if (this.trash)
      this.status = ComputerStatus.trash;
  }
  async update() {
    const c = await this.compRepo.findFirst({ barcode: this.input.barcode })
    if (!c)
      this.ui.error("ברקוד לא נמצא");
    else {
      c.status = this.status;
      await c.save();
      this.ui.info("סטטוס " + this.status.caption + " עודכן בהצלחה");
      this.input = this.compRepo.create();
    }
  }

}
