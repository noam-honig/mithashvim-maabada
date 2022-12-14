import { FieldRef } from "remult";
import type { Donor } from "../computers/computer";

export interface UITools {
  selectValuesDialog<T extends {
    caption?: string;
  }>(args: {
    values: T[];
    onSelect: (selected: T) => void;
    title?: string;
  }): Promise<void>;
  selectDonor(args: SelectDonorArgs): Promise<void>;
  yesNoQuestion: (question: string) => Promise<boolean>;
  info: (info: string) => void;
  error: (err: any) => void;
}
export interface SelectDonorArgs {
  onSelect: (selected: Donor) => void;
  forCount?: boolean

}


export interface customInputOptions {
  textarea(): void
}

declare module 'remult' {
  // Adding options to the remult's Field Options interface 
  export interface FieldOptions<entityType, valueType> {
    clickWithUI?: (ui: UITools, entity: entityType, fieldRef: FieldRef<valueType>) => void;
    customInput?: (inputOptions: customInputOptions) => void;
    width?: string;
  }
}
