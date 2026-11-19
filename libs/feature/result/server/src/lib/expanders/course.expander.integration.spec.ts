import { ExpandContext } from '@cisstech/nestjs-expand'
import { UserRoles } from '@platon/core/common'
import { IRequest, LevelEntity, TopicEntity, UserEntity, UserGroupEntity } from '@platon/core/server'
import { createTestDatabase, TestDatabase } from '@platon/core/testing/server'
import { CourseMemberRoles } from '@platon/feature/course/common'
import {
  ActivityCorrectorEntity,
  ActivityEntity,
  ActivityGroupEntity,
  ActivityMemberEntity,
  ActivityMemberView,
  CourseDTO,
  CourseEntity,
  CourseGroupEntity,
  CourseGroupMemberEntity,
  CourseMemberEntity,
  CourseMemberService,
  CourseMemberView,
  CourseSectionEntity,
} from '@platon/feature/course/server'
import { ResourceEntity } from '@platon/feature/resource/server'
import { DataSource } from 'typeorm'
import { AnswerEntity } from '../answers/answer.entity'
import { CorrectionEntity } from '../correction/correction.entity'
import { SessionEntity } from '../sessions/session.entity'
import { StudentSubmissionEntity } from '../submissions/submission.entity'
import { CourseExpander } from './course.expander'

describe('CourseExpander.statistic (integration)', () => {
  let testDb: TestDatabase
  let dataSource: DataSource
  let expander: CourseExpander

  const save = <T extends object>(entity: new () => T, values: Partial<T>) =>
    dataSource.getRepository(entity).save(dataSource.getRepository(entity).create(values as T))

  beforeAll(async () => {
    testDb = await createTestDatabase([
      UserEntity,
      UserGroupEntity,
      LevelEntity,
      TopicEntity,
      ResourceEntity,
      CourseEntity,
      CourseSectionEntity,
      CourseMemberEntity,
      CourseMemberView,
      CourseGroupEntity,
      CourseGroupMemberEntity,
      ActivityEntity,
      ActivityMemberEntity,
      ActivityMemberView,
      ActivityGroupEntity,
      ActivityCorrectorEntity,
      CorrectionEntity,
      StudentSubmissionEntity,
      AnswerEntity,
      SessionEntity,
    ])
    dataSource = testDb.dataSource
    const members = new CourseMemberService(
      {} as never,
      {} as never,
      {} as never,
      dataSource.getRepository(CourseMemberView),
      dataSource.getRepository(CourseMemberEntity)
    )
    expander = new CourseExpander(
      members,
      dataSource.getRepository(ActivityEntity),
      dataSource.getRepository(SessionEntity)
    )
  }, 60_000)

  afterAll(async () => {
    await testDb.teardown()
  })

  /**
   * Théo created the three activities of AP1 and teaches it with Tina. Inès and Bob study it, and the
   * catch-up session is for Bob alone. The administrator does not belong to it.
   */
  const world = async () => {
    const user = (username: string, role = UserRoles.student) => save(UserEntity, { username, role })
    const [theo, tina, ines, bob, admin] = [
      await user('theo', UserRoles.teacher),
      await user('tina', UserRoles.teacher),
      await user('ines'),
      await user('bob'),
      await user('admin', UserRoles.admin),
    ]
    const ap1 = await save(CourseEntity, { name: 'AP1', ownerId: theo.id })
    const section = await save(CourseSectionEntity, { name: 'Section', order: 0, courseId: ap1.id })
    const member = (userId: string, role = CourseMemberRoles.student) =>
      save(CourseMemberEntity, { courseId: ap1.id, userId, role })
    await member(theo.id, CourseMemberRoles.teacher)
    await member(tina.id, CourseMemberRoles.teacher)
    await member(ines.id)
    const bobRow = await member(bob.id)
    const activity = (title: string, isChallenge = false) =>
      save(ActivityEntity, {
        courseId: ap1.id,
        sectionId: section.id,
        creatorId: theo.id,
        isChallenge,
        source: { resource: 'none', version: 'latest', variables: { title } } as never,
      })
    await activity('TP 1')
    await activity('Quiz', true)
    const catchUp = await activity('Rattrapage')
    await save(ActivityMemberEntity, { activityId: catchUp.id, memberId: bobRow.id, userId: bob.id })
    return { ap1, tina, ines, bob, admin }
  }

  const statisticOf = (course: CourseEntity, user: UserEntity) =>
    expander.statistic({
      parent: { id: course.id, ownerId: course.ownerId } as CourseDTO,
      request: { user } as IRequest,
    } as ExpandContext<IRequest, CourseDTO>)

  it('counts every activity and challenge of a course for whoever manages it, and those open to a student', async () => {
    const { ap1, tina, ines, bob, admin } = await world()

    const counts = async (user: UserEntity) => {
      const { activityCount, challengeCount } = await statisticOf(ap1, user)
      return [activityCount, challengeCount]
    }

    expect(await counts(admin)).toEqual([3, 1])
    expect(await counts(tina)).toEqual([3, 1])
    expect(await counts(bob)).toEqual([3, 1])
    expect(await counts(ines)).toEqual([2, 1])
  })
})
