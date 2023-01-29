import { Component, OnInit } from '@angular/core';
import { Fields, getFields, remult } from 'remult';
import { DataControl } from '../common-ui-elements/interfaces';
import { UITools } from '../common/UITools';
import { UIToolsService } from '../common/UIToolsService';
import { Donor } from '../computers/computer';
import { DeliveryFormController } from '../driver-sign/delivery-form.controller';

@Component({
  selector: 'app-count-items',
  templateUrl: './count-items.component.html',
  styleUrls: ['./count-items.component.scss']
})
export class CountItemsComponent implements OnInit {

  constructor(private ui: UIToolsService) { }
  get $() {
    return getFields(this)
  }
  @DataControl({
    hideDataOnInput: true,
    getValue: (_, x) => x.value?.caption
  })
  @Fields.object<CountItemsComponent, Donor>({
    caption: 'תורם',
    clickWithUI: (ui, _, f) => {
      ui.selectDonor({
        forCount: true,
        onSelect: x => {
          _.donor = x;
          _.form = new DeliveryFormController(remult);
          _.form.load(+x.id)
        }
      })
    }
  })
  donor?: Donor;
  form = new DeliveryFormController(remult);
  ngOnInit(): void {

  }
  async update() {
    await this.form.updateCount();
    this.ui.info("ספירה עודכנה בהצלחה");
    this.donor = undefined;
    this.form = new DeliveryFormController(remult)
  }

}
