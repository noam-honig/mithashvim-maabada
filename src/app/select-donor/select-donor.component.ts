import { Component, OnInit } from '@angular/core'
import { MatDialogRef } from '@angular/material/dialog'
import { Field, Fields } from 'remult'
import { SelectDonorArgs } from '../common/UITools'
import { Computer, Donor } from '../computers/computer'

@Component({
  selector: 'app-select-donor',
  templateUrl: './select-donor.component.html',
  styleUrls: ['./select-donor.component.scss'],
})
export class SelectDonorComponent implements OnInit {
  constructor(private dialog: MatDialogRef<any>) {}

  ngOnInit(): void {
    Computer.getDonors({
      forCount: this.args.forCount,
      filter: this.args.filter,
    }).then(
      (x) =>
        (this.values = [
          ...x,
          {
            id: 'ללא',
            caption: 'ללא',
            driverSignDate: '',
            forCount: false,
            forIntake: false,
            hospital: '',
            signatureCounter: 0,
          },
        ]),
    )
  }
  searchString = ''
  selectFirst() {
    for (const o of this.values) {
      if (this.matchesFilter(o)) {
        this.select(o)
        return
      }
    }
  }
  matchesFilter(o: Donor) {
    return o
      .caption!.toLocaleLowerCase()
      .includes(this.searchString.toLocaleLowerCase())
  }

  /*internal*/
  values!: Donor[]

  /*internal*/
  args!: SelectDonorArgs

  select(x: Donor) {
    this.args.onSelect(x)
    this.dialog.close()
  }
}
