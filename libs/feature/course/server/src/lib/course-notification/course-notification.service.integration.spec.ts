import { DiscoveryService } from '@golevelup/nestjs-discovery'
import { UserRoles } from '@platon/core/common'
import { PubSubService, UserEntity } from '@platon/core/server'
import { createTestDatabase, TestDatabase } from '@platon/core/testing/server'
import { NotificationEntity, NotificationService } from '@platon/feature/notification/server'
import { DataSource } from 'typeorm'
import { CourseMonitorPresenceService } from '../course-monitor-presence/course-monitor-presence.service'
import { CourseNotificationService } from './course-notification.service'

describe('CourseNotificationService (integration)', () => {
  let testDb: TestDatabase
  let dataSource: DataSource

  beforeAll(async () => {
    testDb = await createTestDatabase([UserEntity, NotificationEntity])
    dataSource = testDb.dataSource
  }, 60_000)

  afterAll(async () => {
    await testDb.teardown()
  })

  it("ne devrait pas compter comme non lus les signaux du suivi d'une activité et du lecteur", async () => {
    const notifications = new NotificationService(
      dataSource.getRepository(NotificationEntity),
      { providersWithMetaAtKey: jest.fn().mockResolvedValue([]) } as unknown as DiscoveryService,
      { publish: jest.fn().mockResolvedValue(undefined) } as unknown as PubSubService
    )
    new CourseNotificationService(dataSource, notifications, {} as CourseMonitorPresenceService).onModuleInit()
    const user = await dataSource.getRepository(UserEntity).save({
      username: 'course-notification-integration',
      firstName: 'Test',
      lastName: 'User',
      email: 'course-notification-integration@test.local',
      role: UserRoles.student,
      active: true,
      lastActivity: new Date(),
    })

    await notifications.sendToUser(user.id, { type: 'EXERCISE-CHANGES', userId: 'u2', changes: {} })
    await notifications.sendToUser(user.id, { type: 'MODERATION-ACTIVITY-CHANGES', activity: {} })
    await notifications.sendToUser(user.id, { type: 'CORRECTION-AVAILABLE', courseId: 'c1', activityId: 'a1' })

    expect(await notifications.unreadCount(user.id)).toBe(1)
  })
})
