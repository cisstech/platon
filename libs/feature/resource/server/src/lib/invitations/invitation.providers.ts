import { Injectable } from '@nestjs/common'
import {
  NotificationExtraDataProvider,
  RegisterNotificationExtraDataProvider,
} from '@platon/feature/notification/server'
import { RESOURCE_INVITATION_NOTIFICATION, ResourceInvitationNotification } from '@platon/feature/resource/common'
import { ResourceInvitationService } from './invitation.service'

@Injectable()
@RegisterNotificationExtraDataProvider()
export class ResourceInvitationExtraDataProvider
  implements NotificationExtraDataProvider<ResourceInvitationNotification>
{
  constructor(private readonly invitationService: ResourceInvitationService) {}
  match(notification: ResourceInvitationNotification): boolean {
    return notification.type === RESOURCE_INVITATION_NOTIFICATION
  }

  async provide(notification: ResourceInvitationNotification): Promise<Record<string, unknown> | undefined> {
    const optional = await this.invitationService.findLastOfInviteeInResource(
      notification.resourceId,
      notification.inviteeId
    )

    if (optional.isEmpty()) {
      return { expired: true }
    }

    return Promise.resolve({
      expired: optional.get().id !== notification.invitationId,
    })
  }
}
