
import { Entity, Field, Fields, FieldType, IdEntity, remult, Validators } from "remult";
import { DataControl, getEntityValueList } from "../common-ui-elements/interfaces";

@Entity("employees", { allowApiCrud: true })
@FieldType<Employee>({ caption: 'עובד', displayValue: (_, e) => e?.name })
@DataControl<any, Employee>({
    valueList: async () => getEntityValueList(remult.repo(Employee)),

})
export class Employee extends IdEntity {
    @Fields.string({ caption: 'שם', validate: Validators.required })
    name = '';
}