import { Injectable } from '@nestjs/common'
import {
  NotificationExtraDataProvider,
  RegisterNotificationExtraDataProvider,
} from '@platon/feature/notification/server'
import {
  RESOURCE_EVENT_NOTIFICATION,
  ResourceEventNotification,
  ResourceMemberCreateEventData,
} from '@platon/feature/resource/common'
import { ResourceMemberService } from '../members'

@Injectable()
@RegisterNotificationExtraDataProvider()
export class ResourceMemberCreateEventNotificationDataProvider
  implements NotificationExtraDataProvider<ResourceEventNotification>
{
  constructor(private readonly memberService: ResourceMemberService) {}

  match(notification: ResourceEventNotification): boolean {
    return notification.type === RESOURCE_EVENT_NOTIFICATION && notification.eventInfo.type === 'MEMBER_CREATE'
  }

  async provide(notification: ResourceEventNotification): Promise<undefined> {
    const data = notification.eventInfo.data as ResourceMemberCreateEventData
    if (data.userId !== notification.eventInfo.actorId) return

    const optional = await this.memberService.findByUserId(notification.eventInfo.resourceId, data.userId)
    if (optional.isEmpty()) {
      data.expired = true
      return
    }

    data.expired = !optional.get().waiting
  }
}
