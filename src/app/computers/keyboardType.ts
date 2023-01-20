import { FieldType, ValueListFieldType } from "remult";

@ValueListFieldType({ caption: 'מקלדת', displayValue: (_, val) => val ? val.caption : '' })
export class KeyboardType {

  static hebrew = new KeyboardType("עברית/אנגלית", "סט מקלדת עברית + עכבר")
  static arabic = new KeyboardType("ערבית/עברית/אנגלית", "מקלדות חוטי בלבד בערבית")
  id!: string;
  constructor(public caption: string, public stockItemName: string) { }
}