import { remult, ValueListFieldType, Remult } from 'remult'
import { Roles } from '../users/roles'
import { Computer, updateInventory } from './computer'

@ValueListFieldType({ caption: 'סטטוס' })
export class ComputerStatus {
  static count = new ComputerStatus('ספירת ציוד מתרומה', [Roles.stockAdmin], {
    special: true
  })
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
    laptopIntake: true,
    groupBy: ['origin', 'palletBarcode'],
    inputPallet: true,
  })
  static intakeTrashLaptop = new ComputerStatus(
    'התקבל וממתין לגריטה - מחשב נייד💻',
    [Roles.stockAdmin],
    {
      laptopIntake: true,
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
      validateEmployee: true,
      statusWasChanged: async c => {
        updateInventory(c.id, [`סה"כ דיסקים`])
      }
    },
  )
  static waitForPack = new ComputerStatus('ממתין לאריזה', [Roles.stockAdmin], {
    groupBy: ['employee'],
    listFields: ['barcode', 'employee'],
    statusTableCurrentStatusOnly: true,
    canUpdateCompletePallet: true,
  })
  static packing = new ComputerStatus('תהליך אריזה', [Roles.packAdmin], {
    inputKeyboard: true,
    updatePackageBarcode: true,
    groupBy: ['palletBarcode'],
    listFields: ['barcode', 'packageBarcode', 'palletBarcode'],
    statusTableCurrentStatusOnly: true,
    assignPallet: true,
    statusWasChanged: async c => {
      if (!c.isLaptop) {
        await updateInventory(c.id, [c.keyboard.stockItemName, "אוזניות", "מצלמות", "דונגלים", "סט כבלים משולב", "אריזות קרטון"])
      }
    }
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
      reducePalletStock: true,
      inputPackageBarcode: true,
      listFields: ['packageBarcode'],
      statusTableCurrentStatusOnly: true,
      canUpdateCompletePallet: true,
    },
  )
  static waitKfarSaba = new ComputerStatus(
    'ממתין לשינוע למעבדת כפר סבא',
    [Roles.stockAdmin],
    {
      reducePalletStock: true,
      inputPackageBarcode: true,
      listFields: ['packageBarcode'],
      statusTableCurrentStatusOnly: true,
      canUpdateCompletePallet: true,
    },
  )
  static waitCentury = new ComputerStatus(
    'ממתין לשינוע למחסני סנטורי',
    [Roles.stockAdmin],
    {
      reducePalletStock: true,
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
      reducePalletStock: true,
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
  validateEmployee = false
  inputCpu = false
  inputKeyboard = false
  isIntake = false
  laptopIntake = false
  updatePackageBarcode = false
  statusTableCurrentStatusOnly = false
  statusTableCurrentEmployeeOnly = false
  inputPallet = false
  assignPallet = false
  clearPallet = false
  canUpdateCompletePallet = false
  special = false
  statusWasChanged = async (c: Computer) => { }
  reducePalletStock = false;

  groupBy: (keyof Computer)[] = []
  listFields: (keyof Computer)[] = []
  get showStatusTables() {
    return this.listFields.length > 0 || this.groupBy.length > 0
  }
  inputPackageBarcode = false
  inputRecipient = false
}
