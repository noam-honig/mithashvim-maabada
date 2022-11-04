import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Remult, ValueConverters } from 'remult';
import { DeliveryFormController, Item } from '../driver-sign/delivery-form.controller';

@Component({
  selector: 'app-contact-sign',
  templateUrl: './contact-sign.component.html',
  styleUrls: ['./contact-sign.component.scss']
})
export class ContactSignComponent implements OnInit {

  constructor(private remult: Remult, private route: ActivatedRoute) { }
  form = new DeliveryFormController(this.remult);

  async ngOnInit() {
    this.route.paramMap.subscribe(async x => {

      var id = x.get('id');
      try {
        await this.form.load(+id!)

        const expectedItems = this.form.items.filter(x => (+x.actualQuantity) > 0);
        this.sortedItems = [...expectedItems];
      } catch { }

    });
  }
  async sign() {

    
    await this.form.signByContact();
    window.location.href = `/api/pdf/${this.form.id}.pdf`;
  }

  sortedItems: Item[] = [];

}
