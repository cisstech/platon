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

import { NgeUiIconModule } from '@cisstech/nge/ui/icon'
import { DialogModule } from '@platon/core/browser'
import { Notification } from '@platon/feature/notification/common'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { NotificationService } from '../../api/notification.service'
import {
  NOTIFICATION,
  NOTIFICATION_PARSER,
  NotificationAction,
  NotificationParser,
  NotificationRenderer,
} from '../../models/notification-parser'
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
    NzPopoverModule,
    NgeUiIconModule,

    DialogModule,

    RendererTypePipe,
  ],
})
export class NotificationListComponent implements OnChanges {
  @Input() notifications: Notification[] = []
  @Output() notificationsChange = new EventEmitter()
  @Output() closed = new EventEmitter()

  @Input() hasMore = false
  @Output() loadMore = new EventEmitter()

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
      const injector = Injector.create({
        parent: this.injector,
        providers: [
          {
            provide: NOTIFICATION,
            useValue: notification,
          },
        ],
      })
      return {
        injector,
        renderer: this.parsers?.find((parser) => parser.support(notification))?.renderer(notification, injector),
        notification,
      } as Item
    })
  }

  protected delete(notification: Notification): void {
    this.notificationSerivce.deleteNotification(notification.id).subscribe(() => {
      this.notifications = this.notifications.filter((item) => item.id !== notification.id)
      this.notificationsChange.emit(this.notifications)
      this.changeDetectorRef.detectChanges()
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

  protected async callAction(action: NotificationAction): Promise<void> {
    await action.onClick({
      onClose: () => this.closed.emit(),
      onDelete: (notification) => this.delete(notification),
    })
  }

  protected async callOnClick(item: Item): Promise<void> {
    if (item.renderer?.onClick) {
      await item.renderer.onClick({
        onClose: () => this.closed.emit(),
        onDelete: (notification) => this.delete(notification),
      })
    }
  }
}
