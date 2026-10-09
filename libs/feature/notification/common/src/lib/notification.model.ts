export interface Notification<TData = unknown> {
  id: string
  userId: string
  createdAt: Date
  updatedAt: Date
  readAt?: Date | null
  data: TData
}

export interface NotificationFilters {
  readonly unread?: boolean
  /** Leaves out the signals: notifications that drive a screen and that a person never reads. */
  readonly excludeSignals?: boolean
  readonly offset?: number
  readonly limit?: number
}
