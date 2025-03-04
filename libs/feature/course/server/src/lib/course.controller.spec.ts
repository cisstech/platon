import { Test, TestingModule } from '@nestjs/testing'
import { CourseController } from './course.controller'
import { CourseService } from './services/course.service'
import { CoursePermissionsService } from './permissions/permissions.service'
import { CourseMemberService } from './course-member/course-member.service'
import { CreateCourseDTO, UpdateCourseDTO, CourseFiltersDTO } from './course.dto'
import { UserRoles } from '@platon/core/common'
import { IRequest, UserEntity } from '@platon/core/server'
import { NotFoundResponse, ForbiddenResponse } from '@platon/core/common'
import { v4 as uuidv4 } from 'uuid'
import { CourseEntity } from './entites/course.entity'
import { Optional } from 'typescript-optional'

describe('CourseController', () => {
  let controller: CourseController
  let courseService: CourseService
  let permissionsService: CoursePermissionsService
  let courseMemberService: CourseMemberService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseController],
      providers: [
        {
          provide: CourseService,
          useValue: {
            search: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: CoursePermissionsService,
          useValue: {
            ensureCourseReadPermission: jest.fn(),
            ensureCourseWritePermission: jest.fn(),
          },
        },
        {
          provide: CourseMemberService,
          useValue: {
            isMember: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<CourseController>(CourseController)
    courseService = module.get<CourseService>(CourseService)
    permissionsService = module.get<CoursePermissionsService>(CoursePermissionsService)
    courseMemberService = module.get<CourseMemberService>(CourseMemberService)
  })

  describe('search', () => {
    it('should return a list of courses', async () => {
      const user_uuid = uuidv4()
      const req: IRequest = { user: { id: user_uuid, role: UserRoles.teacher } } as IRequest
      const filters: CourseFiltersDTO = {}
      const course_uuid = uuidv4()
      const owner_entity: UserEntity = {
        id: user_uuid,
        username: 'owner_username',
        firstName: 'Owner',
        lastName: 'Name',
        active: true,
        email: 'owner@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        role: UserRoles.teacher,
        hasPassword: false,
        lastActivity: new Date(),
        hasId: jest.fn(),
        save: jest.fn(),
        remove: jest.fn(),
        softRemove: jest.fn(),
        recover: jest.fn(),
        reload: jest.fn(),
      }
      const courses: CourseEntity[] = [
        {
          id: course_uuid,
          name: 'Course 1',
          ownerId: user_uuid,
          owner: owner_entity,
          createdAt: new Date(),
          updatedAt: new Date(),
          hasId: () => true,
          save: jest.fn(),
          remove: jest.fn(),
          softRemove: jest.fn(),
          recover: jest.fn(),
          reload: jest.fn(),
        },
      ]
      jest.spyOn(courseService, 'search').mockResolvedValue([courses, 1])

      const result = await controller.search(req, filters)
      expect(result.resources).toHaveLength(1)
      expect(result.resources[0].id).toBe(course_uuid)
      expect(result.total).toBe(1)
    })
  })

  describe('find', () => {
    it('should return a course', async () => {
      const req: IRequest = { user: { id: 'user1', role: UserRoles.teacher } } as IRequest
      const course: CourseEntity = {
        id: 'course1',
        name: 'Course 1',
        ownerId: 'owner1',
        owner: {
          id: 'owner1',
          username: 'owner_username',
          firstName: 'Owner',
          lastName: 'Name',
          active: true,
          email: 'owner@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          role: UserRoles.teacher,
          hasPassword: false,
          lastActivity: new Date(),
          hasId: jest.fn(),
          save: jest.fn(),
          remove: jest.fn(),
          softRemove: jest.fn(),
          recover: jest.fn(),
          reload: jest.fn(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        hasId: () => true,
        save: jest.fn(),
        remove: jest.fn(),
        softRemove: jest.fn(),
        recover: jest.fn(),
        reload: jest.fn(),
      }
      jest.spyOn(courseService, 'findById').mockResolvedValue(Optional.of(course))

      const result = await controller.find(req, 'course1')
      expect(result.resource.id).toBe('course1')
      expect(result.resource.name).toBe('Course 1')
      expect(result.resource.ownerId).toBe('owner1')
    })

    it('should throw NotFoundResponse if course not found', async () => {
      const req: IRequest = { user: { id: 'user1', role: UserRoles.teacher } } as IRequest
      jest.spyOn(courseService, 'findById').mockResolvedValue(Optional.ofNullable<CourseEntity>(null))
      await expect(controller.find(req, 'course1')).rejects.toBeInstanceOf(NotFoundResponse)
    })
  })

  describe('create', () => {
    it('should create a course', async () => {
      const req: IRequest = { user: { id: 'user1', role: UserRoles.teacher } } as IRequest
      const input: CreateCourseDTO = { name: 'New Course' } as Required<CreateCourseDTO>
      const course: CourseEntity = {
        id: 'course1',
        ...input,
        ownerId: 'user1',
        owner: {
          id: 'user1',
          username: 'owner_username',
          firstName: 'Owner',
          lastName: 'Name',
          active: true,
          email: 'owner@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          role: UserRoles.teacher,
          hasPassword: false,
          lastActivity: new Date(),
          hasId: jest.fn(),
          save: jest.fn(),
          remove: jest.fn(),
          softRemove: jest.fn(),
          recover: jest.fn(),
          reload: jest.fn(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        hasId: () => true,
        save: jest.fn(),
        remove: jest.fn(),
        softRemove: jest.fn(),
        recover: jest.fn(),
        reload: jest.fn(),
      }
      jest.spyOn(courseService, 'create').mockResolvedValue(course)

      const result = await controller.create(req, input)
      expect(result.resource).toEqual(
        expect.objectContaining({
          id: 'course1',
          name: 'New Course',
          ownerId: 'user1',
        })
      )
    })
  })

  describe('update', () => {
    let req: IRequest
    let input: UpdateCourseDTO
    let course: any

    beforeEach(() => {
      req = { user: { id: 'user1', role: UserRoles.teacher } } as IRequest
      input = { name: 'Updated Course' }
      course = {
        id: 'course1',
        ...input,
        ownerId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        hasId: jest.fn(),
        save: jest.fn(),
        remove: jest.fn(),
        softRemove: jest.fn(),
        recover: jest.fn(),
        reload: jest.fn(),
      }

      jest.spyOn(courseMemberService, 'isMember').mockResolvedValue(true)
      jest.spyOn(courseService, 'update').mockResolvedValue(course)
    })

    it('should update a course', async () => {
      const result = await controller.update(req, 'course1', input)
      expect(result.resource).toEqual(course)
    })

    it('should throw ForbiddenResponse if user is not a member', async () => {
      jest.spyOn(courseMemberService, 'isMember').mockResolvedValue(false)

      await expect(controller.update(req, 'course1', input)).rejects.toBeInstanceOf(ForbiddenResponse)
    })
  })

  describe('delete', () => {
    it('should delete a course', async () => {
      const req: IRequest = { user: { id: 'user1', role: UserRoles.teacher } } as IRequest
      jest.spyOn(courseService, 'delete').mockResolvedValue(undefined)

      await expect(controller.delete(req, 'course1')).resolves.toBeUndefined()
    })

    it('should throw ForbiddenResponse if user is not allowed to delete', async () => {
      const req: IRequest = { user: { id: 'user1', role: UserRoles.teacher } } as IRequest
      jest.spyOn(courseService, 'delete').mockImplementation(() => {
        throw new ForbiddenResponse(`You cannot delete this course`)
      })

      await expect(controller.delete(req, 'course1')).rejects.toBeInstanceOf(ForbiddenResponse)
    })
  })
})
