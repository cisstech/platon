import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

import { Notification } from '@platon/feature/notification/common';
import { BehaviorSubject, firstValueFrom, Subscription } from 'rxjs';
import { NotificationService } from '../../api/notification.service';
import { NotificationListComponent } from '../notification-list/notification-list.component';


@Component({
  standalone: true,
  selector: 'notif-drawer',
  templateUrl: './notification-drawer.component.html',
  styleUrls: ['./notification-drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,

    NzEmptyModule,
    NzButtonModule,
    NzDrawerModule,
    NotificationListComponent
  ]
})
export class NotificationDrawerComponent implements OnInit, OnDestroy {
  private readonly counter = new BehaviorSubject(0);
  private readonly subscriptions: Subscription[] = [];
  protected notifications: Notification[] = [];

  protected visible = false;

  readonly count = this.counter.asObservable();

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly notificationSerivce: NotificationService,
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.notificationSerivce
        .listNotifications({ limit: 50 })
        .subscribe((result) => {
          this.notifications = result.notifications;
          this.counter.next(result.unreadCount);
          this.changeDetectorRef.markForCheck();
        })
    );

    this.subscriptions.push(
      this.notificationSerivce
        .onChangeNotifications()
        .subscribe((result) => {
          if (result.newNotification) {
            this.notifications = [result.newNotification, ...this.notifications];
          }
          this.counter.next(result.unreadCount);
          this.changeDetectorRef.markForCheck();
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  open(): void {
    this.visible = true;
    this.changeDetectorRef.markForCheck();
  }

  protected deleteAll(): void {
    this.notificationSerivce.deleteAllNotifications().subscribe(() => {
      this.notifications = [];
      this.changeDetectorRef.markForCheck();
    });
  }

  protected async markAllAsRead(): Promise<void> {
    try {
      await firstValueFrom(this.notificationSerivce.markAllAsRead())
    } finally {
      this.changeDetectorRef.markForCheck();
    }
  }

}
