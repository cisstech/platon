import { Inject, Injectable } from '@nestjs/common';
import { IRequest } from '@platon/core/server';
import { ResourceEventTypes } from '@platon/feature/resource/common';
import { CLS_REQ } from 'nestjs-cls';
import { DataSource, EntitySubscriberInterface, InsertEvent, UpdateEvent } from 'typeorm';
import { ResourceEntity, ResourceEventEntity } from '../entities';

@Injectable()
export class ResourceSubscriber implements EntitySubscriberInterface<ResourceEntity> {
  constructor(
    private readonly dataSource: DataSource,
    @Inject(CLS_REQ)
    private readonly request: IRequest,
  ) {
    this.dataSource.subscribers.push(this);
  }

  listenTo() {
    return ResourceEntity;
  }

  async afterInsert(event: InsertEvent<ResourceEntity>): Promise<void> {
    if (event.entity.parentId) {
      await event.manager.save(
        event.manager.create(ResourceEventEntity, {
          actorId: event.entity.ownerId,
          resourceId: event.entity.parentId,
          type: ResourceEventTypes.RESOURCE_CREATE,
          data: {
            resourceId: event.entity.id,
            resourceType: event.entity.type
          }
        })
      )
    }
  }

  async afterUpdate(event: UpdateEvent<ResourceEntity>): Promise<void> {
    if (event.entity && event.updatedColumns.find(col => col.propertyName === 'status')) {
      await event.manager.save(
        event.manager.create(ResourceEventEntity, {
          actorId: this.request.user.id,
          resourceId: event.entity.id,
          type: ResourceEventTypes.RESOURCE_STATUS_CHANGE,
          data: {
            resourceId: event.entity.id,
            resourceType: event.entity.type
          }
        })
      )

      if (event.entity.parentId) {
        await event.manager.save(
          event.manager.create(ResourceEventEntity, {
            actorId: this.request.user.id,
            resourceId: event.entity.parentId,
            type: ResourceEventTypes.RESOURCE_STATUS_CHANGE,
            data: {
              resourceId: event.entity.id,
              resourceType: event.entity.type
            }
          })
        )
      }
    }
  }
}
