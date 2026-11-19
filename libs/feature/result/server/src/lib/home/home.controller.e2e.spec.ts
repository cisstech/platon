import { Module } from '@nestjs/common'
import { UserRoles } from '@platon/core/common'
import { UserGroupService, UserService } from '@platon/core/server'
import { createE2EApp, E2EContext, TestUser } from '@platon/core/testing/e2e-server'
import { CourseMemberRoles } from '@platon/feature/course/common'
import {
  ActivityCorrectorEntity,
  ActivityCorrectorView,
  ActivityEntity,
  ActivityGroupEntity,
  ActivityMemberEntity,
  CourseEntity,
  CourseGroupEntity,
  CourseGroupMemberEntity,
  CourseMemberEntity,
  CourseMemberService,
  CourseMemberView,
  CourseNotificationService,
  CourseSectionEntity,
} from '@platon/feature/course/server'
import { ResourceEntity } from '@platon/feature/resource/server'
import { AnswerEntity } from '../answers/answer.entity'
import { CorrectionEntity } from '../correction/correction.entity'
import { SessionEntity } from '../sessions/session.entity'
import { StudentSubmissionEntity } from '../submissions/submission.entity'
import { HomeController } from './home.controller'
import { HomeService } from './home.service'

const request = require('supertest')

/** What the routes under test never call. */
@Module({
  providers: [
    { provide: CourseNotificationService, useValue: {} },
    { provide: UserGroupService, useValue: {} },
    { provide: UserService, useValue: {} },
  ],
  exports: [CourseNotificationService, UserGroupService, UserService],
})
class UnusedServicesModule {}

let ctx: E2EContext
let ines: TestUser
let bob: TestUser
let demo: TestUser
let teacher: TestUser
let admin: TestUser
let course: CourseEntity

const http = () => request(ctx.app.getHttpServer())
const auth = ({ token }: TestUser) => ({ Authorization: `Bearer ${token}` })

beforeAll(async () => {
  ctx = await createE2EApp({
    entities: [
      ResourceEntity,
      CourseEntity,
      CourseSectionEntity,
      CourseMemberEntity,
      CourseMemberView,
      CourseGroupEntity,
      CourseGroupMemberEntity,
      ActivityEntity,
      ActivityMemberEntity,
      ActivityGroupEntity,
      ActivityCorrectorEntity,
      ActivityCorrectorView,
      CorrectionEntity,
      StudentSubmissionEntity,
      AnswerEntity,
      SessionEntity,
    ],
    controllers: [HomeController],
    providers: [HomeService, CourseMemberService],
    imports: [UnusedServicesModule],
  })

  ines = await ctx.createUser({ username: 'ines-e2e', role: UserRoles.student })
  bob = await ctx.createUser({ username: 'bob-e2e', role: UserRoles.student })
  demo = await ctx.createUser({ username: 'demo-e2e', role: UserRoles.demo })
  teacher = await ctx.createUser({ username: 'teacher-e2e', role: UserRoles.teacher })
  admin = await ctx.createUser({ username: 'admin-e2e', role: UserRoles.admin })

  course = await ctx.getRepository(CourseEntity).save({ name: 'AP1', ownerId: teacher.user.id })
  const section = await ctx.getRepository(CourseSectionEntity).save({ name: 'Section', order: 0, courseId: course.id })
  await ctx.getRepository(CourseMemberEntity).save([
    { courseId: course.id, userId: ines.user.id, role: CourseMemberRoles.student },
    { courseId: course.id, userId: demo.user.id, role: CourseMemberRoles.student },
    { courseId: course.id, userId: teacher.user.id, role: CourseMemberRoles.teacher },
  ])
  const activity = await ctx.getRepository(ActivityEntity).save({
    courseId: course.id,
    sectionId: section.id,
    creatorId: teacher.user.id,
    ignoreRestrictions: false,
    restrictions: [{ restriction: [{ type: 'Others', config: { enabled: true } }] }],
    source: { resource: 'none', version: 'latest', variables: { title: 'TP 1', exerciseGroups: {} } } as never,
  })
  await ctx.getRepository(SessionEntity).save({
    activityId: activity.id,
    userId: ines.user.id,
    startedAt: new Date(),
    terminatedAt: new Date(),
    variables: { navigation: { started: true, terminated: true, exercises: [] } },
    source: { resource: 'none', version: 'latest' } as never,
  })
}, 60_000)

afterAll(async () => {
  await ctx.app.close()
  await ctx.db.teardown()
})

describe('home routes', () => {
  it.each(['/activities/mine', '/activities/taught', '/results/recent'])('refuses %s without a token', async (path) => {
    await http().get(path).expect(401)
  })

  it('gives a student the activities they play, without the code nor the restrictions', async () => {
    const { body } = await http().get('/activities/mine').set(auth(ines)).expect(200)

    expect(body.total).toBe(1)
    expect(body.resources[0]).toMatchObject({ title: 'TP 1', courseName: 'AP1', state: 'opened', started: true })
    expect(body.resources[0]).not.toHaveProperty('code')
    expect(body.resources[0]).not.toHaveProperty('restrictions')
  })

  it('answers a demo account', async () => {
    const { body } = await http().get('/activities/mine').set(auth(demo)).expect(200)

    expect(body.resources[0]).toMatchObject({ title: 'TP 1', started: false })
  })

  it('gives a person who studies no course no activity', async () => {
    const { body } = await http().get('/activities/mine').set(auth(bob)).expect(200)

    expect(body.resources).toEqual([])
  })

  it('gives a person their own copies only', async () => {
    const own = await http().get('/results/recent').set(auth(ines)).expect(200)
    const other = await http().get('/results/recent').set(auth(bob)).expect(200)

    expect(own.body.resources).toEqual([expect.objectContaining({ activityTitle: 'TP 1', status: 'hidden' })])
    expect(other.body.resources).toEqual([])
  })

  it('gives the activities of one course, with the place of each and what the page of the course says', async () => {
    const studied = await http().get('/activities/mine').query({ course: course.id }).set(auth(ines)).expect(200)
    const taught = await http().get('/activities/taught').query({ course: course.id }).set(auth(teacher)).expect(200)

    expect(studied.body.resources).toEqual([
      expect.objectContaining({ title: 'TP 1', sectionId: expect.any(String), order: 0, correcting: false }),
    ])
    expect(taught.body.resources).toEqual([
      expect.objectContaining({ title: 'TP 1', pendingCopies: 0, correctors: [], exerciseCount: 0 }),
    ])
  })

  it('refuses a course that is not an identifier', async () => {
    await http().get('/activities/mine').query({ course: 'ap1' }).set(auth(ines)).expect(400)
  })

  it('gives a teacher the activities of their courses, and a student none', async () => {
    const taught = await http().get('/activities/taught').set(auth(teacher)).expect(200)
    const studied = await http().get('/activities/taught').set(auth(ines)).expect(200)

    expect(taught.body.resources).toEqual([
      expect.objectContaining({ title: 'TP 1', studentCount: 2, startedCount: 1 }),
    ])
    expect(studied.body.resources).toEqual([])
  })

  it('gives an administrator every activity of a course they open, and none on their home', async () => {
    const opened = await http().get('/activities/taught').query({ course: course.id }).set(auth(admin)).expect(200)
    const home = await http().get('/activities/taught').set(auth(admin)).expect(200)

    expect(opened.body.resources).toEqual([expect.objectContaining({ title: 'TP 1' })])
    expect(home.body.resources).toEqual([])
  })

  it('gives a student nothing of a course as its teacher reads it', async () => {
    const { body } = await http().get('/activities/taught').query({ course: course.id }).set(auth(ines)).expect(200)

    expect(body.resources).toEqual([])
  })
})
