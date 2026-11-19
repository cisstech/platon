import { ExpandContext } from '@cisstech/nestjs-expand'
import { IRequest } from '@platon/core/server'
import { CourseMemberService } from './course-member/course-member.service'
import { CourseDTO } from './course.dto'
import { CourseExpander } from './course.expander'
import { CourseMemberEntity } from './course-member/course-member.entity'
import { Optional } from 'typescript-optional'

describe('CourseExpander', () => {
  let expander: CourseExpander
  let courseMemberService: jest.Mocked<Pick<CourseMemberService, 'hasWritePermission' | 'getByUserIdAndCourseId'>>

  beforeEach(() => {
    courseMemberService = {
      hasWritePermission: jest.fn(),
      getByUserIdAndCourseId: jest.fn().mockResolvedValue(Optional.empty()),
    }
    expander = new CourseExpander(courseMemberService as unknown as CourseMemberService)
  })

  const buildContext = (userId: string, ownerId: string): ExpandContext<IRequest, CourseDTO> =>
    ({
      request: { user: { id: userId } } as IRequest,
      parent: { id: 'course-1', ownerId } as CourseDTO,
    } as ExpandContext<IRequest, CourseDTO>)

  it('lets the owner of a course change it, without asking who teaches it', async () => {
    const context = buildContext('owner-1', 'owner-1')

    const result = await expander.permissions(context)

    expect(result.update).toBe(true)
    expect(courseMemberService.hasWritePermission).not.toHaveBeenCalled()
  })

  it('asks who teaches the course for anyone but its owner', async () => {
    courseMemberService.hasWritePermission.mockResolvedValue(true)
    const context = buildContext('teacher-1', 'owner-1')

    const result = await expander.permissions(context)

    expect(courseMemberService.hasWritePermission).toHaveBeenCalledWith('course-1', { id: 'teacher-1' })
    expect(result.update).toBe(true)
  })

  it('does not let a person change a course they neither own nor teach', async () => {
    courseMemberService.hasWritePermission.mockResolvedValue(false)
    const context = buildContext('student-1', 'owner-1')

    const result = await expander.permissions(context)

    expect(result.update).toBe(false)
  })

  it('lets a person archive a course where they have a member row of their own', async () => {
    courseMemberService.getByUserIdAndCourseId.mockResolvedValue(Optional.of({ id: 'row' } as CourseMemberEntity))

    expect((await expander.permissions(buildContext('ines', 'owner-1'))).archive).toBe(true)
  })

  it('does not let a person archive a course without a member row of their own', async () => {
    expect((await expander.permissions(buildContext('bob', 'owner-1'))).archive).toBe(false)
  })
})
