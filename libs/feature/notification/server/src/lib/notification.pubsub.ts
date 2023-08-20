import { NotificationEntity } from './notification.entity'

export const ON_CHANGE_NOTIFICATIONS = 'onChangeNotifications'
export interface OnChangeNotificationsPayload {
  userId: string
  newNotification?: NotificationEntity
}
