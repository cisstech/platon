import { UserRoles } from '@platon/core/common'
import { UserEntity, UserGroupEntity } from '@platon/core/server'
import { createTestDatabase, TestDatabase } from '@platon/core/testing/server'
import { CourseMemberRoles } from '@platon/feature/course/common'
import { DataSource } from 'typeorm'
import { CourseGroupMemberEntity } from '../course-group-member/course-group-member.entity'
import { CourseGroupEntity } from '../course-group/course-group.entity'
import { CourseEntity } from '../entites/course.entity'
import { CourseMemberEntity } from './course-member.entity'
import { CourseMemberService } from './course-member.service'

describe('CourseMemberService.restrictionSubject (integration)', () => {
  let testDb: TestDatabase
  let dataSource: DataSource
  let service: CourseMemberService

  const save = <T extends object>(entity: new () => T, values: Partial<T>) =>
    dataSource.getRepository(entity).save(dataSource.getRepository(entity).create(values as T))

  beforeAll(async () => {
    testDb = await createTestDatabase([
      UserEntity,
      UserGroupEntity,
      CourseEntity,
      CourseMemberEntity,
      CourseGroupEntity,
      CourseGroupMemberEntity,
    ])
    dataSource = testDb.dataSource
    const members = dataSource.getRepository(CourseMemberEntity)
    service = new CourseMemberService({} as never, {} as never, {} as never, {} as never, members)
  }, 60_000)

  afterAll(async () => {
    await testDb.teardown()
  })

  it('gives the member rows and the course groups that hold the person in that course only', async () => {
    const ines = await save(UserEntity, { username: 'ines', role: UserRoles.student })
    const bob = await save(UserEntity, { username: 'bob', role: UserRoles.student })
    const promo = await save(UserGroupEntity, { name: 'Promo', users: [ines, bob] })
    const other = await save(UserGroupEntity, { name: 'Autre', users: [bob] })
    const ap1 = await save(CourseEntity, { name: 'AP1', ownerId: bob.id })
    const ap2 = await save(CourseEntity, { name: 'AP2', ownerId: bob.id })

    const own = await save(CourseMemberEntity, { courseId: ap1.id, userId: ines.id, role: CourseMemberRoles.student })
    const throughPromo = await save(CourseMemberEntity, { courseId: ap1.id, groupId: promo.id })
    await save(CourseMemberEntity, { courseId: ap1.id, groupId: other.id })
    await save(CourseMemberEntity, { courseId: ap2.id, groupId: promo.id })

    const tdA = await save(CourseGroupEntity, { courseId: ap1.id, groupId: 'td-a', name: 'TD A' })
    await save(CourseGroupEntity, { courseId: ap1.id, groupId: 'td-b', name: 'TD B' })
    await save(CourseGroupEntity, { courseId: ap2.id, groupId: 'td-c', name: 'TD C' })
    await save(CourseGroupMemberEntity, { groupId: 'td-a', userId: ines.id })
    await save(CourseGroupMemberEntity, { groupId: 'td-b', userId: bob.id })
    await save(CourseGroupMemberEntity, { groupId: 'td-c', userId: ines.id })

    const subject = await service.restrictionSubject(ap1.id, ines.id)

    expect(subject.userId).toBe(ines.id)
    expect([...subject.memberIds].sort()).toEqual([own.id, throughPromo.id].sort())
    expect([...subject.groupIds]).toEqual([tdA.id])
  })
})
