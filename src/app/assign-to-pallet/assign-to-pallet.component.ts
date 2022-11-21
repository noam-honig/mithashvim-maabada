import { Component, OnInit } from '@angular/core'
import { Field, getFields, remult, ValueListFieldType } from 'remult'
import { DataAreaSettings } from '../common-ui-elements/interfaces'
import { UIToolsService } from '../common/UIToolsService'
import { Computer } from '../computers/computer'

@Component({
  selector: 'app-assign-to-pallet',
  templateUrl: './assign-to-pallet.component.html',
  styleUrls: ['./assign-to-pallet.component.scss'],
})
export class AssignToPalletComponent implements OnInit {
  constructor(private ui: UIToolsService) {}
  compRepo = remult.repo(Computer)
  input = this.compRepo.create()

  @Field(() => inputMethod, { caption: 'שיטת ברקוד' })
  inputMethod = inputMethod.computer
  area = new DataAreaSettings({
    fields: () => [
      getFields(this).inputMethod,
      {
        field: this.input.$.barcode,
        visible: () => !this.inputMethod.packageBarcode,
      },
      {
        field: this.input.$.packageBarcode,
        visible: () => this.inputMethod.packageBarcode,
      },
      this.input.$.palletBarcode,
    ],
  })

  ngOnInit(): void {}
  async update() {
    let comp: Computer
    if (this.inputMethod.packageBarcode) {
      comp = await this.compRepo.findFirst({
        packageBarcode: this.input.packageBarcode,
      })
    } else
      comp = await this.compRepo.findFirst({
        barcode: this.input.barcode,
      })
    if (!comp) {
      this.ui.error('מחשב לא נמצא')
      return
    }
    comp.palletBarcode = this.input.palletBarcode
    await comp.save()
    this.ui.info('המחשב עודכן למשטח ' + this.input.palletBarcode)
  }
}

@ValueListFieldType()
class inputMethod {
  static computer = new inputMethod('ברקוד מחשב')
  static packageBarcode = new inputMethod('ברקוד אריזה', true)
  id!: string
  constructor(public caption: string, public packageBarcode = false) {}
}