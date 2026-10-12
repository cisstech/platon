import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { EventStreamClient, StreamEvent, StreamMessage, buildHttpParams } from '@platon/core/browser/shared'
import { ItemResponse, ListResponse } from '@platon/core/common'
import { Notification, NotificationChange, NotificationFilters } from '@platon/feature/notification/common'
import {
  Observable,
  Subject,
  Subscription,
  defer,
  filter,
  finalize,
  map,
  retry,
  share,
  startWith,
  tap,
  timer,
} from 'rxjs'
import { NotificationPagination } from '../models/notification.model'

const API = '/api/v1/notifications'

/** What this service has just changed on the API, for the lists it keeps to show at once. */
type LocalChange =
  | { readonly kind: 'read'; readonly id: string }
  | { readonly kind: 'all-read' }
  | { readonly kind: 'deleted'; readonly id: string }
  | { readonly kind: 'all-deleted' }

const applyLocal = (notifications: Notification[], change: LocalChange): Notification[] => {
  switch (change.kind) {
    case 'read':
      return notifications.map((item) =>
        item.id === change.id ? { ...item, readAt: item.readAt ?? new Date() } : item
      )
    case 'all-read':
      return notifications.map((item) => ({ ...item, readAt: item.readAt ?? new Date() }))
    case 'deleted':
      return notifications.filter((item) => item.id !== change.id)
    case 'all-deleted':
      return []
  }
}

/** The notifications of the person signed in, read and changed through the REST API, kept live by its stream. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient)
  private readonly local = new Subject<LocalChange>()
  /** The last unread count of the open stream, for a subscriber that arrives after it opened. */
  private lastCount?: number
  /** One connection for every subscriber, open while one listens. */
  private readonly events = inject(EventStreamClient)
    .open<NotificationChange>(`${API}/stream`)
    .pipe(
      finalize(() => (this.lastCount = undefined)),
      share()
    )
  private readonly live: Observable<NotificationChange> = this.events.pipe(
    filter(
      (event: StreamEvent<NotificationChange>): event is StreamMessage<NotificationChange> =>
        event.kind === 'message' && event.type === 'message'
    ),
    map((event) => event.data),
    tap((change) => (this.lastCount = change.unreadCount))
  )

  /** The notifications a filter keeps, newest first. */
  list(filters: NotificationFilters = {}): Observable<ListResponse<Notification>> {
    return this.http.get<ListResponse<Notification>>(API, { params: buildHttpParams(filters) })
  }

  /** The unread notifications, signals left out. */
  unreadCount(): Observable<number> {
    return this.http.get<ItemResponse<number>>(`${API}/unread-count`).pipe(map((response) => response.resource))
  }

  /**
   * The unread count when the stream opens, then after each change, with the notification that has
   * just arrived. A subscriber that arrives while the stream is open starts with its last count.
   */
  changes(): Observable<NotificationChange> {
    return defer(() => {
      const known = this.lastCount
      return known === undefined ? this.live : this.live.pipe(startWith({ unreadCount: known }))
    })
  }

  /**
   * The `limit` most recent notifications, signals included, kept up to date: each notification that
   * arrives comes first, the changes made through this service show at once, and the first page is
   * read again when the stream opens again, for what arrived while it was closed.
   *
   * The emitted value holds a `fetchMore` function that loads the next `limit` notifications.
   * @param limit The number of notifications to load at a time (default to 20).
   */
  paginate(limit = 20): Observable<NotificationPagination> {
    return new Observable<NotificationPagination>((subscriber) => {
      let notifications: Notification[] = []
      let total = 0
      let unreadCount = 0
      let loaded = false

      const emit = () => {
        if (loaded) subscriber.next({ hasMore: notifications.length < total, unreadCount, fetchMore, notifications })
      }
      /** Adds the notifications of a page it does not hold yet, before or after the others. */
      const merge = (page: ListResponse<Notification>, place: 'first' | 'last') => {
        const known = new Set(notifications.map((item) => item.id))
        const unknown = page.resources.filter((item) => !known.has(item.id))
        notifications = place === 'first' ? [...unknown, ...notifications] : [...notifications, ...unknown]
        total = page.total
        loaded = true
        emit()
      }
      const fetchMore = () => {
        this.list({ offset: notifications.length, limit }).subscribe({
          next: (page) => merge(page, 'last'),
          error: console.error,
        })
      }

      const subscription = new Subscription()
      subscription.add(
        this.list({ limit })
          .pipe(retry({ delay: (_, attempt) => timer(Math.min(1_000 * 2 ** (attempt - 1), 30_000)) }))
          .subscribe((page) => merge(page, 'last'))
      )
      subscription.add(
        this.events.pipe(filter((event) => event.kind === 'opened' && loaded)).subscribe(() => {
          this.list({ limit }).subscribe({ next: (page) => merge(page, 'first'), error: console.error })
        })
      )
      subscription.add(
        this.live.subscribe((change) => {
          unreadCount = change.unreadCount
          const { notification } = change
          if (notification && !notifications.some((item) => item.id === notification.id)) {
            notifications = [notification, ...notifications]
            total++
          }
          emit()
        })
      )
      subscription.add(
        this.local.subscribe((change) => {
          const kept = applyLocal(notifications, change)
          total = change.kind === 'all-deleted' ? 0 : total - (notifications.length - kept.length)
          notifications = kept
          emit()
        })
      )
      return subscription
    })
  }

  /** Marks a notification as read; emits `true` once the API has done it. */
  markAsRead(id: string): Observable<boolean> {
    return this.send(this.http.patch<void>(`${API}/${id}/read`, {}), { kind: 'read', id })
  }

  /** Marks every notification as read; emits `true` once the API has done it. */
  markAllAsRead(): Observable<boolean> {
    return this.send(this.http.patch<void>(`${API}/read`, {}), { kind: 'all-read' })
  }

  /** Deletes a notification of the person; emits `true` once the API has answered, even if it was gone. */
  deleteNotification(id: string): Observable<boolean> {
    return this.send(this.http.delete<void>(`${API}/${id}`), { kind: 'deleted', id })
  }

  /** Deletes every notification of the person; emits `true` once the API has done it. */
  deleteAllNotifications(): Observable<boolean> {
    return this.send(this.http.delete<void>(API), { kind: 'all-deleted' })
  }

  private send(request: Observable<void>, change: LocalChange): Observable<boolean> {
    return request.pipe(
      map(() => {
        this.local.next(change)
        return true
      })
    )
  }
}
