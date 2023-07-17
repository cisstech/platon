import { NotificationEntity } from './notification.entity'

export const ON_CHANGE_NOTIFICATIONS = 'onChangeNotifications'
export interface OnChangeNotificationsPayload {
  onChangeNotifications: {
    userId: string
    notifications?: NotificationEntity[]
    newNotification?: NotificationEntity
  }
}
