import {
  BackendMethod,
  Controller,
  ControllerBase,
  Field,
  Fields,
  remult,
} from 'remult'
import { ComputerStatus } from '../computers/ComputerStatus'
import { Computer } from '../computers/computer'
import { Roles } from '../users/roles'

@Controller('update-pallet-status')
export class UpdatePalletStatusController extends ControllerBase {
  @Fields.string({
    caption: 'ברקוד משטח',
  })
  palletBarcode = ''
  @Field(() => ComputerStatus, {
    width: '170',
  })
  status = ComputerStatus.intake
  @Fields.string({
    caption: 'ברקוד מחשב',
  })
  barcode = ''

  @BackendMethod({ allowed: Roles.stockAdmin })
  async validate() {
    const count = await remult.repo(Computer).count({
      palletBarcode: this.palletBarcode,
      isLaptop: false,
    })
    if (count === 0) {
      throw Error('ברקוד משטח לא קיים במערכת. יש להעביר המשטח לקליטה במסופון')
    }
    if (
      (await remult.repo(Computer).count({
        barcode: this.barcode,
        palletBarcode: this.palletBarcode,
        isLaptop: false,
      })) === 0
    ) {
      throw Error(
        'ברקוד המחשב המדגמי שנסרק אינו משוייך למשטח שנסרק.   לא ניתן לבצע עדכון סטטוס גורף',
      )
    }
    if (
      (await remult.repo(Computer).count({
        palletBarcode: this.palletBarcode,
        status: { $ne: ComputerStatus.unknown },
        isLaptop: false,
      })) !== 0
    ) {
      throw Error(
        'המחשבים המשוייכים למשטח זה נמצאים בתהליך טיפול אחר. לא ניתן לבצע עדכון',
      )
    }
    return count
  }
  @BackendMethod({ allowed: Roles.stockAdmin })
  async update() {
    await this.validate()
    for await (const comp of remult.repo(Computer).query({
      where: {
        palletBarcode: this.palletBarcode,
        isLaptop: false,
      },
    })) {
      comp.status = this.status
      await comp.save()
    }
  }
}
