import { remult, ValueListFieldType, Remult } from 'remult';
import { Roles } from '../users/roles';


@ValueListFieldType({ caption: 'סטטוס' })
export class ComputerStatus {
  static intake = new ComputerStatus('התקבל',
    [Roles.stockAdmin], {
    isIntake: true,
    statusTableByOrigin: true
  });
  static intakeTrash = new ComputerStatus(
    'התקבל וממתין לגריטה',
    [Roles.stockAdmin],
    {
      isIntake: true,
      statusTableByOrigin: true
    }

  );
  static waitingForUpgrade = new ComputerStatus('ממתין לשדרוג', [
    Roles.stockAdmin
  ], {
    statusTableByOrigin: true
  });
  static assigned = new ComputerStatus('שוייך לעובד', [Roles.upgradeAdmin], {
    updateEmployee: true,
    inputCpu: true,
    statusTableByEmployee: true,
    statusTableCurrentStatusOnly: true
  });
  static trash = new ComputerStatus('ממתין לגריטה', [Roles.upgradeAdmin], {
    statusTableByEmployee: true,
  });
  static successfulUpgrade = new ComputerStatus(
    'שודרג בהצלחה',
    [Roles.upgradeAdmin],
    {
      statusTableByEmployee: true,
    }
  );
  static waitForPack = new ComputerStatus('ממתין לאריזה', [Roles.stockAdmin], {
    statusTableByEmployee: true,
    statusTableCurrentStatusOnly: true
  });
  static packing = new ComputerStatus('תהליך אריזה', [Roles.packAdmin], {
    updatePackageBarcode: true,
  });
  static packDone = new ComputerStatus('נארז בהצלחה', [Roles.stockAdmin], {
    inputPackageBarcode: true,
  });
  static waitForArchive = new ComputerStatus(
    'ממתין לשינוע לארכיברים',
    [Roles.stockAdmin],
    {
      inputPackageBarcode: true,
    }
  );
  static waitForDelivery = new ComputerStatus(
    'ממתין לשינוע למוטב',
    [Roles.stockAdmin],
    {
      inputPackageBarcode: true,
      inputRecipient: true,
    }
  );

  constructor(
    public caption: string,
    public allowedRoles: string[],
    values?: Partial<ComputerStatus>
  ) {
    Object.assign(this, values);
  }
  allowed(remultForStatusCheck?: Remult) {
    return (remultForStatusCheck || remult).isAllowed(this.allowedRoles);
  }

  id!: string;

  updateEmployee = false;
  inputCpu = false;
  isIntake = false;
  updatePackageBarcode = false;
  statusTableByOrigin = false;
  statusTableByEmployee = false;
  statusTableCurrentStatusOnly = false;
  get showStatusTables() {
    return this.statusTableByEmployee || this.statusTableByOrigin;
  }
  inputPackageBarcode = false;
  inputRecipient = false;
}
