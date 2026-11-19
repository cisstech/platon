import { NestKitExpandModule } from '@cisstech/nestjs-expand'
import { Module } from '@nestjs/common'
import { UserRoles } from '@platon/core/common'
import { AuthService, UserEntity, UserGroupEntity, UserGroupService } from '@platon/core/server'
import { createE2EApp, E2EContext, TestUser } from '@platon/core/testing/e2e-server'
import { Course, CourseMemberRoles } from '@platon/feature/course/common'
import { ActivityGroupService } from './activity-group/activity-group.service'
import { ActivityMemberService } from './activity-member/activity-member.service'
import { ActivityService } from './activity/activity.service'
import { CourseGroupMemberController } from './course-group-member/course-group-member.controller'
import { CourseGroupMemberEntity } from './course-group-member/course-group-member.entity'
import { CourseGroupMemberService } from './course-group-member/course-group-member.service'
import { CourseGroupController } from './course-group/course-group.controller'
import { CourseGroupEntity } from './course-group/course-group.entity'
import { CourseGroupService } from './course-group/course-group.service'
import { CourseMemberController } from './course-member/course-member.controller'
import { CourseMemberEntity } from './course-member/course-member.entity'
import { CourseMemberService } from './course-member/course-member.service'
import { CourseMemberView } from './course-member/course-member.view'
import { CourseNotificationService } from './course-notification/course-notification.service'
import { CourseController } from './course.controller'
import { CourseExpander } from './course.expander'
import { CourseEntity } from './entites/course.entity'
import { CoursePermissionsService } from './permissions/permissions.service'
import { CourseSectionController } from './section/section.controller'
import { CourseSectionEntity } from './section/section.entity'
import { CourseSectionService } from './section/section.service'
import { CourseService } from './services/course.service'

const request = require('supertest')

/** What the routes under test never call. */
@Module({
  providers: [
    { provide: CourseNotificationService, useValue: {} },
    { provide: UserGroupService, useValue: {} },
    { provide: AuthService, useValue: {} },
    { provide: ActivityMemberService, useValue: {} },
    { provide: ActivityGroupService, useValue: {} },
    { provide: ActivityService, useValue: {} },
  ],
  exports: [
    CourseNotificationService,
    UserGroupService,
    AuthService,
    ActivityMemberService,
    ActivityGroupService,
    ActivityService,
  ],
})
class UnusedServicesModule {}

let ctx: E2EContext
let admin: TestUser
let karim: TestUser
let ines: TestUser
let hugo: TestUser
let bob: TestUser
let julie: TestUser
let algebra: CourseEntity
let analysis: CourseEntity
let section: CourseSectionEntity

const http = () => request(ctx.app.getHttpServer())
const auth = ({ token }: TestUser) => ({ Authorization: `Bearer ${token}` })
const names = (courses: Course[]) => courses.map(({ name }) => name)

beforeAll(async () => {
  ctx = await createE2EApp({
    entities: [
      CourseEntity,
      CourseMemberEntity,
      CourseMemberView,
      CourseSectionEntity,
      CourseGroupEntity,
      CourseGroupMemberEntity,
    ],
    controllers: [
      CourseController,
      CourseMemberController,
      CourseSectionController,
      CourseGroupController,
      CourseGroupMemberController,
    ],
    providers: [
      CourseService,
      CourseMemberService,
      CourseExpander,
      CoursePermissionsService,
      CourseSectionService,
      CourseGroupService,
      CourseGroupMemberService,
    ],
    imports: [UnusedServicesModule, NestKitExpandModule.forRoot({ expandQueryParamName: 'expands' })],
  })

  admin = await ctx.createUser({ username: 'admin-e2e', role: UserRoles.admin })
  karim = await ctx.createUser({
    username: 'karim-e2e',
    role: UserRoles.teacher,
    firstName: 'Karim',
    lastName: 'Haddad',
  })
  ines = await ctx.createUser({ username: 'ines-e2e', role: UserRoles.student })
  hugo = await ctx.createUser({ username: 'hugo-e2e', role: UserRoles.student })
  bob = await ctx.createUser({ username: 'bob-e2e', role: UserRoles.student })
  julie = await ctx.createUser({ username: 'julie-e2e', role: UserRoles.teacher })

  const courses = ctx.getRepository(CourseEntity)
  const members = ctx.getRepository(CourseMemberEntity)
  const group = await ctx.getRepository(UserGroupEntity).save({ name: 'L1 groupe A', users: [hugo.user] })
  algebra = await courses.save({ name: 'Algèbre 1', ownerId: karim.user.id })
  analysis = await courses.save({ name: 'Analyse 1', ownerId: karim.user.id })
  const java = await courses.save({ name: 'Java L3', ownerId: karim.user.id })
  await members.save([
    { courseId: algebra.id, userId: karim.user.id, role: CourseMemberRoles.teacher },
    { courseId: algebra.id, userId: ines.user.id, role: CourseMemberRoles.student },
    { courseId: algebra.id, groupId: group.id, role: CourseMemberRoles.student },
    { courseId: analysis.id, userId: karim.user.id, role: CourseMemberRoles.teacher },
    { courseId: analysis.id, userId: ines.user.id, role: CourseMemberRoles.student },
    { courseId: java.id, userId: karim.user.id, role: CourseMemberRoles.teacher },
    { courseId: java.id, userId: bob.user.id, role: CourseMemberRoles.student },
  ])
  section = await ctx.getRepository(CourseSectionEntity).save({ courseId: algebra.id, name: 'Semaine 1', order: 0 })
  await ctx.getRepository(CourseGroupEntity).save({ courseId: algebra.id, groupId: 'td-1', name: 'TD 1' })
  await ctx.getRepository(CourseGroupMemberEntity).save({ groupId: 'td-1', userId: ines.user.id })
}, 60_000)

afterAll(async () => {
  await ctx.app.close()
  await ctx.db.teardown()
})

afterEach(async () => {
  await ctx.getRepository(CourseMemberEntity).query('UPDATE "CourseMembers" SET archived = FALSE')
})

describe('GET /courses', () => {
  it('lists only their own courses to a person who asks for those of another, or for the whole platform', async () => {
    const { body } = await http()
      .get('/courses')
      .query({ members: karim.user.id, showAll: 'true', order: 'NAME' })
      .set(auth(ines))
      .expect(200)

    expect(names(body.resources)).toEqual(['Algèbre 1', 'Analyse 1'])
    expect(body.total).toBe(2)
  })

  it('lists the courses of a person through their groups too', async () => {
    const { body } = await http().get('/courses').set(auth(hugo)).expect(200)

    expect(names(body.resources)).toEqual(['Algèbre 1'])
  })

  it('pages the whole platform by courses for an administrator', async () => {
    const { body } = await http()
      .get('/courses')
      .query({ showAll: 'true', order: 'NAME', offset: 2, limit: 2 })
      .set(auth(admin))
      .expect(200)

    expect(names(body.resources)).toEqual(['Java L3'])
    expect(body.total).toBe(3)
  })

  it('sends the name of the owner of each course, and nothing else of them', async () => {
    const { body } = await http().get('/courses').query({ order: 'NAME' }).set(auth(ines)).expect(200)

    expect(body.resources[0].owner).toEqual({
      id: karim.user.id,
      username: 'karim-e2e',
      firstName: 'Karim',
      lastName: 'Haddad',
    })
  })
})

describe('Archiving a course for oneself', () => {
  const permissionsOf = async (person: TestUser) => {
    const { body } = await http().get('/courses').query({ expands: 'permissions' }).set(auth(person)).expect(200)
    return (body.resources as Course[]).find(({ id }) => id === algebra.id)?.permissions
  }

  it('is offered to a direct member, who may do it, and the course leaves their current courses', async () => {
    expect(await permissionsOf(ines)).toEqual({ update: false, archive: true })

    await http().patch(`/courses/${algebra.id}/members/me`).send({ archived: true }).set(auth(ines)).expect(200)

    const archived = await http().get('/courses').query({ archived: 'true' }).set(auth(ines)).expect(200)
    const current = await http().get('/courses').query({ archived: 'false' }).set(auth(ines)).expect(200)
    expect(names(archived.body.resources)).toEqual(['Algèbre 1'])
    expect(names(current.body.resources)).toEqual(['Analyse 1'])
  })

  it('is neither offered nor allowed to a member through a group', async () => {
    expect(await permissionsOf(hugo)).toEqual({ update: false, archive: false })

    await http().patch(`/courses/${algebra.id}/members/me`).send({ archived: true }).set(auth(hugo)).expect(404)
  })

  it('stays with the person who archived the course', async () => {
    await http().patch(`/courses/${algebra.id}/members/me`).send({ archived: true }).set(auth(ines)).expect(200)

    const { body } = await http().get('/courses').query({ archived: 'false' }).set(auth(karim)).expect(200)
    expect(names(body.resources)).toContain('Algèbre 1')
  })
})

describe('GET /courses/:id', () => {
  it('gives a member the course with the name of its owner, and refuses anyone else', async () => {
    const { body } = await http().get(`/courses/${algebra.id}`).set(auth(ines)).expect(200)

    expect(body.resource.owner).toEqual({
      id: karim.user.id,
      username: 'karim-e2e',
      firstName: 'Karim',
      lastName: 'Haddad',
    })
    await http().get(`/courses/${algebra.id}`).set(auth(bob)).expect(403)
  })
})

describe('The sections, members and groups of a course', () => {
  it.each([
    ['sections', () => `/courses/${algebra.id}/sections`],
    ['members', () => `/courses/${algebra.id}/members`],
    ['groups', () => `/courseGroups/${algebra.id}`],
    ['members of a group', () => `/courseGroupMembers/${algebra.id}/td-1`],
  ])('are read by its members, through a group too, and an administrator, by no one else: %s', async (_, path) => {
    for (const person of [ines, hugo, karim, admin]) await http().get(path()).set(auth(person)).expect(200)

    await http().get(path()).set(auth(bob)).expect(403)
  })

  it('are written only by who may change the course', async () => {
    const asJulie = [
      () => http().post(`/courses/${algebra.id}/sections`).send({ name: 'Semaine 2', order: 1 }),
      () => http().patch(`/courses/${algebra.id}/sections/${section.id}`).send({ name: 'Volée' }),
      () => http().delete(`/courses/${algebra.id}/sections/${section.id}`),
      () => http().post(`/courseGroups/${algebra.id}`),
      () => http().patch(`/courseGroups/${algebra.id}/td-1`).send({ name: 'Volé' }),
      () => http().delete(`/courseGroups/${algebra.id}/td-1`),
      () => http().post(`/courseGroupMembers/${algebra.id}/td-1/${hugo.user.id}`),
      () => http().delete(`/courseGroupMembers/${algebra.id}/td-1/${ines.user.id}`),
    ]
    for (const call of asJulie) await call().set(auth(julie)).expect(403)

    const sections = await ctx.getRepository(CourseSectionEntity).find({ where: { courseId: algebra.id } })
    expect(sections.map(({ id, name }) => ({ id, name }))).toEqual([{ id: section.id, name: 'Semaine 1' }])
    const groups = await ctx.getRepository(CourseGroupEntity).find({ where: { courseId: algebra.id } })
    expect(groups.map(({ groupId, name }) => ({ groupId, name }))).toEqual([{ groupId: 'td-1', name: 'TD 1' }])
    const inTd1 = await ctx.getRepository(CourseGroupMemberEntity).find({ where: { groupId: 'td-1' } })
    expect(inTd1.map(({ userId }) => userId)).toEqual([ines.user.id])
  })

  it('never move a section or a group to another course, whatever the body says', async () => {
    await http()
      .patch(`/courses/${algebra.id}/sections/${section.id}`)
      .send({ name: 'Semaine 1', courseId: analysis.id })
      .set(auth(karim))
      .expect(200)
    await http()
      .patch(`/courseGroups/${algebra.id}/td-1`)
      .send({ name: 'TD 1', courseId: analysis.id, groupId: 'moved' })
      .set(auth(karim))
      .expect(200)

    expect(await ctx.getRepository(CourseSectionEntity).findOneBy({ id: section.id })).toMatchObject({
      courseId: algebra.id,
    })
    expect(await ctx.getRepository(CourseGroupEntity).findOneBy({ courseId: algebra.id, groupId: 'td-1' })).toBeTruthy()
  })

  it('give the members of a group as the course shows its members, without what only their account knows', async () => {
    await ctx.getRepository(UserEntity).update(ines.user.id, { password: 'bcrypt-hash' })

    const { body } = await http().get(`/courseGroupMembers/${algebra.id}/td-1`).set(auth(hugo)).expect(200)

    expect(body.resources).toEqual([expect.objectContaining({ userId: ines.user.id })])
    expect(body.resources[0].user).not.toHaveProperty('password')
  })

  it('tell apart the groups of two courses that share an identifier', async () => {
    await ctx.getRepository(CourseGroupEntity).save([
      { courseId: algebra.id, groupId: 'lti-1', name: 'Groupe 1' },
      { courseId: analysis.id, groupId: 'lti-1', name: 'Groupe 1' },
    ])

    await http().patch(`/courseGroups/${analysis.id}/lti-1`).send({ name: 'TP 1' }).set(auth(karim)).expect(200)
    await http().delete(`/courseGroups/${analysis.id}/lti-1`).set(auth(karim)).expect(200)

    const left = await ctx.getRepository(CourseGroupEntity).find({ where: { groupId: 'lti-1' } })
    expect(left.map(({ courseId, name }) => ({ courseId, name }))).toEqual([{ courseId: algebra.id, name: 'Groupe 1' }])
  })

  it('touch only a group of the course in the address', async () => {
    await http().patch(`/courseGroups/${analysis.id}/td-1`).send({ name: 'Volé' }).set(auth(karim)).expect(404)
    await http().delete(`/courseGroupMembers/${analysis.id}/td-1/${ines.user.id}`).set(auth(karim)).expect(404)
  })
})
