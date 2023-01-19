import { FieldType, ValueListFieldType } from "remult";

@ValueListFieldType({ caption: 'מקלדת', displayValue: (_, val) => val ? val.caption : '' })
export class KeyboardType {

  static hebrew = new KeyboardType("עברית/אנגלית")
  static arabic = new KeyboardType("ערבית/עברית/אנגלית")
  id!: string;
  constructor(public caption: string) { }
}