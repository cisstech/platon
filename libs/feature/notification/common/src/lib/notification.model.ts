export interface Notification<TData = unknown> {
  id: string
  userId: string
  createdAt: Date
  updatedAt?: Date
  readAt?: Date | null
  data: TData
}

export interface NotificationFilters {
  readonly unread?: boolean
  readonly offset?: number
  readonly limit?: number
}
