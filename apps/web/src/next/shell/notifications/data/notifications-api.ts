import { Injectable, inject } from '@angular/core'
import { MAX_PAGE_SIZE } from '@platon/core/common'
import { NotificationService } from '@platon/feature/notification/browser/shared'
import { Notification, NotificationChange } from '@platon/feature/notification/common'
import { ResourceService } from '@platon/feature/resource/browser/shared'
import { Observable, forkJoin, map, switchMap } from 'rxjs'

export type { NotificationChange }

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

/** The notifications of the person, for the panel: its store holds them, the API is only asked. */
@Injectable({ providedIn: 'root' })
export class NotificationsApi {
  private readonly notifications = inject(NotificationService)
  private readonly resources = inject(ResourceService)

  unreadCount(): Observable<number> {
    return this.notifications.unreadCount()
  }

  /** The count when the stream opens and after each change, with the notification that has just arrived, if any. */
  changes(): Observable<NotificationChange> {
    return this.notifications.changes()
  }

  /**
   * `first` notifications after the cursor, newest first, signals left out. The API gives at most
   * 50 at a time, and loading a long list again after a deletion asks for more: the pages are then
   * asked together.
   */
  page(after: string | null = null, first = NOTIFICATIONS_PAGE_SIZE): Observable<NotificationPage> {
    const offset = after ? Number(after) : 0
    const starts = Array.from(
      { length: Math.ceil(first / MAX_PAGE_SIZE) },
      (_, index) => offset + index * MAX_PAGE_SIZE
    )
    return forkJoin(
      starts.map((start) =>
        this.notifications.list({
          excludeSignals: true,
          offset: start,
          limit: Math.min(MAX_PAGE_SIZE, offset + first - start),
        })
      )
    ).pipe(
      map((pages) => {
        const received = pages.flatMap((page) => page.resources)
        // A notification that arrives between two of the pages shifts the second one: one may repeat.
        const notifications = received.filter((item, index) => received.findIndex(({ id }) => id === item.id) === index)
        const end = offset + received.length
        const total = pages[pages.length - 1].total
        return { notifications, hasMore: end < total, cursor: String(end), total }
      })
    )
  }

  markAsRead(id: string): Observable<boolean> {
    return this.notifications.markAsRead(id)
  }

  markAllAsRead(): Observable<boolean> {
    return this.notifications.markAllAsRead()
  }

  delete(id: string): Observable<boolean> {
    return this.notifications.deleteNotification(id)
  }

  deleteAll(): Observable<boolean> {
    return this.notifications.deleteAllNotifications()
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
