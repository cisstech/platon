/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@angular/core'
import { ApolloCache } from '@apollo/client/cache'
import { Notification } from '@platon/feature/notification/common'
import { BehaviorSubject, Observable, combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'
import { decodeNotificationFragment } from '../models/notification.graphql'
import {
  DeleteAllNotificationsGQL,
  DeleteNotificationGQL,
  ListNotificationsGQL,
  ListNotificationsQuery,
  MarkAllAsReadGQL,
  MarkAsReadGQL,
  NotifFragment,
  OnChangeNotificationsGQL,
  OnChangeNotificationsSubscription,
} from '../models/notification.graphql.generated'
import { NotificationPagination } from '../models/notification.model'

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

  /**
   * List the `limit` most recent notifications and subscribe to new notifications.
   *
   * The emitted value will contains a fetchMore function to load more notifications from the last cursor.
   *
   * @param limit The maximum number of notifications to return (default to 20).
   * @returns An observable of the list of notifications, the unread count and a function to fetch more notifications.
   */
  paginate(limit = 20): Observable<NotificationPagination> {
    const pagination = this.listNotificationsGQL.watch({ first: limit })

    const counter = new BehaviorSubject(0)

    pagination.subscribeToMore<OnChangeNotificationsSubscription>({
      document: this.onChangeNotificationsGQL.document,
      updateQuery: (prev, payload) => {
        if (!payload.subscriptionData.data) {
          return prev
        }

        const change = payload.subscriptionData.data.onChangeNotifications
        const pageInfo = prev.notifications?.pageInfo

        counter.next(change.unreadCount)

        return {
          ...prev,
          notifications: {
            ...prev.notifications,
            edges: [
              ...(change.newNotification
                ? [
                    {
                      node: change.newNotification,
                      cursor: change.newNotification.id,
                    },
                  ]
                : []),
              ...(prev.notifications?.edges ?? []),
            ],
            pageInfo: {
              ...pageInfo,
              endCursor: pageInfo?.endCursor ?? null,
              hasNextPage: pageInfo?.hasNextPage ?? false,
            },
          },
        }
      },
    })

    return combineLatest([pagination.valueChanges, counter]).pipe(
      map(([queryResult, unreadCount]) => {
        const { edges, pageInfo } = queryResult.data.notifications

        return {
          hasMore: pageInfo.hasNextPage,
          unreadCount,
          fetchMore: () => {
            pagination.fetchMore({
              variables: {
                after: pageInfo.endCursor,
              },
            })
          },
          notifications: edges.map((edge) => decodeNotificationFragment(edge.node)),
        }
      })
    )
  }

  /**
   * List the most recent `limit` unread notifications.
   * @param limit The maximum number of notifications to return (default to 5).
   * @returns An observable of the list of notifications
   */
  listUnreads(limit = 5): Observable<Notification[]> {
    const query = this.listNotificationsGQL.watch({
      filters: { unread: true },
      first: limit,
    })

    return query.valueChanges.pipe(
      map((result) => result.data.notifications.edges.map((edge) => decodeNotificationFragment(edge.node)))
    )
  }

  /**
   * Marks the notification identified by `id` as read.
   * @remarks
   * All the subcriptions to ({@link paginate}, {@link listUnreads}) will be notified of the change.
   * @param id The notification id.
   * @returns An observable of the success of the operation.
   */
  markAsRead(id: string): Observable<boolean> {
    return this.markAsReadGQL
      .mutate(
        { id },
        {
          update: (store) => {
            this.updateStore(store, (node) => (node.id === id ? { readAt: new Date().toISOString() } : node))
          },
        }
      )
      .pipe(map((result) => result!.data!.markAsRead))
  }

  /**
   * Marks all the unread notifications as read.
   * @remarks
   * All the subcriptions to ({@link paginate}, {@link listUnreads}) will be notified of the change.
   * @returns An observable of the success of the operation.
   */
  markAllAsRead(): Observable<boolean> {
    return this.markAllAsReadGQL
      .mutate(
        {},
        {
          update: (store) => {
            this.updateStore(store, (node) => ({
              readAt: node.readAt ?? new Date().toISOString(),
            }))
          },
        }
      )
      .pipe(map((result) => result!.data!.markAllAsRead))
  }

  /**
   * Deletes the notification identified by `id`.
   * @remarks
   * All the subcriptions to ({@link paginate}, {@link listUnreads}) will be notified of the change.
   * @param id The notification id.
   * @returns An observable of the success of the operation.
   */
  deleteNotification(id: string): Observable<boolean> {
    return this.deleteNotificationGQL
      .mutate(
        { id },
        {
          update: (store) => {
            this.updateStore(store, (node) => (node.id === id ? undefined : node))
          },
        }
      )
      .pipe(map((result) => result!.data!.deleteNotification))
  }

  /**
   * Deletes all the notifications.
   * @remarks
   * All the subcriptions to ({@link paginate}, {@link listUnreads}) will be notified of the change.
   * @returns An observable of the success of the operation.
   */
  deleteAllNotifications(): Observable<boolean> {
    return this.deleteAllNotificationsGQL
      .mutate(
        {},
        {
          update: (store) => {
            this.updateStore(store, () => undefined)
          },
        }
      )
      .pipe(map((result) => result!.data!.deleteAllNotifications))
  }

  private updateStore(
    store: ApolloCache<unknown>,
    updater: (node: NotifFragment) => Partial<NotifFragment> | undefined
  ) {
    const data = store.readQuery<ListNotificationsQuery>({
      query: this.listNotificationsGQL.document,
    }) as ListNotificationsQuery

    store.writeQuery({
      query: this.listNotificationsGQL.document,
      data: {
        ...data,
        notifications: {
          ...data.notifications,
          edges: data.notifications.edges
            .map((edge) => {
              const changes = updater(edge.node)
              return changes
                ? {
                    ...edge,
                    node: {
                      ...edge.node,
                      ...changes,
                    },
                  }
                : undefined
            })
            .filter(Boolean),
        },
      } as ListNotificationsQuery,
    })
  }
}
