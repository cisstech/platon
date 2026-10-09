import { Injectable, inject } from '@angular/core'
import {
  DeleteAllNotificationsGQL,
  DeleteNotificationGQL,
  ListNotificationsGQL,
  MarkAllAsReadGQL,
  MarkAsReadGQL,
  OnChangeNotificationsGQL,
  UnreadNotificationCountGQL,
  decodeNotificationFragment,
} from '@platon/feature/notification/browser/shared'
import { Notification } from '@platon/feature/notification/common'
import { ResourceService } from '@platon/feature/resource/browser/shared'
import { Observable, filter, map, switchMap } from 'rxjs'

/** As many as the current interface loads at a time. */
export const NOTIFICATIONS_PAGE_SIZE = 20

export interface NotificationPage {
  readonly notifications: Notification[]
  readonly hasMore: boolean
  /** Where the next page starts. */
  readonly cursor: string | null
  /** Every notification of the person, signals left out. */
  readonly total: number
}

export interface NotificationChange {
  readonly unreadCount: number
  readonly notification?: Notification
}

/**
 * The notifications of the person, outside the Apollo cache: the store of the panel holds them, so
 * no cache policy of the current interface applies here.
 */
@Injectable({ providedIn: 'root' })
export class NotificationsApi {
  private readonly listGQL = inject(ListNotificationsGQL)
  private readonly unreadCountGQL = inject(UnreadNotificationCountGQL)
  private readonly changesGQL = inject(OnChangeNotificationsGQL)
  private readonly markAsReadGQL = inject(MarkAsReadGQL)
  private readonly markAllAsReadGQL = inject(MarkAllAsReadGQL)
  private readonly deleteGQL = inject(DeleteNotificationGQL)
  private readonly deleteAllGQL = inject(DeleteAllNotificationsGQL)
  private readonly resources = inject(ResourceService)

  unreadCount(): Observable<number> {
    return this.unreadCountGQL
      .fetch({}, { fetchPolicy: 'no-cache' })
      .pipe(map((result) => result.data.unreadNotificationCount))
  }

  /** The count after each change, with the notification that has just arrived, if any. */
  changes(): Observable<NotificationChange> {
    return this.changesGQL.subscribe().pipe(
      map((result) => result.data?.onChangeNotifications),
      filter((change) => !!change),
      map((change) => ({
        unreadCount: change.unreadCount,
        notification: change.newNotification ? decodeNotificationFragment(change.newNotification) : undefined,
      }))
    )
  }

  /** `first` notifications after the cursor, newest first, signals left out. */
  page(after: string | null = null, first = NOTIFICATIONS_PAGE_SIZE): Observable<NotificationPage> {
    return this.listGQL
      .fetch({ filters: { unread: null, excludeSignals: true }, first, after }, { fetchPolicy: 'no-cache' })
      .pipe(
        map(({ data: { notifications } }) => ({
          notifications: notifications.edges.map((edge) => decodeNotificationFragment(edge.node)),
          hasMore: notifications.pageInfo.hasNextPage,
          cursor: notifications.pageInfo.endCursor ?? null,
          total: notifications.totalCount,
        }))
      )
  }

  markAsRead(id: string): Observable<boolean> {
    return this.markAsReadGQL.mutate({ id }).pipe(map((result) => result.data?.markAsRead ?? false))
  }

  markAllAsRead(): Observable<boolean> {
    return this.markAllAsReadGQL.mutate().pipe(map((result) => result.data?.markAllAsRead ?? false))
  }

  delete(id: string): Observable<boolean> {
    return this.deleteGQL.mutate({ id }).pipe(map((result) => result.data?.deleteNotification ?? false))
  }

  deleteAll(): Observable<boolean> {
    return this.deleteAllGQL.mutate().pipe(map((result) => result.data?.deleteAllNotifications ?? false))
  }

  /** Accepts or declines an invitation to collaborate on a resource; fails if it no longer exists. */
  answerInvitation(resourceId: string, inviteeId: string, accept: boolean): Observable<void> {
    return this.resources
      .findInvitation(resourceId, inviteeId)
      .pipe(
        switchMap((invitation) =>
          accept ? this.resources.acceptInvitation(invitation) : this.resources.deleteInvitation(invitation)
        )
      )
  }
}
