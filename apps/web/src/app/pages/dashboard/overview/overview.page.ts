import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { RouterModule } from '@angular/router'

import { MatCardModule } from '@angular/material/card'

import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzBadgeModule } from 'ng-zorro-antd/badge'
import { NzEmptyModule } from 'ng-zorro-antd/empty'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzCalendarModule } from 'ng-zorro-antd/calendar'
import {
  NotificationListComponent,
  NotificationService,
} from '@platon/feature/notification/browser'
import { Notification } from '@platon/feature/notification/common'
import { firstValueFrom } from 'rxjs'

@Component({
  standalone: true,
  selector: 'app-overview',
  templateUrl: './overview.page.html',
  styleUrls: ['./overview.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,

    MatCardModule,

    NzEmptyModule,
    NzGridModule,
    NzBadgeModule,
    NzButtonModule,
    NzCalendarModule,

    NotificationListComponent,
  ],
})
export class OverviewPage implements OnInit {
  protected notifications: Notification[] = []

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly notificationService: NotificationService
  ) {}

  async ngOnInit(): Promise<void> {
    const [notifications] = await Promise.all([
      firstValueFrom(this.notificationService.listUnreads()),
    ])
    this.notifications = notifications
    this.changeDetectorRef.markForCheck()
  }
}
