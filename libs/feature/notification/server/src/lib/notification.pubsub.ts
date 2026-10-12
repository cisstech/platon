import { NotificationEntity } from './notification.entity'

export const ON_CHANGE_NOTIFICATIONS = 'onChangeNotifications'
/** Crosses Redis as JSON: a listener receives the dates of `newNotification` as strings. */
export interface OnChangeNotificationsPayload {
  userId: string
  newNotification?: NotificationEntity
}
