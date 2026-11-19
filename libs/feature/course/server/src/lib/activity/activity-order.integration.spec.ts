import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { UserRoles } from '@platon/core/common'
import { DatabaseService, EventService, UserEntity, UserGroupEntity } from '@platon/core/server'
import { createTestDatabase, TestDatabase } from '@platon/core/testing/server'
import { ResourceEntity, ResourceFileService, ResourceService } from '@platon/feature/resource/server'
import { CLS_REQ } from 'nestjs-cls'
import { DataSource, Repository } from 'typeorm'
import { ActivityGroupService } from '../activity-group/activity-group.service'
import { ActivityMemberService } from '../activity-member/activity-member.service'
import { CourseGroupMemberEntity } from '../course-group-member/course-group-member.entity'
import { CourseGroupEntity } from '../course-group/course-group.entity'
import { CourseMemberEntity } from '../course-member/course-member.entity'
import { CourseMemberService } from '../course-member/course-member.service'
import { CourseNotificationService } from '../course-notification/course-notification.service'
import { CourseEntity } from '../entites/course.entity'
import { CourseSectionEntity } from '../section/section.entity'
import { ActivityDatesService } from './activity-dates.service'
import { ActivityEntity } from './activity.entity'
import { ActivityService } from './activity.service'

/** The order of the activities of a course, written on a real Postgres. */
describe('ActivityService.updateActivitesOrder (integration)', () => {
  let testDb: TestDatabase
  let dataSource: DataSource
  let activities: Repository<ActivityEntity>
  let service: ActivityService

  beforeAll(async () => {
    testDb = await createTestDatabase([
      UserEntity,
      UserGroupEntity,
      CourseEntity,
      CourseMemberEntity,
      CourseGroupEntity,
      CourseSectionEntity,
      ActivityEntity,
    ])
    dataSource = testDb.dataSource
    activities = dataSource.getRepository(ActivityEntity)
    const unused = {}
    const module = await Test.createTestingModule({
      providers: [
        ActivityService,
        { provide: CLS_REQ, useValue: unused },
        { provide: ResourceFileService, useValue: unused },
        { provide: EventService, useValue: unused },
        { provide: DatabaseService, useValue: unused },
        { provide: CourseNotificationService, useValue: unused },
        { provide: ActivityMemberService, useValue: unused },
        { provide: CourseMemberService, useValue: unused },
        { provide: ActivityDatesService, useValue: unused },
        { provide: getRepositoryToken(ActivityEntity), useValue: activities },
        { provide: getRepositoryToken(ResourceEntity), useValue: unused },
        { provide: getRepositoryToken(CourseGroupMemberEntity), useValue: unused },
        { provide: ActivityGroupService, useValue: unused },
        { provide: ResourceService, useValue: unused },
      ],
    }).compile()
    service = module.get(ActivityService)
  }, 60_000)

  afterAll(async () => {
    await testDb.teardown()
  })

  const seedCourse = async (name: string) => {
    const owner = await dataSource.getRepository(UserEntity).save({
      username: `order-${name}`,
      firstName: 'Test',
      lastName: name,
      email: `order-${name}@test.local`,
      role: UserRoles.teacher,
      active: true,
      lastActivity: new Date(),
    })
    const course = await dataSource.getRepository(CourseEntity).save({ name, ownerId: owner.id })
    const section = await dataSource
      .getRepository(CourseSectionEntity)
      .save({ courseId: course.id, name: 'Section 1', order: 0 })
    const activity = (order: number) =>
      activities.save(
        activities.create({
          courseId: course.id,
          sectionId: section.id,
          creatorId: owner.id,
          order,
          source: { variables: {} } as never,
        })
      )
    return { course, activities: [await activity(0), await activity(1), await activity(2)] }
  }
  const orderOf = async (id: string) => (await activities.findOneByOrFail({ id })).order

  it('orders the activities of the course as given, and leaves those of another course as they were', async () => {
    const mine = await seedCourse('mine')
    const other = await seedCourse('other')
    const [a, b, c] = mine.activities
    const [foreign] = other.activities

    await service.updateActivitesOrder(mine.course.id, [c.id, foreign.id, 'not-an-id', a.id, b.id])

    expect([await orderOf(c.id), await orderOf(a.id), await orderOf(b.id)]).toEqual([0, 1, 2])
    expect(await orderOf(foreign.id)).toBe(0)
    expect(await orderOf(other.activities[1].id)).toBe(1)
  })

  it('writes nothing for ids of another course only', async () => {
    const mine = await seedCourse('mine-alone')
    const other = await seedCourse('other-alone')

    await service.updateActivitesOrder(mine.course.id, [other.activities[2].id, other.activities[0].id])

    expect(await orderOf(other.activities[2].id)).toBe(2)
    expect(await orderOf(other.activities[0].id)).toBe(0)
  })
})
