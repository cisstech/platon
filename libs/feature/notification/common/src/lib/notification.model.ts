export interface Notification<TData = unknown> {
  id: string
  userId: string
  createdAt: Date
  updatedAt: Date
  readAt?: Date | null
  data: TData
}

/** A change in the notifications of a person, sent live: the unread count, and the notification that has just arrived, if any. */
export interface NotificationChange<TData = unknown> {
  readonly unreadCount: number
  readonly notification?: Notification<TData>
}

export interface NotificationFilters {
  readonly unread?: boolean
  /** Leaves out the signals: notifications that drive a screen and that a person never reads. */
  readonly excludeSignals?: boolean
  readonly offset?: number
  readonly limit?: number
}
