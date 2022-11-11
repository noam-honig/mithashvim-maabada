import { Component, OnInit } from '@angular/core'
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

  ngOnInit(): void {}
}
