/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@angular/core'
import { Notification, NotificationFilters } from '@platon/feature/notification/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import {
  DeleteAllNotificationsGQL,
  DeleteNotificationGQL,
  ListNotificationsGQL,
  MarkAllAsReadGQL,
  MarkAsReadGQL,
  NotifFragment,
  OnChangeNotificationsGQL,
} from '../models/notification.graphql.generated'

const decodeFragment = (fragment: NotifFragment): Notification => ({
  id: fragment.id,
  createdAt: fragment.createdAt,
  data: fragment.data,
  userId: fragment.user.id,
  readAt: fragment.readAt,
})

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(
    private readonly markAsReadGQL: MarkAsReadGQL,
    private readonly markAllAsReadGQL: MarkAllAsReadGQL,
    private readonly listNotificationsGQL: ListNotificationsGQL,
    private readonly deleteNotificationGQL: DeleteNotificationGQL,
    private readonly onChangeNotificationsGQL: OnChangeNotificationsGQL,
    private readonly deleteAllNotificationsGQL: DeleteAllNotificationsGQL
  ) {}

  listUnreads() {
    return this.listNotificationsGQL
      .fetch({
        filters: {
          limit: 10,
          unread: true,
        },
      })
      .pipe(map((result) => result.data.notifications.map(decodeFragment)))
  }

  listNotifications(filters?: NotificationFilters) {
    return this.listNotificationsGQL.fetch({ filters }).pipe(
      map((result) => ({
        unreadCount: result.data.unreadNotificationsCount,
        notifications: result.data.notifications.map(decodeFragment),
      }))
    )
  }

  onChangeNotifications() {
    return this.onChangeNotificationsGQL.subscribe().pipe(
      map((result) => result!.data!.onChangeNotifications!),
      map((change) => ({
        unreadCount: change.unreadCount,
        newNotification: change.newNotification ? decodeFragment(change.newNotification) : undefined,
        notifications: change.notifications?.map((change) => decodeFragment(change)),
      }))
    )
  }

  markAsRead(id: string): Observable<Notification> {
    return this.markAsReadGQL.mutate({ id }).pipe(map((result) => decodeFragment(result!.data!.markAsRead)))
  }

  markAllAsRead(): Observable<boolean> {
    return this.markAllAsReadGQL.mutate().pipe(map((result) => result!.data!.markAllAsRead))
  }

  deleteNotification(id: string): Observable<boolean> {
    return this.deleteNotificationGQL.mutate({ id }).pipe(map((result) => result!.data!.deleteNotification))
  }

  deleteAllNotifications(): Observable<boolean> {
    return this.deleteAllNotificationsGQL.mutate().pipe(map((result) => result!.data!.deleteAllNotifications))
  }
}
