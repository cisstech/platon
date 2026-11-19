import { NestKitExpandModule } from '@cisstech/nestjs-expand'
import { Module } from '@nestjs/common'
import { UserRoles } from '@platon/core/common'
import { AuthService, UserGroupEntity, UserGroupService } from '@platon/core/server'
import { createE2EApp, E2EContext, TestUser } from '@platon/core/testing/e2e-server'
import { Course, CourseMemberRoles } from '@platon/feature/course/common'
import { CourseMemberController } from './course-member/course-member.controller'
import { CourseMemberEntity } from './course-member/course-member.entity'
import { CourseMemberService } from './course-member/course-member.service'
import { CourseMemberView } from './course-member/course-member.view'
import { CourseNotificationService } from './course-notification/course-notification.service'
import { CourseController } from './course.controller'
import { CourseExpander } from './course.expander'
import { CourseEntity } from './entites/course.entity'
import { CoursePermissionsService } from './permissions/permissions.service'
import { CourseService } from './services/course.service'

const request = require('supertest')

/** What the routes under test never call. */
@Module({
  providers: [
    { provide: CoursePermissionsService, useValue: {} },
    { provide: CourseNotificationService, useValue: {} },
    { provide: UserGroupService, useValue: {} },
    { provide: AuthService, useValue: {} },
  ],
  exports: [CoursePermissionsService, CourseNotificationService, UserGroupService, AuthService],
})
class UnusedServicesModule {}

let ctx: E2EContext
let admin: TestUser
let karim: TestUser
let ines: TestUser
let hugo: TestUser
let algebra: CourseEntity

const http = () => request(ctx.app.getHttpServer())
const auth = ({ token }: TestUser) => ({ Authorization: `Bearer ${token}` })
const names = (courses: Course[]) => courses.map(({ name }) => name)

beforeAll(async () => {
  ctx = await createE2EApp({
    entities: [CourseEntity, CourseMemberEntity, CourseMemberView],
    controllers: [CourseController, CourseMemberController],
    providers: [CourseService, CourseMemberService, CourseExpander],
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
  const bob = await ctx.createUser({ username: 'bob-e2e', role: UserRoles.student })

  const courses = ctx.getRepository(CourseEntity)
  const members = ctx.getRepository(CourseMemberEntity)
  const group = await ctx.getRepository(UserGroupEntity).save({ name: 'L1 groupe A', users: [hugo.user] })
  algebra = await courses.save({ name: 'Algèbre 1', ownerId: karim.user.id })
  const analysis = await courses.save({ name: 'Analyse 1', ownerId: karim.user.id })
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
