import { Injectable } from '@nestjs/common'
import { ResourceEventData, ResourceEventTypes, ResourceMemberCreateEventData } from '@platon/feature/resource/common'
import { DataSource, EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm'
import { ResourceEventEntity } from '../events'
import { ResourceEntity } from '../resource.entity'
import { ResourceWatcherEntity } from '../watchers'
import { ResourceMemberEntity } from './member.entity'

@Injectable()
export class ResourceMemberSubscriber implements EntitySubscriberInterface<ResourceMemberEntity> {
  constructor(private readonly dataSource: DataSource) {
    this.dataSource.subscribers.push(this)
  }

  listenTo() {
    return ResourceMemberEntity
  }

  async afterInsert(event: InsertEvent<ResourceMemberEntity>): Promise<void> {
    const [resource, watcher] = await Promise.all([
      event.manager.findOne(ResourceEntity, {
        where: {
          id: event.entity.resourceId,
        },
      }),
      event.manager.findOne(ResourceWatcherEntity, {
        where: {
          resourceId: event.entity.resourceId,
          userId: event.entity.userId,
        },
      }),
    ])

    if (!resource) {
      return
    }

    const data: ResourceMemberCreateEventData = {
      userId: event.entity.userId,
      resourceId: resource.id,
      resourceName: resource.name,
      resourceType: resource.type,
      parentName: resource.parent?.name || 'Inconnu',
    }

    await event.manager.save([
      event.manager.create(ResourceEventEntity, {
        actorId: event.entity.inviterId,
        resourceId: event.entity.resourceId,
        type: ResourceEventTypes.MEMBER_CREATE,
        data,
      }),
      ...(!watcher && event.entity.waiting
        ? [
            event.manager.create(ResourceWatcherEntity, {
              resourceId: event.entity.resourceId,
              userId: event.entity.userId,
            }),
          ]
        : []),
    ])
  }

  async afterUpdate(event: UpdateEvent<ResourceMemberEntity>): Promise<void> {
    if (event.entity && event.updatedColumns.find((col) => col.propertyName === 'waiting')) {
      const [resource, watcher] = await Promise.all([
        event.manager.findOne(ResourceEntity, {
          where: {
            id: event.entity.resourceId,
          },
        }),
        event.manager.findOne(ResourceWatcherEntity, {
          where: {
            resourceId: event.entity.resourceId,
            userId: event.entity.userId,
          },
        }),
      ])

      if (resource) {
        const data: ResourceMemberCreateEventData = {
          userId: event.entity.userId,
          resourceId: resource.id,
          resourceName: resource.name,
          resourceType: resource.type,
          parentName: resource.parent?.name || 'Inconnu',
        }

        await event.manager.save([
          event.manager.create(ResourceEventEntity, {
            actorId: event.entity.inviterId,
            resourceId: event.entity.resourceId,
            type: ResourceEventTypes.MEMBER_CREATE,
            data,
          }),
          ...(!watcher && event.entity.waiting
            ? [
                event.manager.create(ResourceWatcherEntity, {
                  resourceId: event.entity.resourceId,
                  userId: event.entity.userId,
                }),
              ]
            : []),
        ])
      }
    }
  }

  async afterRemove(event: RemoveEvent<ResourceMemberEntity>): Promise<void> {
    if (event.entity) {
      const [resource] = await Promise.all([
        event.manager.findOne(ResourceEntity, {
          where: {
            id: event.entity.resourceId,
          },
        }),
        event.manager.delete(ResourceWatcherEntity, {
          resourceId: event.entity.resourceId,
          userId: event.entity.userId,
        }),
      ])

      if (resource) {
        const data: ResourceEventData = {
          resourceId: resource.id,
          resourceName: resource.name,
          resourceType: resource.type,
          parentName: resource.parentId || 'Inconnu',
        }

        await event.manager.save(
          event.manager.create(ResourceEventEntity, {
            actorId: event.entity.userId,
            resourceId: event.entity.resourceId,
            type: ResourceEventTypes.MEMBER_REMOVE,
            data,
          })
        )
      }
    }
  }
}
