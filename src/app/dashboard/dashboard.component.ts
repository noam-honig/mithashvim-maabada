import { Component, OnInit } from '@angular/core'
import { refreshList } from '../auto-refresh-list/auto-refresh-list.component'
import { Computer, StatusInDashboard } from '../computers/computer'
import { DataRefreshService } from '../data-refresh/data-refresh.service'
import { ComputerStatus } from '../computers/ComputerStatus'
import { RowButton } from '../common-ui-elements/interfaces'
import { UITools } from '../common/UITools'
import { UIToolsService } from '../common/UIToolsService'
import { BehaviorSubject, Observable } from 'rxjs'
import { remult } from 'remult'
import { Roles } from '../users/roles'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  constructor(private data: DataRefreshService, private ui: UIToolsService) {}

  statuses = this.data.observe(() => Computer.getDashboard())
  detailsLink(item: { id: string }) {
    return '/' + refreshList + '/' + item.id
  }
  isAdmin() {
    return remult.isAllowed(Roles.admin)
  }
  buttons: RowButton<StatusInDashboard>[] = [
    {
      name: 'עדכן לסטטוס לא ידוע',
      click: async (status) => {
        if (
          await this.ui.yesNoQuestion(
            `האם לעדכן ${status.count} מחשבים לסטטוס לא ידוע?`,
          )
        ) {
          Computer.updateToStatusUnknown(status.id)
        }
      },
    },
  ]

  ngOnInit(): void {}
}

type MyMappedType<T> = {
  [P in keyof T]: T[P] extends Array<infer U> ? U : T[P]
}
