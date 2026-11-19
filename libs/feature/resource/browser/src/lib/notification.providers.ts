import { Provider } from '@angular/core'
import { NOTIFICATION_PARSER } from '@platon/feature/notification/browser'
import { ResourceNotificationParsers } from './providers/resource-notification-parser.provider'

/** How the notification drawer of the current interface renders the notifications of resources. */
export const RESOURCE_NOTIFICATION_PROVIDERS: Provider[] = ResourceNotificationParsers.map((parser) => ({
  provide: NOTIFICATION_PARSER,
  multi: true,
  useValue: parser,
}))
