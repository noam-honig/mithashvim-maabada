import { ValueListFieldType } from 'remult';


@ValueListFieldType<CPUType>({
  caption: 'מעבד',
  displayValue: (_, x) => x?.caption!,
})
export class CPUType {
  static i3 = new CPUType();
  static i5 = new CPUType();
  static i7 = new CPUType();
  static pentium = new CPUType('פנטיום');
  constructor(public caption?: string) { }
}
