import { UserRoles } from '@platon/core/common'
import { Mapper, UserEntity, UserGroupEntity } from '@platon/core/server'
import { createTestDatabase, TestDatabase } from '@platon/core/testing/server'
import { CourseMemberRoles, CourseOrderings } from '@platon/feature/course/common'
import { DataSource } from 'typeorm'
import { CourseMemberEntity } from '../course-member/course-member.entity'
import { CourseMemberView } from '../course-member/course-member.view'
import { CourseDTO } from '../course.dto'
import { CourseEntity } from '../entites/course.entity'
import { CourseService } from './course.service'

describe('CourseService.search (integration)', () => {
  let testDb: TestDatabase
  let dataSource: DataSource
  let service: CourseService

  const save = <T extends object>(entity: new () => T, values: Partial<T>) =>
    dataSource.getRepository(entity).save(dataSource.getRepository(entity).create(values as T))

  beforeAll(async () => {
    testDb = await createTestDatabase([UserEntity, UserGroupEntity, CourseEntity, CourseMemberEntity, CourseMemberView])
    dataSource = testDb.dataSource
    service = new CourseService(dataSource, dataSource.getRepository(CourseEntity))
  }, 60_000)

  afterAll(async () => {
    await testDb.teardown()
  })

  afterEach(async () => {
    await dataSource.query('TRUNCATE "CourseMembers" CASCADE')
    await dataSource.query('TRUNCATE "Courses" CASCADE')
    await dataSource.query('TRUNCATE "Users" CASCADE')
    await dataSource.query('TRUNCATE "UserGroups" CASCADE')
  })

  const person = (username: string, role = UserRoles.student) =>
    save(UserEntity, {
      username,
      firstName: username[0].toUpperCase() + username.slice(1),
      lastName: 'Martin',
      email: `${username}@example.com`,
      role,
    })

  /** A course with its owner and two students, each a row of the member view. */
  const course = async (name: string, owner: UserEntity, students: UserEntity[]) => {
    const saved = await save(CourseEntity, { name, ownerId: owner.id })
    await save(CourseMemberEntity, { courseId: saved.id, userId: owner.id, role: CourseMemberRoles.teacher })
    for (const student of students) {
      await save(CourseMemberEntity, { courseId: saved.id, userId: student.id, role: CourseMemberRoles.student })
    }
    return saved
  }

  it('pages the whole platform by courses, not by the rows of their members', async () => {
    const karim = await person('karim', UserRoles.teacher)
    const students = [await person('ines'), await person('hugo')]
    for (const name of ['Algèbre 1', 'Analyse 1', 'Java L3']) await course(name, karim, students)

    const [first, total] = await service.search({ showAll: true, order: CourseOrderings.NAME, limit: 2 })
    const [next] = await service.search({ showAll: true, order: CourseOrderings.NAME, offset: 2, limit: 2 })

    expect(total).toBe(3)
    expect(first.map(({ name }) => name)).toEqual(['Algèbre 1', 'Analyse 1'])
    expect(next.map(({ name }) => name)).toEqual(['Java L3'])
  })

  it('pages them in every order, the most recently updated first by default', async () => {
    const karim = await person('karim', UserRoles.teacher)
    const students = [await person('ines'), await person('hugo')]
    for (const name of ['Algèbre 1', 'Analyse 1', 'Java L3']) await course(name, karim, students)

    for (const order of [undefined, CourseOrderings.CREATED_AT, CourseOrderings.UPDATED_AT]) {
      const [page, total] = await service.search({ showAll: true, order, limit: 2 })
      expect([page.length, total]).toEqual([2, 3])
    }
    const [[latest]] = await service.search({ showAll: true, limit: 1 })
    expect(latest.name).toBe('Java L3')
  })

  it('sends the name of the owner of each course, and nothing else of them', async () => {
    const karim = await person('karim', UserRoles.teacher)
    const ines = await person('ines')
    await course('AP1', karim, [ines])

    const [[found]] = await service.search({ members: [ines.id] })

    expect(Mapper.map(found, CourseDTO).owner).toEqual({
      id: karim.id,
      username: 'karim',
      firstName: 'Karim',
      lastName: 'Martin',
    })
  })

  it('finds the courses of a person, their own and those of their groups, and no other', async () => {
    const karim = await person('karim', UserRoles.teacher)
    const [ines, hugo, bob] = [await person('ines'), await person('hugo'), await person('bob')]
    const group = await save(UserGroupEntity, { name: 'L1 groupe A', users: [hugo] })
    const algebra = await course('Algèbre 1', karim, [ines])
    await save(CourseMemberEntity, { courseId: algebra.id, groupId: group.id, role: CourseMemberRoles.student })
    await course('Analyse 1', karim, [ines])
    await course('Java L3', karim, [bob])

    const [ofInes, total] = await service.search({ members: [ines.id], order: CourseOrderings.NAME })
    const [ofHugo] = await service.search({ members: [hugo.id], order: CourseOrderings.NAME })

    expect(ofInes.map(({ name }) => name)).toEqual(['Algèbre 1', 'Analyse 1'])
    expect(total).toBe(2)
    expect(ofHugo.map(({ name }) => name)).toEqual(['Algèbre 1'])
  })

  it('keeps a course archived by a person in their archives, and in the current courses of the others', async () => {
    const karim = await person('karim', UserRoles.teacher)
    const [ines, hugo] = [await person('ines'), await person('hugo')]
    const algebra = await course('Algèbre 1', karim, [ines, hugo])
    await course('Analyse 1', karim, [ines, hugo])
    await dataSource
      .getRepository(CourseMemberEntity)
      .update({ courseId: algebra.id, userId: ines.id }, { archived: true })

    const names = async (members: string[], archived: boolean) =>
      (await service.search({ members, archived, order: CourseOrderings.NAME }))[0].map(({ name }) => name)

    expect(await names([ines.id], true)).toEqual(['Algèbre 1'])
    expect(await names([ines.id], false)).toEqual(['Analyse 1'])
    expect(await names([hugo.id], true)).toEqual([])
    expect(await names([hugo.id], false)).toEqual(['Algèbre 1', 'Analyse 1'])
  })
})
