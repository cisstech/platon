import { UserRoles } from '@platon/core/common'
import { createE2EApp, E2EContext, TestUser } from '@platon/core/testing/e2e-server'

const request = require('supertest')
import { Repository } from 'typeorm'
import { AnnouncementEntity } from './announcement.entity'
import { AnnouncementService } from './announcement.service'
import { AnnouncementController } from './announcement.controller'

/**
 * Tests E2E du module Announcement avec authentification réelle.
 */

let ctx: E2EContext
let announcementRepo: Repository<AnnouncementEntity>
let admin: TestUser
let teacher: TestUser
let student: TestUser
let demo: TestUser

const http = () => request(ctx.app.getHttpServer())

beforeAll(async () => {
  ctx = await createE2EApp({
    entities: [AnnouncementEntity],
    controllers: [AnnouncementController],
    providers: [AnnouncementService],
  })

  admin = await ctx.createUser({ username: 'admin-e2e', role: UserRoles.admin })
  teacher = await ctx.createUser({ username: 'teacher-e2e', role: UserRoles.teacher })
  student = await ctx.createUser({ username: 'student-e2e', role: UserRoles.student })
  demo = await ctx.createUser({ username: 'demo-e2e', role: UserRoles.demo })

  announcementRepo = ctx.getRepository(AnnouncementEntity)
}, 60_000)

afterAll(async () => {
  await ctx.app.close()
  await ctx.db.teardown()
})

afterEach(async () => {
  await announcementRepo.query('TRUNCATE "Announcements" CASCADE')
})

const auth = (token: string) => ({ Authorization: `Bearer ${token}` })

describe('Authentication & Authorization', () => {
  it('should return 401 when no token is provided', async () => {
    await http().get('/announcements').expect(401)
  })

  it('should return 403 when teacher tries to list announcements (admin-only)', async () => {
    await http().get('/announcements').set(auth(teacher.token)).expect(403)
  })

  it('should return 403 when student tries to list announcements (admin-only)', async () => {
    await http().get('/announcements').set(auth(student.token)).expect(403)
  })

  it('should return 403 when teacher tries to get announcement by id (admin-only)', async () => {
    const created = await announcementRepo.save(
      announcementRepo.create({ title: 'Test', description: 'Desc', active: true })
    )
    await http().get(`/announcements/${created.id}`).set(auth(teacher.token)).expect(403)
  })

  it('should return 403 when student tries to update an announcement (admin-only)', async () => {
    const created = await announcementRepo.save(
      announcementRepo.create({ title: 'Test', description: 'Desc', active: true })
    )
    await http()
      .patch(`/announcements/${created.id}`)
      .set(auth(student.token))
      .send({ title: 'Hacked', description: 'Desc', active: true })
      .expect(403)
  })

  it('should return 403 when teacher tries to delete an announcement (admin-only)', async () => {
    const created = await announcementRepo.save(
      announcementRepo.create({ title: 'Test', description: 'Desc', active: true })
    )
    await http().delete(`/announcements/${created.id}`).set(auth(teacher.token)).expect(403)
  })
})

describe('POST /announcements', () => {
  it('should create an announcement and return 201', async () => {
    const res = await http()
      .post('/announcements')
      .set(auth(admin.token))
      .send({ title: 'Hello', description: 'World', active: true })
      .expect(201)

    expect(res.body.resource).toMatchObject({
      title: 'Hello',
      description: 'World',
      active: true,
    })
    expect(res.body.resource.id).toBeDefined()
  })

  it('should return 400 when required fields are missing', async () => {
    await http().post('/announcements').set(auth(admin.token)).send({ title: 'No description' }).expect(400)
  })

  it('should return 403 when student tries to create', async () => {
    await http()
      .post('/announcements')
      .set(auth(student.token))
      .send({ title: 'Hello', description: 'World', active: true })
      .expect(403)
  })

  it('should return 403 when teacher tries to create', async () => {
    await http()
      .post('/announcements')
      .set(auth(teacher.token))
      .send({ title: 'Hello', description: 'World', active: true })
      .expect(403)
  })
})

describe('GET /announcements', () => {
  it('should return all announcements', async () => {
    await announcementRepo.save([
      announcementRepo.create({ title: 'A1', description: 'Desc1', active: true }),
      announcementRepo.create({ title: 'A2', description: 'Desc2', active: false }),
    ])

    const res = await http().get('/announcements').set(auth(admin.token)).expect(200)

    expect(res.body.total).toBe(2)
    expect(res.body.resources).toHaveLength(2)
  })

  it('should filter by search term (ILIKE)', async () => {
    await announcementRepo.save([
      announcementRepo.create({ title: 'Maintenance prévue', description: 'Desc', active: true }),
      announcementRepo.create({ title: 'Autre annonce', description: 'Desc', active: true }),
    ])

    const res = await http().get('/announcements').set(auth(admin.token)).query({ search: 'maintenance' }).expect(200)

    expect(res.body.total).toBe(1)
    expect(res.body.resources[0].title).toBe('Maintenance prévue')
  })

  it('should filter by active status', async () => {
    await announcementRepo.save([
      announcementRepo.create({ title: 'Active', description: 'Desc', active: true }),
      announcementRepo.create({ title: 'Inactive', description: 'Desc', active: false }),
    ])

    const res = await http().get('/announcements').set(auth(admin.token)).query({ active: 'true' }).expect(200)

    expect(res.body.total).toBe(1)
    expect(res.body.resources[0].title).toBe('Active')
  })
})

describe('GET /announcements/:id', () => {
  it('should return an announcement by id', async () => {
    const created = await announcementRepo.save(
      announcementRepo.create({ title: 'FindMe', description: 'Desc', active: true, publisher: admin.user })
    )

    const res = await http().get(`/announcements/${created.id}`).set(auth(admin.token)).expect(200)

    expect(res.body.resource.title).toBe('FindMe')
    expect(res.body.resource.publisher).toBeDefined()
  })

  it('should return 404 for non-existent id', async () => {
    await http().get('/announcements/00000000-0000-0000-0000-000000000000').set(auth(admin.token)).expect(404)
  })
})

describe('PATCH /announcements/:id', () => {
  it('should update an announcement', async () => {
    const created = await announcementRepo.save(
      announcementRepo.create({ title: 'Old', description: 'Desc', active: true })
    )

    const res = await http()
      .patch(`/announcements/${created.id}`)
      .set(auth(admin.token))
      .send({ title: 'New', description: 'Desc', active: true })
      .expect(200)

    expect(res.body.resource.title).toBe('New')
  })

  it('should return 403 when teacher tries to update', async () => {
    const created = await announcementRepo.save(
      announcementRepo.create({ title: 'Old', description: 'Desc', active: true })
    )
    await http()
      .patch(`/announcements/${created.id}`)
      .set(auth(teacher.token))
      .send({ title: 'Hacked', description: 'Desc', active: true })
      .expect(403)
  })
})

describe('DELETE /announcements/:id', () => {
  it('should delete an announcement', async () => {
    const created = await announcementRepo.save(
      announcementRepo.create({ title: 'ToDelete', description: 'Desc', active: true })
    )

    await http().delete(`/announcements/${created.id}`).set(auth(admin.token)).expect(200)

    const found = await announcementRepo.findOneBy({ id: created.id })
    expect(found).toBeNull()
  })

  it('should return 404 when deleting non-existent announcement', async () => {
    await http().delete('/announcements/00000000-0000-0000-0000-000000000000').set(auth(admin.token)).expect(404)
  })

  it('should return 403 when student tries to delete', async () => {
    const created = await announcementRepo.save(
      announcementRepo.create({ title: 'Protected', description: 'Desc', active: true })
    )
    await http().delete(`/announcements/${created.id}`).set(auth(student.token)).expect(403)
  })
})

describe('GET /announcements/visible', () => {
  it('should return only active announcements visible to the user role', async () => {
    await announcementRepo.save([
      announcementRepo.create({ title: 'ForAll', description: 'Desc', active: true, targetedRoles: [] }),
      announcementRepo.create({
        title: 'ForAdmin',
        description: 'Desc',
        active: true,
        targetedRoles: [UserRoles.admin],
      }),
      announcementRepo.create({
        title: 'ForStudent',
        description: 'Desc',
        active: true,
        targetedRoles: [UserRoles.student],
      }),
      announcementRepo.create({ title: 'Inactive', description: 'Desc', active: false }),
    ])

    const adminRes = await http().get('/announcements/visible').set(auth(admin.token)).expect(200)
    const adminTitles = adminRes.body.resources.map((r: { title: string }) => r.title)
    expect(adminTitles).toContain('ForAll')
    expect(adminTitles).toContain('ForAdmin')
    expect(adminTitles).not.toContain('Inactive')

    const teacherRes = await http().get('/announcements/visible').set(auth(teacher.token)).expect(200)
    const teacherTitles = teacherRes.body.resources.map((r: { title: string }) => r.title)
    expect(teacherTitles).toContain('ForAll')
    expect(teacherTitles).not.toContain('ForAdmin')
    expect(teacherTitles).not.toContain('ForStudent')
    expect(teacherTitles).not.toContain('Inactive')

    const studentRes = await http().get('/announcements/visible').set(auth(student.token)).expect(200)
    const studentTitles = studentRes.body.resources.map((r: { title: string }) => r.title)
    expect(studentTitles).toContain('ForAll')
    expect(studentTitles).toContain('ForStudent')
    expect(studentTitles).not.toContain('ForAdmin')
    expect(studentTitles).not.toContain('Inactive')
  })

  it('should answer a demo account with the announcements for everyone, list and detail', async () => {
    const [forAll] = await announcementRepo.save([
      announcementRepo.create({ title: 'ForAll', description: 'Desc', active: true, targetedRoles: [] }),
      announcementRepo.create({
        title: 'ForStudent',
        description: 'Desc',
        active: true,
        targetedRoles: [UserRoles.student],
      }),
    ])

    const list = await http().get('/announcements/visible').set(auth(demo.token)).expect(200)
    expect(list.body.resources.map((r: { title: string }) => r.title)).toEqual(['ForAll'])

    const detail = await http().get(`/announcements/visible/${forAll.id}`).set(auth(demo.token)).expect(200)
    expect(detail.body.resource.title).toBe('ForAll')
  })
})
