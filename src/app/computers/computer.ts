import {
  Allow,
  Entity,
  Field,
  Fields,
  IdEntity,
  remult,
  Validators,
  BackendMethod,
  getValueList,
} from 'remult'
import { recordChanges, ChangeLog } from '../change-log/change-log'
import { DataControl } from '../common-ui-elements/interfaces'
import '../common/UITools'
import { dataWasChanged } from '../data-refresh/data-refresh.controller'
import { countStatusColumnInMonday, deliveriesBoardNumber, DeliveryFormController, itemsBoardNumber } from '../driver-sign/delivery-form.controller'
import { gql } from '../driver-sign/getGraphQL'
import { Employee } from '../employees/employee'
import { Roles } from '../users/roles'
import { ComputerStatus } from './ComputerStatus'
import { CPUType } from './CPUType'

@Entity<Computer>('computers', {
  allowApiCrud: Allow.authenticated,
  allowApiDelete: false,
  defaultOrderBy: {
    createDate: 'desc',
  },
  saving: async (self) => {
    self.updateDate = new Date()
    await recordChanges(self, {
      excludeColumns: (e) => [e.updateDate],
    })
    dataWasChanged()

  },
  saved: async self => {
    if (self.originId && self.isNew()) {
      const computers = await remult.repo(Computer).find({
        where: {
          originId: self.originId
        }
      });
      let laptops = 0;
      let laptopsTrash = 0;
      let comps = 0;
      let compsTrash = 0;
      for (const c of computers) {
        if (c.isLaptop) {
          if (c.status === ComputerStatus.intakeTrashLaptop)
            laptopsTrash++;
          else laptops++;
        }
        else {
          if (c.status === ComputerStatus.intakeTrashLaptop)
            compsTrash++;
          else comps++;
        }
      }
      const form = new DeliveryFormController(remult)
      form.load(+self.originId).then(() => {
        let done = 0;
        {
          let compItem = form.items.find(i => i.name === "מחשב נייח");
          if (compItem) {
            form.update(itemsBoardNumber, compItem.id, "numbers2", comps.toString())
            form.update(itemsBoardNumber, compItem.id, "numbers5", compsTrash.toString())
            if (+compItem.countQuantity <= comps + compsTrash)
              done++;
          }

        }
        {
          let laptopItem = form.items.find(i => i.name === "מחשב נייד");
          if (laptopItem) {
            form.update(itemsBoardNumber, laptopItem.id, "numbers2", laptops.toString())
            form.update(itemsBoardNumber, laptopItem.id, "numbers5", laptopsTrash.toString())
            if (+laptopItem.countQuantity <= laptops + laptopsTrash)
              done++;

          }
        }
        if (done === 2) {
          form.update(deliveriesBoardNumber, +self.originId, countStatusColumnInMonday, JSON.stringify({ index: 1 }));
        }

      });
    }
  }
})
export class Computer extends IdEntity {
  @Fields.string({
    caption: 'ברקוד מחשב',
    validate: [
      Validators.required,
      Validators.uniqueOnBackend,
      (_, f) => {
        f.value = f.value.trim()
        if (!f.value.startsWith('M') && !f.value.startsWith('W'))
          throw Error('צריך להתחיל בM או W')
        if (f.value.length != 7) throw Error('צריך להיות בן 7 תוים בדיוק')
      },
    ],
  })
  barcode = ''
  @Fields.string<Computer>({
    caption: 'ברקוד אריזה',
    validate: async (c, ref) => {
      if (ref.value) {
        ref.value = ref.value.trim()
        if (!ref.value.startsWith('A')) throw Error(' צריך להתחיל בA')
        if (ref.value.length < 5 || ref.value.length > 6)
          throw Error(' יכול להיות בן 5 או 6 תוים בלבד')
      }
      if (c.status.updatePackageBarcode) {
        Validators.required(c, ref)
        c.packageBarcode = c.packageBarcode.trim()
        if (
          !ref.error &&
          (await remult.repo(Computer).count({
            $or: [
              {
                id: { '!=': c.id },
                packageBarcode: c.packageBarcode,
              },
              { barcode: c.packageBarcode },
            ],
          })) > 0
        ) {
          ref.error = ' כבר משוייך למחשב אחר!'
        }
      }
    },
  })
  packageBarcode = ''
  @Fields.string({
    caption: 'ברקוד משטח',
    validate: [
      (_, f) => {
        if (f.value) {
          f.value = f.value.trim()
          if (!f.value.startsWith('Z')) throw Error('צריך להתחיל בZ')
          if (f.value.length != 5) throw Error('צריך להיות בן 5 תוים בדיוק')
        }
      },
    ],
  })
  palletBarcode = ''
  @Field(() => ComputerStatus, {
    width: '170',
    validate: (_, ref) => {
      if (ref.value.special)
        throw Error("לא ניתן לבחור סטטוס " + ref.value.caption)
    }
  })
  status = ComputerStatus.intake

  @Field<Computer>(() => Employee, {
    validate: (c) => {
      if (!c.employee && (c.status.updateEmployee || c.status.validateEmployee))
        throw Validators.required.defaultMessage
    },
    allowNull: true,
    width: '170',
  })
  employee: Employee | null = null
  @Field<Computer>(() => CPUType, {
    validate: (c) => {
      if (!c.cpu && c.status.inputCpu) throw Validators.required.defaultMessage
    },
    width: '70',
  })
  cpu!: CPUType
  @DataControl({
    hideDataOnInput: true,
    getValue: (x, y) => y.displayValue,
  })
  @Fields.string<Computer>({
    caption: 'מקור תרומה',
    width: '170',
    clickWithUI: async (ui, _, fieldRef) => {
      ui.selectDonor({
        onSelect: (x) => {
          fieldRef.value = x.caption
          _.originId = x.id
        },
      })
    },
  })
  origin = ''
  @DataControl({
    readonly: true
  })
  @Fields.string()
  originId = '';
  @Fields.boolean({ caption: 'מחשב נייד' })
  isLaptop = false
  @DataControl({
    valueList: [
      'ACER',
      'ADATA',
      'ASUS',
      'APPLE ',
      'DELL',
      'FUJITSU',
      'HP',
      'HUAWEI',
      'LENOVO',
      'LG',
      'MSI',
      'SAMSUNG',
      'SONY',
      'TOSHIBA',
    ],
  })
  @Fields.string({ caption: 'יצרן', width: '170' })
  make = ''
  @Fields.string({ caption: 'דגם', width: '170' })
  model = ''
  @Fields.string({ caption: 'משנע', width: '170' })
  courier = ''
  @DataControl({
    hideDataOnInput: true,
    getValue: (x, y) => y.displayValue,
  })
  @Fields.string<Computer>({
    caption: 'שם המוטב',
    clickWithUI: async (ui, _, fieldRef) => {
      ui.selectValuesDialog({
        title: 'בחירת מוטב',
        values: await Computer.getRecipients(),
        onSelect: (x) => {
          fieldRef.value = x.caption
        },
      })
    },
    validate: (c) => {
      if (c.status.inputRecipient) {
        Validators.required(c, c.$.recipient)
      }
    },
    width: '170',
  })
  recipient = ''
  @Fields.date({
    caption: 'תאריך קליטה',
    allowApiUpdate: false,
    width: '300',
  })
  createDate = new Date()
  @Fields.date({
    caption: 'עדכון אחרון',
    allowApiUpdate: false,
    width: '300',
  })
  updateDate = new Date()

  @BackendMethod({ allowed: Allow.authenticated })
  static async getRecipients() {
    return await getListFromMonday(2478134523)
  }
  @BackendMethod({ allowed: Allow.authenticated })
  static async getDonors(forCount?: boolean) {
    const result = await gql(
      {},
      `#graphql
  query test2 {
      boards(ids: [${2673923561}]) {
        id
        name
        board_folder_id
        board_kind
        items {
          id
          name
          column_values{
            id
            title
            value
        }
        }
      }
    }
  `,
    );
    const f = new DeliveryFormController(remult);
    let r: Donor[] = (result.boards[0].items.map((x: any) => {
      const r: Partial<Donor> = {
        caption: x.name,
        id: x.id,
        signatureCounter: 0,
        forCount: true,
        forIntake: false
      }
      for (const val of x.column_values) {
        if (val.value) {
          let v = JSON.parse(val.value);
          switch (val.id) {
            case f.$.hospitalName.metadata.options.monday:
              r.hospital = v;
              break;
            case f.$.signatureCounter.metadata.options.monday:
              r.signatureCounter = +v || 0;
              break;
            case countStatusColumnInMonday:
              r.forCount = v.index == 5;
              r.forIntake = v.index == 0;
              break;
            case f.$.driverSign.metadata.options.monday:
              if (val.value) {
                let z: string = v.date;
                if (z) {
                  r.driverSignDate = z;
                }
              }
              break;
          }
        }

      }
      return r as Donor;
    }))
    if (forCount)
      r = r.filter(x => x.signatureCounter > 0 && x.forCount)
    else
      r = r.filter(x => x.forIntake);

    r.sort((a, b) => {
      const r = a.caption.localeCompare(b.caption);
      if (r != 0)
        return r;
      return (b.driverSignDate || "").localeCompare(a.driverSignDate || "")
    });
    return r;

  }

  @BackendMethod({ allowed: Allow.authenticated })
  static async getDashboard() {
    const statuses: {
      id: string
      caption: string
      count: number
    }[] = []

    let list = getValueList(ComputerStatus)
    if (remult.isAllowed([Roles.admin, Roles.stockAdmin])) {
    } else if (remult.isAllowed(Roles.upgradeAdmin))
      list = [
        ComputerStatus.waitingForUpgrade,
        ComputerStatus.assigned,
        ComputerStatus.trash,
        ComputerStatus.successfulUpgrade,
      ]
    else if (remult.isAllowed(Roles.packAdmin))
      list = [
        ComputerStatus.waitForPack,
        ComputerStatus.packing,
        ComputerStatus.packDone,
      ]

    for (const status of list) {
      statuses.push({
        id: status.id,
        caption: status.caption,
        count: 0,
      })
    }
    for await (const c of remult.repo(Computer).query()) {
      const s = statuses.find((x) => x.id === c.status.id)
      if (s) {
        s.count++
      }
    }
    return statuses
  }
  @BackendMethod({ allowed: Allow.authenticated })
  static async getStatusChanges(
    status: ComputerStatus,
    employeeId?: string,
  ): Promise<StatusDate[]> {
    let d = new Date()
    const compRepo = remult.repo(Computer)
    const arr: StatusDate[] = []
    let lastDate: StatusDate | undefined
    d.setDate(d.getDate() - 7)

    for await (let change of remult.repo(ChangeLog).query({
      where: {
        changeDate: { '>=': d },
      },
    })) {
      if (
        change.changes.find(
          (c) =>
            c.key === compRepo.metadata.fields.status.key &&
            c.newValue === status.id,
        )
      ) {
        const comp = await compRepo.findId(change.relatedId)
        if (!comp) continue
        if (status.statusTableCurrentStatusOnly && comp.status != status)
          continue
        if (
          status.statusTableCurrentEmployeeOnly &&
          comp.employee?.id != employeeId
        )
          continue
        if (
          !lastDate ||
          lastDate.date.toDateString() != change.changeDate.toDateString()
        ) {
          lastDate = {
            date: change.changeDate,
            presentDate: toDisplayDate(change.changeDate),
            computers: [],
            byOrigin: [],
          }
          arr.push(lastDate)
        }
        let item: { [key: string]: string } = {}
        for (const field of status.listFields) {
          item[field] = comp.$.find(field).displayValue
        }
        lastDate.computers.push(item)
        {
          let orig = lastDate.byOrigin.find((x) => {
            for (const field of status.groupBy) {
              if (x.keys[field] !== comp.$.find(field).displayValue)
                return false
            }
            return true
          })

          if (!orig) {
            let item: any = { quantity: 1, keys: {} }
            for (const field of status.groupBy) {
              item.keys[field] = comp.$.find(field).displayValue
            }
            lastDate.byOrigin.push(item)
          } else {
            orig.quantity++
          }
        }
      }
    }
    return arr
  }
}

export interface StatusDate {
  date: Date
  presentDate: string
  computers: { [key: string]: string }[]
  byOrigin: { quantity: number; keys: { [key: string]: string } }[]
}

async function getListFromMonday(board: number) {
  const result = await gql(
    {},
    `#graphql
query test2 {
    boards(ids: [${board}]) {
      id
      name
      board_folder_id
      board_kind
      items {
        id
        name
      }
    }
  }
`,
  )
  let out: { caption: string }[] = result.boards[0].items.map((x: any) => ({
    caption: x.name,
  }))
  out.sort((a, b) => a.caption.localeCompare(b.caption))
  return out
}

function toDisplayDate(d: Date) {
  let result = ''
  switch (d.getDay()) {
    case 0:
      result = 'ראשון'
      break
    case 1:
      result = 'שני'
      break
    case 2:
      result = 'שלישי'
      break
    case 3:
      result = 'רביעי'
      break
    case 4:
      result = 'חמישי'
      break
    case 5:
      result = 'שישי'
      break
    case 6:
      result = 'שבת'
      break
    default:
      result = 'יום לא ידוע'

      break
  }

  result +=
    ' ' +
    new Intl.DateTimeFormat('he-il', {
      month: '2-digit',
      day: '2-digit',
    }).format(d)
  return result
}
export interface Donor {
  id: string,
  caption: string,
  hospital: string,
  driverSignDate: string
  signatureCounter: number
  forCount: boolean
  forIntake: boolean
}