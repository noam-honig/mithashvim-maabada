import { Component, OnInit } from '@angular/core'
import { UpdatePalletStatusController } from './update-pallet-status.controller'
import { DataAreaSettings } from '../common-ui-elements/interfaces'
import { remult } from 'remult'
import { Computer } from '../computers/computer'
import { UIToolsService } from '../common/UIToolsService'
import { ComputerStatus } from '../computers/ComputerStatus'

@Component({
  selector: 'app-update-pallet-status',
  templateUrl: './update-pallet-status.component.html',
  styleUrls: ['./update-pallet-status.component.scss'],
})
export class UpdatePalletStatusComponent implements OnInit {
  constructor(private ui: UIToolsService) {}
  cont = new UpdatePalletStatusController()
  area = new DataAreaSettings({
    fields: () => this.cont.$.toArray(),
  })
  async update() {
    const count = await this.cont.validate()
    if (
      await this.ui.yesNoQuestion(
        `אותרו ${count} מחשבים בסטטוס לא ידוע המשוייכים למשטח זה. האם לעדכן סטטוס עבור ${count} המחשבים ל-${this.cont.status.caption} ?`,
      )
    ) {
      await this.cont.update()
      this.ui.info('עודכן בהצלחה')
    }
  }

  ngOnInit(): void {}
}
