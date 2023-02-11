import { Injectable } from '@nestjs/common';
import { ResourceEventTypes } from '@platon/feature/resource/common';
import { DataSource, EntitySubscriberInterface, InsertEvent, RemoveEvent } from 'typeorm';
import { ResourceEventEntity, ResourceMemberEntity, ResourceWatcherEntity } from '../entities';

@Injectable()
export class ResourceMemberSubscriber implements EntitySubscriberInterface<ResourceMemberEntity> {
  constructor(
    private readonly dataSource: DataSource,
  ) {
    this.dataSource.subscribers.push(this);
  }

  listenTo() {
    return ResourceMemberEntity;
  }


  async afterInsert(event: InsertEvent<ResourceMemberEntity>): Promise<void> {
    await event.manager.save(
      [event.manager.create(ResourceEventEntity, {
        actorId: event.entity.inviterId,
        resourceId: event.entity.resourceId,
        type: ResourceEventTypes.MEMBER_CREATE,
        data: {}
      }),
      event.manager.create(ResourceWatcherEntity, {
        resourceId: event.entity.resourceId,
        userId: event.entity.userId
      })]
    )
  }

  async afterRemove(event: RemoveEvent<ResourceMemberEntity>): Promise<void> {
    if (event.entity) {
      await event.manager.save(
        event.manager.create(ResourceEventEntity, {
          actorId: event.entity.userId,
          resourceId: event.entity.resourceId,
          type: ResourceEventTypes.MEMBER_REMOVE,
          data: {}
        })
      )
    }
  }
}
