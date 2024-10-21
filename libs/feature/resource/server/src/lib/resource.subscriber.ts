import { Inject, Injectable } from '@nestjs/common'
import { IRequest } from '@platon/core/server'
import {
  ResourceCreateEventData,
  ResourceEventTypes,
  ResourceStatusChangeEventData,
} from '@platon/feature/resource/common'
import { CLS_REQ } from 'nestjs-cls'
import { DataSource, EntitySubscriberInterface, InsertEvent, UpdateEvent } from 'typeorm'
import { ResourceEventEntity } from './events/event.entity'
import { ResourceEntity } from './resource.entity'
import { ResourceWatcherEntity } from './watchers'
import { ResourceService } from './resource.service'

@Injectable()
export class ResourceSubscriber implements EntitySubscriberInterface<ResourceEntity> {
  constructor(
    private readonly resourceService: ResourceService,
    private readonly dataSource: DataSource,
    @Inject(CLS_REQ)
    private readonly request: IRequest
  ) {
    this.dataSource.subscribers.push(this)
  }

  listenTo() {
    return ResourceEntity
  }

  async afterInsert(event: InsertEvent<ResourceEntity>): Promise<void> {
    await event.manager.save(
      event.manager.create(ResourceWatcherEntity, {
        resourceId: event.entity.id,
        userId: event.entity.ownerId,
      })
    )

    if (event.entity.parentId) {
      const data: ResourceCreateEventData = {
        resourceId: event.entity.id,
        resourceType: event.entity.type,
        resourceName: event.entity.name,
        parentName: (await this.resourceService.getById(event.entity.parentId)).name || 'Inconnu',
      }
      await event.manager.save(
        event.manager.create(ResourceEventEntity, {
          actorId: event.entity.ownerId,
          resourceId: event.entity.parentId,
          type: ResourceEventTypes.RESOURCE_CREATE,
          data,
        })
      )
    }
  }

  async afterUpdate(event: UpdateEvent<ResourceEntity>): Promise<void> {
    if (event.entity && event.updatedColumns.find((col) => col.propertyName === 'status')) {
      const data: ResourceStatusChangeEventData = {
        resourceId: event.entity.id,
        resourceType: event.entity.type,
        resourceName: event.entity.name,
        parentName: (await this.resourceService.getById(event.entity.parentId)).name || 'Inconnu',
        newStatus: event.entity.status,
      }
      await event.manager.save(
        event.manager.create(ResourceEventEntity, {
          actorId: this.request.user.id,
          resourceId: event.entity.id,
          type: ResourceEventTypes.RESOURCE_STATUS_CHANGE,
          data,
        })
      )

      if (event.entity.parentId) {
        const data: ResourceStatusChangeEventData = {
          resourceId: event.entity.id,
          resourceType: event.entity.type,
          resourceName: event.entity.name,
          parentName: event.entity.parentName,
          newStatus: event.entity.status,
        }
        await event.manager.save(
          event.manager.create(ResourceEventEntity, {
            actorId: this.request.user.id,
            resourceId: event.entity.parentId,
            type: ResourceEventTypes.RESOURCE_STATUS_CHANGE,
            data,
          })
        )
      }
    }
  }
}
