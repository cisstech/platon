import { ComponentType } from '@angular/cdk/portal'
import { InjectionToken, Injector } from '@angular/core'
import { Icon } from '@cisstech/nge/ui/icon'
import { Notification } from '@platon/feature/notification/common'

export interface NotificationParser {
  support(notification: Notification): boolean
  renderer(notification: Notification): NotificationRenderer
}

export interface NotificationRenderer {
  icon?: Icon
  content: string | ComponentType<unknown>
  onClick?: (injector: Injector) => void
}

export const NOTIFICATION = new InjectionToken<Notification>('NOTIFICATION')
export const NOTIFICATION_PARSER = new InjectionToken<NotificationParser[]>('NOTIFICATION_PARSER')
