import { Notification } from '@platon/feature/notification/common'

export interface NotificationPagination {
  hasMore: boolean
  fetchMore: () => void
  unreadCount: number
  notifications: Notification[]
}
