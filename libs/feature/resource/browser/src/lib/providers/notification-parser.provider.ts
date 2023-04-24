import { NotificationParser, NotificationRenderer } from "@platon/feature/notification/browser";
import { Notification } from "@platon/feature/notification/common";
import { RESOURCE_EVENT_NOTIFICATION } from "@platon/feature/resource/common";
import { ResourceEventItemComponent } from "../components/event-item/event-item.component";

export const ResourceEventNotificationParser: NotificationParser = {
  support(notification: Notification): boolean {
    return notification.data.type === RESOURCE_EVENT_NOTIFICATION;
  },
  renderer(): NotificationRenderer {
    return {
      content: ResourceEventItemComponent
    }
  }
}
