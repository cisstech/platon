import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NotFoundResponse, OrderingDirections, UserRoles } from '@platon/core/common'
import { DatabaseService, IRequest } from '@platon/core/server'
import { CourseFilters, CourseOrderings } from '@platon/feature/course/common'
import { CLS_REQ } from 'nestjs-cls'
import { Repository } from 'typeorm'
import { Optional } from 'typescript-optional'
import { CourseMemberService } from './course-member/course-member.service'
import { CourseMemberView } from './course-member/course-member.view'
import { CourseEntity } from './course.entity'

@Injectable()
export class CourseService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly courseMemberService: CourseMemberService,

    @Inject(CLS_REQ)
    private readonly request: IRequest,
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>
  ) {}

  async search(filters: CourseFilters = {}): Promise<[CourseEntity[], number]> {
    const query = this.courseRepository
      .createQueryBuilder('course')
      .leftJoin(CourseMemberView, 'member', 'member.course_id = course.id')

    filters = {
      ...filters,
      order: filters.order || CourseOrderings.UPDATED_AT,
      direction: filters.direction || OrderingDirections.DESC,
    }

    if (filters.members?.length) {
      query.andWhere('(member.id IN (:...ids))', {
        ids: filters.members,
      })
    }

    if (filters.search) {
      query.andWhere(`(f_unaccent(course.name) ILIKE f_unaccent(:search))`, { search: `%${filters.search}%` })
    }

    if (filters.period) {
      const subtractDays = (days: number): Date => {
        const result = new Date()
        result.setDate(result.getDate() - days)
        return result
      }
      query.andWhere('course.updated_at >= :date', { date: subtractDays(filters.period) })
    }

    if (filters.order) {
      const fields: Record<CourseOrderings, string> = {
        NAME: 'course.name',
        CREATED_AT: 'course.created_at',
        UPDATED_AT: 'course.updated_at',
      }

      const orderings: Record<CourseOrderings, keyof typeof OrderingDirections> = {
        NAME: 'ASC',
        CREATED_AT: 'DESC',
        UPDATED_AT: 'DESC',
      }

      query.orderBy(fields[filters.order], filters.direction || orderings[filters.order])
    }

    if (filters.offset) {
      query.offset(filters.offset)
    }

    if (filters.limit) {
      query.limit(filters.limit)
    }

    const [courses, count] = await query.getManyAndCount()
    await this.addVirtualColumns(...courses)
    return [courses, count]
  }

  async findById(id: string): Promise<Optional<CourseEntity>> {
    const query = this.courseRepository.createQueryBuilder('course')

    const course = await query.where('course.id = :id', { id }).getOne()
    if (course) {
      await this.addVirtualColumns(course)
    }

    return Optional.ofNullable(course)
  }

  async create(input: Partial<CourseEntity>): Promise<CourseEntity> {
    const result = await this.courseRepository.save(input)
    await this.addVirtualColumns(result)
    return result
  }

  async update(id: string, changes: Partial<CourseEntity>): Promise<CourseEntity> {
    const course = await this.courseRepository.findOne({ where: { id } })
    if (!course) {
      throw new NotFoundResponse(`Course not found: ${id}`)
    }

    Object.assign(course, {
      ...changes,

      // REMOVE ALL VIRTUAL COLUMNS HERE
      timeSpent: undefined,
      progression: undefined,
      studentCount: undefined,
      teacherCount: undefined,
      permissions: undefined,
    })

    const result = await this.courseRepository.save(course)
    await this.addVirtualColumns(result)
    return result
  }

  async delete(id: string) {
    return this.courseRepository.delete(id)
  }

  private async addVirtualColumns(...courses: CourseEntity[]): Promise<void> {
    const members = await this.courseMemberService.findViewsByCourseIds(courses.map((course) => course.id))
    courses.forEach((course) => {
      Object.assign(course, {
        permissions: {
          update: [UserRoles.admin, UserRoles.teacher].includes(this.request.user.role),
        },
        studentCount: members.filter((member) => member.courseId === course.id && member.role === 'student').length,
        teacherCount: members.filter((member) => member.courseId === course.id && member.role !== 'student').length,
      } as Partial<CourseEntity>)
    })

    await this.databaseService.resolveVirtualColumns(CourseEntity, courses, this.request.user)
  }
}
