import { Injectable } from '@nestjs/common'
import { NotificationService } from '@platon/feature/notification/server'
import { ResourceEventNotification } from '@platon/feature/resource/common'
import { DataSource, EntitySubscriberInterface, InsertEvent } from 'typeorm'
import { ResourceService } from '../resource.service'
import { ResourceEventEntity } from './event.entity'

@Injectable()
export class ResourceEventSubscriber implements EntitySubscriberInterface<ResourceEventEntity> {
  constructor(
    private readonly dataSource: DataSource,
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
      const watchers = await this.resourceService.notificationWatchers(event.entity.resourceId, event.manager)

      this.notificationService.sendToAllUsers<ResourceEventNotification>(
        watchers.filter((w) => w !== event.entity.actorId),
        {
          type: 'RESOURCE-EVENT',
          eventInfo: {
            id: event.entity.id,
            type: event.entity.type,
            actorId: event.entity.actorId,
            resourceId: event.entity.resourceId,
            createdAt: event.entity.createdAt,
            data: event.entity.data,
          },
        }
      )
    }
  }
}
