import { DataControl } from "@remult/angular/interfaces";
import { Entity, Field, Fields, IdEntity, Validators, ValueListFieldType } from "remult";
import { recordChanges } from "../change-log/change-log";
import { Employee } from "../employees/employee";
import { ComputersComponent } from "./computers.component";


@ValueListFieldType({ caption: 'סטטוס' })
export class ComputerStatus {
    static intake = new ComputerStatus("התקבל", { isIntake: true });
    static intakeTrash = new ComputerStatus("התקבל וממתין לגריטה", { isIntake: true });
    static waitingForUpgrade = new ComputerStatus("ממתין לשדרוג");
    static assigned = new ComputerStatus('שוייך לעובד', { updateEmployee: true, inputCpu: true });
    static trash = new ComputerStatus("ממתין לגריטה");
    static successfulUpgrade = new ComputerStatus("שודרג בהצלחה")
    static waitForPack = new ComputerStatus("ממתין לאריזה");
    static packing = new ComputerStatus("תהליך אריזה", {
        updatePackageBarcode: true
    });
    static packDone = new ComputerStatus("נארז בהצלחה", {
        inputPackageBarcode: true
    });
    static waitForArchive = new ComputerStatus("ממתין לשינוע לארכיברים", {
        inputPackageBarcode: true
    });
    static waitForDelivery = new ComputerStatus("ממתין לשינוע למוטב", {
        inputPackageBarcode: true,
        inputRecipient: true
    });


    constructor(public caption: string, values?: Partial<ComputerStatus>) {
        Object.assign(this, values);
    }
    updateEmployee = false;
    inputCpu = false;
    isIntake = false;
    updatePackageBarcode = false;
    inputPackageBarcode = false;
    inputRecipient = false;
}
@ValueListFieldType<any, CPUType>({ caption: 'מעבד', displayValue: (_, x) => x?.caption! })
export class CPUType {
    static i3 = new CPUType();
    static i5 = new CPUType();
    static i7 = new CPUType();
    static pentium = new CPUType('פנטיום');
    constructor(public caption?: string) {

    }

}

@Entity<Computer>("computers", {
    allowApiCrud: true,
    defaultOrderBy: {
        createDate: "desc"
    }

}, (options, remult) => {
    options.saving = async (self) => {
        self.updateDate = new Date();
        await recordChanges(remult, self);
    }
})
export class Computer extends IdEntity {

    @Fields.string({ caption: 'ברקוד מחשב', validate: [Validators.required, Validators.uniqueOnBackend] })
    barcode = '';
    @Fields.string<Computer>({
        caption: 'ברקוד אריזה'
    },
        (options, remult) => options.
            validate = async (c, ref) => {
                if (c.status.updatePackageBarcode) {
                    Validators.required(c, ref);
                    c.packageBarcode = c.packageBarcode.trim();
                    if (!ref.error && await remult.repo(Computer).count({
                        $or: [
                            {
                                id: { "!=": c.id },
                                packageBarcode: c.packageBarcode
                            },
                            { barcode: c.packageBarcode }
                        ]
                    }) > 0) {
                        ref.error = " כבר משוייך למחשב אחר!";
                    }
                }
            }
    )
    packageBarcode = '';
    @Field(() => ComputerStatus)
    @DataControl({ width: '170' })
    status = ComputerStatus.intake;

    @Field<Computer>(() => Employee, {
        validate: c => {
            if (!c.employee && c.status.updateEmployee)
                throw Validators.required.defaultMessage
        },
        allowNull: true
    })
    @DataControl({ width: '170' })
    employee: Employee | null = null;
    @Field<Computer>(() => CPUType, {
        validate: c => {
            if (!c.cpu && c.status.inputCpu)
                throw Validators.required.defaultMessage
        }
    })
    @DataControl({ width: '70' })
    cpu!: CPUType;
    @Fields.string({ caption: 'מקור תרומה' })
    @DataControl({ width: '170' })
    origin = '';
    @Fields.string({ caption: 'משנע' })
    @DataControl({ width: '170' })
    courier = '';
    @Fields.string<Computer>({
        caption: 'שם המוטב',
        validate: c => {
            if (c.status.inputRecipient) {
                Validators.required(c, c.$.recipient);
            }
        }
    })
    @DataControl({ width: '170' })
    recipient = '';
    @Fields.date({ caption: 'תאריך קליטה', allowApiUpdate: false })
    @DataControl({ width: '300' })
    createDate = new Date();
    @Fields.date({ caption: 'עדכון אחרון', allowApiUpdate: false })
    @DataControl({ width: '300' })
    updateDate = new Date();

}


