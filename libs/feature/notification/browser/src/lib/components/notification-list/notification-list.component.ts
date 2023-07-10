import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Injector,
  Input,
  OnChanges,
  Optional,
  Output,
} from '@angular/core'

import { NzAvatarModule } from 'ng-zorro-antd/avatar'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzEmptyModule } from 'ng-zorro-antd/empty'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzListModule } from 'ng-zorro-antd/list'

import { Notification } from '@platon/feature/notification/common'
import { NotificationService } from '../../api/notification.service'
import {
  NOTIFICATION,
  NotificationParser,
  NotificationRenderer,
  NOTIFICATION_PARSER,
} from '../../models/notification-parser'
import { NgeUiIconModule } from '@cisstech/nge/ui/icon'
import { RendererTypePipe } from '../../pipes/renderer-type.pipe'

interface Item {
  renderer?: NotificationRenderer
  injector: Injector
  notification: Notification
}

@Component({
  standalone: true,
  selector: 'notif-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,

    NzIconModule,
    NzListModule,
    NzEmptyModule,
    NzAvatarModule,
    NzButtonModule,

    NgeUiIconModule,

    RendererTypePipe,
  ],
})
export class NotificationListComponent implements OnChanges {
  @Input() notifications: Notification[] = []
  @Output() notificationsChange = new EventEmitter()

  protected items: Item[] = []

  constructor(
    @Optional()
    @Inject(NOTIFICATION_PARSER)
    private readonly parsers: NotificationParser[],
    private readonly injector: Injector,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly notificationSerivce: NotificationService
  ) {}

  ngOnChanges(): void {
    this.items = this.notifications.map((notification) => {
      return {
        renderer: this.parsers
          ?.find((parser) => parser.support(notification))
          ?.renderer(notification),
        notification,
        injector: Injector.create({
          parent: this.injector,
          providers: [
            {
              provide: NOTIFICATION,
              useValue: notification,
            },
          ],
        }),
      } as Item
    })
  }

  protected delete(notification: Notification): void {
    this.notificationSerivce.deleteNotification(notification.id).subscribe(() => {
      this.notifications = this.notifications.filter((item) => item.id !== notification.id)
      this.notificationsChange.emit(this.notifications)
      this.changeDetectorRef.markForCheck()
    })
  }

  protected markAsRead(notification: Notification): void {
    this.notificationSerivce.markAsRead(notification.id).subscribe(() => {
      this.notifications = this.notifications.map((item) => {
        if (item.id === notification.id) {
          return { ...item, readAt: new Date() }
        }
        return item
      })
      this.notificationsChange.emit(this.notifications)
      this.changeDetectorRef.markForCheck()
    })
  }

  protected trackItemById(_: number, item: Item) {
    return item.notification.id
  }
}
