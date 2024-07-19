import { Injectable, Logger } from '@nestjs/common'
import { NotificationService } from '@platon/feature/notification/server'
import {
  ResourceMemberCreateEventData,
  ResourceEventNotification,
  ResourceEventTypes,
} from '@platon/feature/resource/common'
import { DataSource, EntityManager, EntitySubscriberInterface, InsertEvent } from 'typeorm'
import { ResourceService } from '../resource.service'
import { ResourceEventEntity } from './event.entity'
import { UserService } from '@platon/core/server'

type TargetUserProvider = (event: ResourceEventEntity, manager: EntityManager) => Promise<string[]>
type TargetUserProviderMap = Record<ResourceEventTypes, TargetUserProvider>

@Injectable()
export class ResourceEventSubscriber implements EntitySubscriberInterface<ResourceEventEntity> {
  private readonly logger = new Logger(ResourceEventSubscriber.name)
  private readonly defaultUserProvider: TargetUserProvider = async (event, manager) => {
    const users = await this.resourceService.notificationWatchers(event.resourceId, manager)
    return users.filter((u) => u !== event.actorId)
  }

  private readonly targetUserProviderMap: TargetUserProviderMap = {
    [ResourceEventTypes.MEMBER_CREATE]: async (event, manager) => {
      // join request
      if (event.actorId === (event.data as ResourceMemberCreateEventData).userId) {
        const [admins] = await this.userService.search({
          roles: ['admin'],
        })
        return admins.map((u) => u.id)
      }
      return this.defaultUserProvider(event, manager)
    },
    [ResourceEventTypes.RESOURCE_CREATE]: this.defaultUserProvider.bind(this),
    [ResourceEventTypes.RESOURCE_STATUS_CHANGE]: this.defaultUserProvider.bind(this),
    [ResourceEventTypes.RESOURCE_FILE_CHANGE]: this.defaultUserProvider.bind(this),
    [ResourceEventTypes.MEMBER_REMOVE]: async (event) => {
      return [event.actorId]
    },
  }

  constructor(
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
    private readonly resourceService: ResourceService,
    private readonly notificationService: NotificationService
  ) {
    this.dataSource.subscribers.push(this)
  }

  listenTo() {
    return ResourceEventEntity
  }

  async afterInsert(event: InsertEvent<ResourceEventEntity>): Promise<void> {
    if (event.entity) {
      if (event.entity.type === ResourceEventTypes.RESOURCE_STATUS_CHANGE) {
        // since status change is sent both on parent on target, we choose to sent notification
        // only for users of target resource
        if (event.entity.resourceId !== event.entity.data.resourceId) {
          return
        }
      }

      this.notificationService
        .sendToAllUsers<ResourceEventNotification>(
          await this.targetUserProviderMap[event.entity.type](event.entity, event.manager),
          {
            type: 'RESOURCE-EVENT',
            eventInfo: {
              id: event.entity.id,
              type: event.entity.type,
              actorId: event.entity.actorId,
              resourceId: event.entity.resourceId,
              createdAt: event.entity.createdAt,
              updatedAt: event.entity.updatedAt,
              data: event.entity.data,
            },
          }
        )
        .catch((error) => {
          this.logger.error('Failed to send notification', error)
        })
    }
  }
}
