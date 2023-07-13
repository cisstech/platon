import { Injectable } from '@nestjs/common'
import { UserEntity } from '@platon/core/server'
import { NotificationService } from '@platon/feature/notification/server'
import { ResourceInvitationNotification } from '@platon/feature/resource/common'
import { DataSource, EntitySubscriberInterface, InsertEvent, RemoveEvent } from 'typeorm'
import { ResourceEntity } from '../resource.entity'
import { ResourceInvitationEntity } from './invitation.entity'

@Injectable()
export class ResourceInvitationSubscriber implements EntitySubscriberInterface<ResourceInvitationEntity> {
  constructor(private readonly dataSource: DataSource, private readonly notificationService: NotificationService) {
    this.dataSource.subscribers.push(this)
  }

  listenTo() {
    return ResourceInvitationEntity
  }

  async afterInsert(event: InsertEvent<ResourceInvitationEntity>): Promise<void> {
    const manager = event.manager
    const [inviter, invitee, resource] = await Promise.all([
      manager.findOne(UserEntity, { where: { id: event.entity.inviterId } }),
      manager.findOne(UserEntity, { where: { id: event.entity.inviteeId } }),
      manager.findOne(ResourceEntity, { where: { id: event.entity.resourceId } }),
    ])

    if (!inviter || !invitee || !resource) {
      return
    }

    await this.notificationService.sendToUser(event.entity.inviteeId, {
      type: 'RESOURCE-INVITATION',
      inviterId: inviter.id,
      inviteeId: invitee.id,
      inviteeName: invitee.username,
      inviterName: inviter.username,

      invitationId: event.entity.id,

      resourceId: resource.id,
      resourceName: resource.name,
      resourceType: resource.type,
    } as ResourceInvitationNotification)
  }

  async afterRemove(event: RemoveEvent<ResourceInvitationEntity>): Promise<void> {
    if (event.entity) {
      await this.notificationService.deleteWhere(event.entity.inviteeId, {
        data: {
          type: 'RESOURCE-INVITATION',
          invitationId: event.entity.id,
        } as Partial<ResourceInvitationNotification>,
      })
    }
  }
}
