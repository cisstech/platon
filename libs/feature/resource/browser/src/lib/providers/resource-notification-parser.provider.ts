import { Router } from '@angular/router'
import { ImgIcon } from '@cisstech/nge/ui/icon'
import { NotificationParser, NotificationRenderer } from '@platon/feature/notification/browser'
import { Notification } from '@platon/feature/notification/common'
import { ResourceEventNotification, RESOURCE_EVENT_NOTIFICATION } from '@platon/feature/resource/common'
import { ResourceEventItemComponent } from '../components/event-item/event-item.component'

export const ResourceEventNotificationParser: NotificationParser = {
  support(notification: Notification<ResourceEventNotification>): boolean {
    return notification.data.type === RESOURCE_EVENT_NOTIFICATION
  },
  renderer(notification: Notification<ResourceEventNotification>): NotificationRenderer {
    const event = notification.data.eventInfo
    const resourceType = event.data.resourceType.toLowerCase()
    return {
      icon: new ImgIcon(`/assets/images/resources/${resourceType}.svg`),
      content: ResourceEventItemComponent,
      onClick: (injector) => {
        const router = injector.get(Router)
        router.navigate([`/resources/${event.data.resourceId}`])
      },
    }
  },
}
