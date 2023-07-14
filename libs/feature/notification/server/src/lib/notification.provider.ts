import { SetMetadata } from '@nestjs/common'

export const NOTIFICATION_EXTRA_DATA = Symbol('NOTIFICATION_EXTRA_DATA')

export const RegisterNotificationExtraDataProvider = () => SetMetadata(NOTIFICATION_EXTRA_DATA, true)

/**
 * A provider that can provide extra data for a notification.
 *
 * A typical use case is to provide extra data for a notification that will be used by the notification renderer
 * to show dynamic buttons like "accept/decline an invitation"...
 * @typeParam T The type of notification this provider can provide extra data for.
 * @example
 * ```ts
 * class MyProvider implements NotificationExtraDataProvider<MyNotification> {
 * match(notification: MyNotification): boolean {
 *  return notification.type === 'MY_NOTIFICATION'
 * }
 *
 * provide(notification: MyNotification): Promise<Record<string, unknown> | undefined> {
 *  return {
 *    myExtraData: 'myExtraData'
 *  }
 * }
 * ```
 */
export interface NotificationExtraDataProvider<T = unknown> {
  /**
   * Whether this provider can provide extra data for the given notification.
   * @param notification The notification to check.
   * @returns Whether this provider can provide extra data for the given notification.
   * ```
   */
  match(notification: T): boolean

  /**
   * Provides extra data for the given notification.
   * @param notification The notification to provide extra data for.
   * @returns The extra data for the given notification.
   */
  provide(notification: T): Promise<Record<string, unknown> | undefined>
}
