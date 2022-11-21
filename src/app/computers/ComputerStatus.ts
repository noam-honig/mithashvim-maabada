import { remult, ValueListFieldType, Remult } from 'remult'
import { Roles } from '../users/roles'

@ValueListFieldType({ caption: 'סטטוס' })
export class ComputerStatus {
  static intake = new ComputerStatus('התקבל', [Roles.stockAdmin], {
    isIntake: true,
    statusTableByOrigin: true,
    inputPallet: true,
  })
  static intakeTrash = new ComputerStatus(
    'התקבל וממתין לגריטה',
    [Roles.stockAdmin],
    {
      isIntake: true,
      statusTableByOrigin: true,
    },
  )
  static waitingForUpgrade = new ComputerStatus(
    'ממתין לשדרוג',
    [Roles.stockAdmin],
    {
      statusTableByOrigin: true,
      canUpdateCompletePallet: true,
    },
  )
  static assigned = new ComputerStatus('שוייך לעובד', [Roles.upgradeAdmin], {
    updateEmployee: true,
    inputCpu: true,
    statusTableByEmployee: true,
    statusTableCurrentStatusOnly: true,
    statusTableCurrentEmployeeOnly: true,
  })
  static trash = new ComputerStatus('ממתין לגריטה', [Roles.upgradeAdmin], {
    statusTableByEmployee: true,
    clearPallet: true,
  })
  static successfulUpgrade = new ComputerStatus(
    'שודרג בהצלחה',
    [Roles.upgradeAdmin],
    {
      statusTableByEmployee: true,
      assignPallet: true,
    },
  )
  static waitForPack = new ComputerStatus('ממתין לאריזה', [Roles.stockAdmin], {
    statusTableByEmployee: true,
    statusTableCurrentStatusOnly: true,
    canUpdateCompletePallet: true,
  })
  static packing = new ComputerStatus('תהליך אריזה', [Roles.packAdmin], {
    updatePackageBarcode: true,
    statusTableByEmployee: true,
    statusTableCurrentStatusOnly: true,
    assignPallet: true,
  })
  static packDone = new ComputerStatus('נארז בהצלחה', [Roles.stockAdmin], {
    inputPackageBarcode: true,
    statusTableByEmployee: true,
    statusTableCurrentStatusOnly: true,
    canUpdateCompletePallet: true,
  })
  static waitForArchive = new ComputerStatus(
    'ממתין לשינוע לארכיברים',
    [Roles.stockAdmin],
    {
      inputPackageBarcode: true,
      statusTableByEmployee: true,
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
      statusTableByOrigin: true,
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
  updatePackageBarcode = false
  statusTableByOrigin = false
  statusTableByEmployee = false
  statusTableCurrentStatusOnly = false
  statusTableCurrentEmployeeOnly = false
  inputPallet = false
  assignPallet = false
  clearPallet = false
  canUpdateCompletePallet = false
  get showStatusTables() {
    return this.statusTableByEmployee || this.statusTableByOrigin
  }
  inputPackageBarcode = false
  inputRecipient = false
}
