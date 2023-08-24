import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { RouterModule } from '@angular/router'

import { MatCardModule } from '@angular/material/card'

import { NotificationListComponent, NotificationService } from '@platon/feature/notification/browser'
import { Notification } from '@platon/feature/notification/common'
import { NzBadgeModule } from 'ng-zorro-antd/badge'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzCalendarModule } from 'ng-zorro-antd/calendar'
import { NzEmptyModule } from 'ng-zorro-antd/empty'
import { NzGridModule } from 'ng-zorro-antd/grid'
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
    this.notifications = await firstValueFrom(this.notificationService.listUnreads())
    this.changeDetectorRef.markForCheck()
  }
}
