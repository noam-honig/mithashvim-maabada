import { Component, OnInit } from '@angular/core'
import { refreshList } from '../auto-refresh-list/auto-refresh-list.component'
import { Computer } from '../computers/computer'
import { DataRefreshService } from '../data-refresh/data-refresh.service'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  constructor(private data: DataRefreshService) {}

  statuses = this.data.observe(() => Computer.getDashboard())
  detailsLink(item: { id: string }) {
    return '/' + refreshList + '/' + item.id
  }

  ngOnInit(): void {}
}
