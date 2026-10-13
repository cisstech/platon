import { Mapper, UserEntity } from '@platon/core/server'
import { CourseDTO } from './course.dto'
import { CourseEntity } from './entites/course.entity'

describe('CourseDTO', () => {
  it('sends the name of the owner of a course, and nothing else of them', () => {
    const owner = Object.assign(new UserEntity(), {
      id: 'u1',
      username: 'karim.haddad',
      firstName: 'Karim',
      lastName: 'Haddad',
    })
    const course = Object.assign(new CourseEntity(), { id: 'c1', name: 'AP1', ownerId: 'u1', owner })

    expect(Mapper.map(course, CourseDTO).owner).toEqual({
      id: 'u1',
      username: 'karim.haddad',
      firstName: 'Karim',
      lastName: 'Haddad',
    })
  })

  it('sends no owner when the course comes without one', () => {
    const course = Object.assign(new CourseEntity(), { id: 'c1', name: 'AP1', ownerId: 'u1' })

    expect(Mapper.map(course, CourseDTO).owner).toBeUndefined()
  })
})
