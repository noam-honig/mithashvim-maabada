import {
  Allow,
  Entity,
  Field,
  Fields,
  IdEntity,
  remult,
  Validators,
  ValueListFieldType,
  BackendMethod,
  Remult,
  getValueList,
} from 'remult'
import { recordChanges, ChangeLog } from '../change-log/change-log'
import { DataControl } from '../common-ui-elements/interfaces'
import '../common/UITools'
import { dataWasChanged } from '../data-refresh/data-refresh.controller'
import { gql } from '../driver-sign/getGraphQL'
import { Employee } from '../employees/employee'
import { Roles } from '../users/roles'

@ValueListFieldType({ caption: 'סטטוס' })
export class ComputerStatus {
  static intake = new ComputerStatus('התקבל', [Roles.stockAdmin], {
    isIntake: true,
  })
  static intakeTrash = new ComputerStatus(
    'התקבל וממתין לגריטה',
    [Roles.stockAdmin],
    { isIntake: true },
  )
  static waitingForUpgrade = new ComputerStatus('ממתין לשדרוג', [
    Roles.stockAdmin,
  ])
  static assigned = new ComputerStatus('שוייך לעובד', [Roles.upgradeAdmin], {
    updateEmployee: true,
    inputCpu: true,
  })
  static trash = new ComputerStatus('ממתין לגריטה', [Roles.upgradeAdmin], {
    showStatusHistory: true,
  })
  static successfulUpgrade = new ComputerStatus(
    'שודרג בהצלחה',
    [Roles.upgradeAdmin],
    {
      showStatusHistory: true,
    },
  )
  static waitForPack = new ComputerStatus('ממתין לאריזה', [Roles.stockAdmin])
  static packing = new ComputerStatus('תהליך אריזה', [Roles.packAdmin], {
    updatePackageBarcode: true,
  })
  static packDone = new ComputerStatus('נארז בהצלחה', [Roles.stockAdmin], {
    inputPackageBarcode: true,
  })
  static waitForArchive = new ComputerStatus(
    'ממתין לשינוע לארכיברים',
    [Roles.stockAdmin],
    {
      inputPackageBarcode: true,
    },
  )
  static waitForDelivery = new ComputerStatus(
    'ממתין לשינוע למוטב',
    [Roles.stockAdmin],
    {
      inputPackageBarcode: true,
      inputRecipient: true,
    },
  )

  constructor(
    public caption: string,
    public allowedRoles: string[],
    values?: Partial<ComputerStatus>,
  ) {
    Object.assign(this, values)
  }
  allowed(remultForStatusCheck?: Remult) {
    return (remultForStatusCheck || remult).isAllowed(this.allowedRoles)
  }

  id!: string

  updateEmployee = false
  inputCpu = false
  isIntake = false
  updatePackageBarcode = false
  showStatusHistory = false
  inputPackageBarcode = false
  inputRecipient = false
}
@ValueListFieldType<CPUType>({
  caption: 'מעבד',
  displayValue: (_, x) => x?.caption!,
})
export class CPUType {
  static i3 = new CPUType()
  static i5 = new CPUType()
  static i7 = new CPUType()
  static pentium = new CPUType('פנטיום')
  constructor(public caption?: string) {}
}

@Entity<Computer>('computers', {
  allowApiCrud: Allow.authenticated,
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
})
export class Computer extends IdEntity {
  @Fields.string({
    caption: 'ברקוד מחשב',
    validate: [Validators.required, Validators.uniqueOnBackend],
  })
  barcode = ''
  @Fields.string<Computer>(
    {
      caption: 'ברקוד אריזה',
    },
    (options, remult) =>
      (options.validate = async (c, ref) => {
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
      }),
  )
  packageBarcode = ''
  @Field(() => ComputerStatus, {
    width: '170',
  })
  status = ComputerStatus.intake

  @Field<Computer>(() => Employee, {
    validate: (c) => {
      if (!c.employee && c.status.updateEmployee)
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
  @Fields.string({
    caption: 'מקור תרומה',
    width: '170',
    clickWithUI: async (ui, _, fieldRef) => {
      ui.selectValuesDialog({
        title: 'בחירת מקור תרומה',
        values: await Computer.getDonors(),
        onSelect: (x) => {
          fieldRef.value = x.caption
        },
      })
    },
  })
  origin = ''
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
  static async getDonors() {
    return await getListFromMonday(2673923561)
  }

  @BackendMethod({ allowed: Allow.authenticated })
  static async getNewComputers(trash: boolean): Promise<NewComputersDate[]> {
    const compRepo = remult.repo(Computer)
    const arr: NewComputersDate[] = []
    let lastDate: NewComputersDate | undefined
    const trashStatuses = [ComputerStatus.trash, ComputerStatus.intakeTrash]

    for await (let c of compRepo.query({
      orderBy: { createDate: 'desc' },
      where: {
        status: trash ? trashStatuses : { '!=': trashStatuses },
      },
    })) {
      if (
        !lastDate ||
        lastDate.date.toDateString() != c.createDate.toDateString()
      ) {
        lastDate = {
          date: c.createDate,
          presentDate: toDisplayDate(c.createDate),
          computers: [],
        }
        arr.push(lastDate)
      }
      let orig = lastDate.computers.find(
        (x) => x.origin.trim() === c.origin.trim(),
      )

      if (!orig) {
        lastDate.computers.push({
          origin: c.origin,
          quantity: 1,
        })
      } else {
        orig.quantity++
      }
    }
    return arr
  }

  @BackendMethod({ allowed: Allow.authenticated })
  static async getDashboard() {
    const statuses: {
      id: string
      caption: string
      count: number
    }[] = []
    for (const status of getValueList(ComputerStatus)) {
      if (status.allowed() || remult.isAllowed(Roles.stockAdmin)) {
        statuses.push({
          id: status.id,
          caption: status.caption,
          count: 0,
        })
      }
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
  static async getStatusChanges(status: ComputerStatus): Promise<StatusDate[]> {
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
        if (
          !lastDate ||
          lastDate.date.toDateString() != change.changeDate.toDateString()
        ) {
          lastDate = {
            date: change.changeDate,
            presentDate: toDisplayDate(change.changeDate),
            computers: [],
          }
          arr.push(lastDate)
        }
        let orig = lastDate.computers.find((x) => x.barcode === comp.barcode)
        if (!orig) {
          lastDate.computers.push({
            barcode: comp.barcode,
            employee: comp.employee?.name!,
          })
        }
      }
    }
    return arr
  }
}

export interface NewComputersDate {
  date: Date
  presentDate: string
  computers: { origin: string; quantity: number }[]
}

export interface StatusDate {
  date: Date
  presentDate: string
  computers: { barcode: string; employee: string }[]
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
