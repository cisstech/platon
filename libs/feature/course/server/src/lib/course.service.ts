import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NotFoundResponse, OrderingDirections } from '@platon/core/common'
import { CourseFilters, CourseOrderings, COURSE_ORDERING_DIRECTIONS } from '@platon/feature/course/common'
import { Repository } from 'typeorm'
import { Optional } from 'typescript-optional'
import { CourseMemberView } from './course-member/course-member.view'
import { CourseEntity } from './course.entity'

type CourseGuard = (course: CourseEntity) => void | Promise<void>

@Injectable()
export class CourseService {
  constructor(
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

    const search = filters.search?.trim()
    if (search) {
      query.andWhere(`(f_unaccent(course.name) ILIKE f_unaccent(:search))`, { search: `%${search}%` })
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

      query.orderBy(fields[filters.order], filters.direction || COURSE_ORDERING_DIRECTIONS[filters.order])
    }

    if (filters.offset) {
      query.offset(filters.offset)
    }

    if (filters.limit) {
      query.limit(filters.limit)
    }

    return query.getManyAndCount()
  }

  async findById(id: string): Promise<Optional<CourseEntity>> {
    const query = this.courseRepository.createQueryBuilder('course')

    const course = await query.where('course.id = :id', { id }).getOne()

    return Optional.ofNullable(course)
  }

  async create(input: Partial<CourseEntity>): Promise<CourseEntity> {
    return this.courseRepository.save(input)
  }

  async update(id: string, changes: Partial<CourseEntity>, guard?: CourseGuard): Promise<CourseEntity> {
    const course = await this.courseRepository.findOne({ where: { id } })
    if (!course) {
      throw new NotFoundResponse(`Course not found: ${id}`)
    }

    if (guard) {
      await guard(course)
    }

    Object.assign(course, changes)

    return this.courseRepository.save(course)
  }

  async delete(id: string, guard?: CourseGuard): Promise<void> {
    const course = await this.courseRepository.findOne({ where: { id } })
    if (!course) {
      throw new NotFoundResponse(`Course not found: ${id}`)
    }

    if (guard) {
      await guard(course)
    }

    await this.courseRepository.remove(course)
  }
}
