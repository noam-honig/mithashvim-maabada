import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import {
  Field,
  getFields,
  getValueList,
  remult,
  ValueListFieldType,
} from 'remult'
import { BusyService } from '../common-ui-elements'
import { DataAreaSettings } from '../common-ui-elements/interfaces'
import { UIToolsService } from '../common/UIToolsService'
import { Computer, StatusDate } from '../computers/computer'
import { CPUType } from '../computers/CPUType'
import { ComputerStatus } from '../computers/ComputerStatus'
import { getConfig } from '../config/config.component'
import { Roles } from '../users/roles'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  compRepo = remult.repo(Computer)
  types = getValueList(CPUType)
  input!: Computer
  area!: DataAreaSettings
  newStatusDates: StatusDate[] = []

  @Field(() => inputType, { caption: 'שיטת עדכון' })
  inputMethod = inputType.pallet

  showPallet() {
    return (
      (this.input.status.canUpdateCompletePallet && this.inputMethod.pallet) ||
      this.input.status.inputPallet
    )
  }
  submit() {
    if (this.input.status === ComputerStatus.intake) {
      this.update()
    }
  }

  @ViewChild('myField') x!: ElementRef
  constructor(private ui: UIToolsService, private busyService: BusyService) { }

  async ngOnInit() {
    this.init()
    if (!this.input.status.canUpdateCompletePallet)
      this.inputMethod = inputType.computer
  }
  allowedForManager() {
    return !remult.isAllowed(Roles.anyManager) || this.input.status.allowed()
  }

  private async loadStatusDates() {
    await this.busyService.donotWait(async () => {
      this.newStatusDates = await Computer.getStatusChanges(
        this.input.status,
        this.input.employee?.id,
      )
    })
  }

  async update() {
    const updateComputerBasedOnInput = (c: Computer) => {
      c.status = this.input.status
      if (c.status.updateEmployee) {
        c.employee = this.input.employee
      }
      if (c.status.inputCpu) {
        c.cpu = this.input.cpu
      }
      if (c.status.inputRecipient) {
        c.recipient = this.input.recipient
      }

      if (c.status.updatePackageBarcode) {
        c.packageBarcode = this.input.packageBarcode
      }
      if (c.status.assignPallet) {
        c.palletBarcode = this.input.palletBarcode
      } else if (c.status.clearPallet) {
        c.palletBarcode = ''
      }
    }

    if (this.input.status.isIntake) {
      this.input.employee = null
      this.input.isLaptop = this.input.status.laptopIntake
      await this.input.save()
    } else {
      if (this.inputMethod.pallet) {
        const computersInPallet = this.compRepo.query({
          where: {
            palletBarcode: this.input.palletBarcode,
          },
        })
        const count = await computersInPallet.count()
        if (count == 0) {
          this.ui.error('לא נמצאו מחשבים למשטח')
          return
        } else {
          if (
            !(await this.ui.yesNoQuestion(
              'האם לעדכן ' +
              count +
              ' מחשבים לסטטוס ' +
              this.input.status.caption +
              '?',
            ))
          ) {
            return
          }
          for await (const c of computersInPallet) {
            updateComputerBasedOnInput(c)
            await c.save()
          }
        }
      } else {
        let c: Computer
        if (this.input.status.inputPackageBarcode)
          c = await this.compRepo.findFirst({
            packageBarcode: this.input.packageBarcode,
          })
        else c = await this.compRepo.findFirst({ barcode: this.input.barcode })
        if (!c) {
          this.ui.error('ברקוד לא נמצא')
          return
        } else {
          if (c.status == this.input.status) {
            this.ui.error('מחשב זה כבר מעודכן כ' + c.status.caption)
            return
          }
          updateComputerBasedOnInput(c)

          await c.save()
        }
      }
    }

    this.ui.info(`עודכן ${this.input.status.caption} בהצלחה`)
    this.init()


  }
  get $() {
    return getFields(this)
  }
  private init() {
    let prev = this.input
    this.input = getConfig()
    this.input.filterSelectDialogs = true
    if (prev) {
      this.input.courier = prev.courier
      this.input.origin = prev.origin
      this.input.originId = prev.originId
      this.input.recipient = prev.recipient
      this.input.model = prev.model
      this.input.make = prev.make
      this.input.palletBarcode = prev.palletBarcode
      if (this.input.status.inputPallet)
        this.input.palletBarcode = prev.palletBarcode
    }
    this.area = new DataAreaSettings({
      fields: () => [
        {
          field: this.input.$.make,
          visible: () => this.input.status.laptopIntake,
        },
        {
          field: this.input.$.model,
          visible: () => this.input.status.laptopIntake,
        },
        {
          field: this.input.$.origin,
          visible: () => this.input.status.isIntake,
        },
        {
          field: this.input.$.courier,
          click: () => (this.input.courier = ''),
          clickIcon: 'clear',
          visible: () => this.input.status.isIntake,
        },
        {
          field: this.input.$.recipient,
          visible: () => this.input.status.inputRecipient,
        },
      ],
    })
    this.loadStatusDates()
    setTimeout(() => {
      if (this.allowedForManager())
        this.x.nativeElement.getElementsByTagName('input')[0].focus()
    }, 0)
  }
}

@ValueListFieldType()
class inputType {
  static pallet = new inputType('עדכן משטח', true)
  static computer = new inputType('עדכן מחשב יחיד', false)
  id!: string
  constructor(public caption: string, public pallet: boolean) { }
}
