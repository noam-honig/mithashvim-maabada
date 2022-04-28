
import { DataControl, getEntityValueList } from "@remult/angular/interfaces";
import { Entity, Field, Fields, FieldType, IdEntity, Remult, Validators } from "remult";

@Entity("employees", { allowApiCrud: true })
@FieldType({ caption: 'עובד' })
@DataControl({
    valueList: async (remult: Remult) => getEntityValueList(remult.repo(Employee))
})
export class Employee extends IdEntity {
    @Fields.string({ caption: 'שם', validate: Validators.required })
    name = '';
}