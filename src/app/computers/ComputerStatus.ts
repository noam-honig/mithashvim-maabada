import { remult, ValueListFieldType, Remult } from 'remult'
import { Roles } from '../users/roles'
import type { Computer } from './computer'

@ValueListFieldType({ caption: 'סטטוס' })
export class ComputerStatus {
  static intake = new ComputerStatus('התקבל - מחשב נייח', [Roles.stockAdmin], {
    isIntake: true,
    groupBy: ['origin', 'palletBarcode'],
    inputPallet: true,
  })
  static intakeTrash = new ComputerStatus(
    'התקבל וממתין לגריטה - מחשב נייח',
    [Roles.stockAdmin],
    {
      isIntake: true,
      groupBy: ['origin', 'palletBarcode'],
    },
  )
  static intakeLaptop = new ComputerStatus('התקבל - מחשב נייד💻', [Roles.stockAdmin], {
    isIntake: true,
    laptopIntake:true,
    groupBy: ['origin', 'palletBarcode'],
    inputPallet: true,
  })
  static intakeTrashLaptop = new ComputerStatus(
    'התקבל וממתין לגריטה - מחשב נייד💻',
    [Roles.stockAdmin],
    {
      laptopIntake:true,
      isIntake: true,
      groupBy: ['origin', 'palletBarcode'],
    },
  )
  static waitingForUpgrade = new ComputerStatus(
    'ממתין לשדרוג',
    [Roles.stockAdmin],
    {
      groupBy: ['origin', 'palletBarcode'],
      canUpdateCompletePallet: true,
    },
  )
  static assigned = new ComputerStatus('שוייך לעובד', [Roles.upgradeAdmin], {
    updateEmployee: true,
    inputCpu: true,
    groupBy: ['employee'],
    listFields: ['barcode', 'employee'],
    statusTableCurrentStatusOnly: true,
    statusTableCurrentEmployeeOnly: true,
  })
  static trash = new ComputerStatus('ממתין לגריטה', [Roles.upgradeAdmin], {
    groupBy: ['employee'],
    listFields: ['barcode'],
    clearPallet: true,
  })
  static successfulUpgrade = new ComputerStatus(
    'שודרג בהצלחה',
    [Roles.upgradeAdmin],
    {
      groupBy: ['employee'],
      listFields: ['barcode', 'employee'],
      assignPallet: true,
    },
  )
  static waitForPack = new ComputerStatus('ממתין לאריזה', [Roles.stockAdmin], {
    groupBy: ['employee'],
    listFields: ['barcode', 'employee'],
    statusTableCurrentStatusOnly: true,
    canUpdateCompletePallet: true,
  })
  static packing = new ComputerStatus('תהליך אריזה', [Roles.packAdmin], {
    updatePackageBarcode: true,
    groupBy: ['palletBarcode'],
    listFields: ['barcode', 'packageBarcode', 'palletBarcode'],
    statusTableCurrentStatusOnly: true,
    assignPallet: true,
  })
  static packDone = new ComputerStatus('נארז בהצלחה', [Roles.stockAdmin], {
    inputPackageBarcode: true,
    groupBy: ['palletBarcode'],
    listFields: ['packageBarcode', 'palletBarcode'],
    statusTableCurrentStatusOnly: true,
    canUpdateCompletePallet: true,
  })
  static waitForArchive = new ComputerStatus(
    'ממתין לשינוע לארכיברים',
    [Roles.stockAdmin],
    {
      inputPackageBarcode: true,
      listFields: ['packageBarcode'],
      statusTableCurrentStatusOnly: true,
      canUpdateCompletePallet: true,
    },
  )
  static waitForDelivery = new ComputerStatus(
    'ממתין לשינוע למוטב',
    [Roles.stockAdmin],
    {
      inputPackageBarcode: true,
      inputRecipient: true,
      groupBy: ['recipient', 'palletBarcode'],
      canUpdateCompletePallet: true,
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
  laptopIntake = false
  updatePackageBarcode = false
  statusTableCurrentStatusOnly = false
  statusTableCurrentEmployeeOnly = false
  inputPallet = false
  assignPallet = false
  clearPallet = false
  canUpdateCompletePallet = false
  groupBy: (keyof Computer)[] = []
  listFields: (keyof Computer)[] = []
  get showStatusTables() {
    return this.listFields.length > 0 || this.groupBy.length > 0
  }
  inputPackageBarcode = false
  inputRecipient = false
}
