import { Component, OnInit } from '@angular/core'
import { Field, getFields, remult, ValueListFieldType } from 'remult'
import { DataAreaSettings } from '../common-ui-elements/interfaces'
import { UIToolsService } from '../common/UIToolsService'
import { Computer } from '../computers/computer'
import { Roles } from '../users/roles'

@Component({
  selector: 'app-assign-to-pallet',
  templateUrl: './assign-to-pallet.component.html',
  styleUrls: ['./assign-to-pallet.component.scss'],
})
export class AssignToPalletComponent implements OnInit {
  constructor(private ui: UIToolsService) {}
  compRepo = remult.repo(Computer)
  input = this.compRepo.create()

  get $() {
    return getFields<AssignToPalletComponent>(this)
  }

  @Field(() => inputMethod, { caption: 'שיטת ברקוד' })
  inputMethod = inputMethod.computer
  area: DataAreaSettings = new DataAreaSettings({
    fields: () => [
      this.$.inputMethod,
      this.input.$.palletBarcode,
      {
        field: this.input.$.barcode,
        visible: () => !this.inputMethod.packageBarcode,
      },
      {
        field: this.input.$.packageBarcode,
        visible: () => this.inputMethod.packageBarcode,
      },
    ],
  })
  submit() {
    if (
      (this.input.barcode || this.input.packageBarcode) &&
      this.input.palletBarcode
    ) {
      this.update()
    }
    return false
  }
  allowSelectMethod() {
    return (
      remult.isAllowed(Roles.stockAdmin) && remult.isAllowed(Roles.packAdmin)
    )
  }

  ngOnInit(): void {
    if (
      remult.isAllowed(Roles.packAdmin) &&
      !remult.isAllowed(Roles.stockAdmin)
    )
      this.inputMethod = inputMethod.packageBarcode
  }
  async update() {
    let comp: Computer
    if (this.inputMethod.packageBarcode) {
      comp = await this.compRepo.findFirst({
        packageBarcode: this.input.packageBarcode,
        deleted: false,
      })
    } else
      comp = await this.compRepo.findFirst({
        barcode: this.input.barcode,
        deleted: false,
      })
    if (!comp) {
      this.ui.error('מחשב לא נמצא')
      return
    }
    comp.palletBarcode = this.input.palletBarcode
    await comp.save()
    this.input.barcode = ''
    this.input.packageBarcode = ''
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
