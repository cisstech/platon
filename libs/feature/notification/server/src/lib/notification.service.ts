import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { PubSubService } from '@platon/core/server'
import { NotificationFilters } from '@platon/feature/notification/common'
import { EntityManager, In, IsNull, Repository } from 'typeorm'
import { NotificationEntity } from './notification.entity'
import { ON_CHANGE_NOTIFICATIONS } from './notification.pubsub'

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repository: Repository<NotificationEntity>,

    private readonly pubSubService: PubSubService
  ) {}

  async sendToUser<T extends object>(
    userId: string,
    data: T,
    entityManager?: EntityManager
  ): Promise<NotificationEntity> {
    const newNotification = entityManager
      ? await entityManager.save(entityManager.create(NotificationEntity, { userId, data }))
      : await this.repository.save(this.repository.create({ userId, data }))
    await this.pubSubService.publish(ON_CHANGE_NOTIFICATIONS, {
      onChangeNotifications: {
        userId: newNotification.userId,
        newNotification,
      },
    })

    return newNotification
  }

  async sendToAllUsers<T extends object>(users: string[], data: T, entityManager?: EntityManager): Promise<void> {
    await Promise.all(
      users.map((userId) => {
        return this.sendToUser(userId, data, entityManager)
      })
    )
  }

  async ofUser(userId: string, filters: NotificationFilters = {}): Promise<[NotificationEntity[], number]> {
    const query = this.repository
      .createQueryBuilder('notification')
      .where('user_id = :userId', { userId })
      .orderBy('created_at', 'DESC')

    if (filters.unread) {
      query.andWhere('read_at IS NULL')
    }

    if (filters.offset) {
      query.offset(filters.offset)
    }

    if (filters.limit) {
      query.limit(filters.limit)
    }

    return query.getManyAndCount()
  }

  async markAsRead(ids: string[]): Promise<NotificationEntity[]> {
    await this.repository.update(ids, { readAt: new Date() })
    return this.repository.find({
      where: { id: In(ids) },
    })
  }

  async markAsUnread(ids: string[]): Promise<NotificationEntity[]> {
    await this.repository.update(ids, { readAt: null })
    return this.repository.find({
      where: { id: In(ids) },
    })
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    await this.repository.update(
      {
        userId,
        readAt: IsNull(),
      },
      { readAt: new Date() }
    )
    return true
  }

  async delete(ids: string[]): Promise<number> {
    await this.repository.delete(ids)
    return 1
  }

  async deleteAll(userId: string): Promise<number> {
    const result = await this.repository.delete({ userId })
    return result.affected || 0
  }

  async unreadCount(userId: string): Promise<number> {
    return this.repository.count({
      where: {
        userId,
        readAt: IsNull(),
      },
    })
  }

  notifyUserAboutChanges(userId: string): Promise<void> {
    return this.pubSubService.publish(ON_CHANGE_NOTIFICATIONS, {
      onChangeNotifications: {
        userId,
      },
    })
  }
}
