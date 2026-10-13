import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { BadRequestResponse, NotFoundResponse } from '@platon/core/common'
import { CourseFilters, CourseOrderings, COURSE_ORDERING_DIRECTIONS } from '@platon/feature/course/common'
import { DataSource, Repository } from 'typeorm'
import { Optional } from 'typescript-optional'
import { membershipsOf } from '../course-member/course-member.sql'
import { CourseEntity } from '../entites/course.entity'
import { CourseSectionEntity } from '../section/section.entity'
import { ActivityEntity } from '../activity/activity.entity'

type CourseGuard = (course: CourseEntity) => void | Promise<void>

interface DuplicateGuards {
  sourceGuard: CourseGuard
  targetGuard: CourseGuard
}

@Injectable()
export class CourseService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>
  ) {}

  async search(filters: CourseFilters = {}): Promise<[CourseEntity[], number]> {
    const query = this.courseRepository
      .createQueryBuilder('course')
      .leftJoin('course.owner', 'owner')
      .addSelect(['owner.id', 'owner.username', 'owner.firstName', 'owner.lastName'])

    filters = {
      ...filters,
      order: filters.order || CourseOrderings.UPDATED_AT,
      isTest: filters.isTest || false,
    }

    query.andWhere('course.is_test = :isTest', { isTest: filters.isTest })

    if (!filters.showAll && filters.members?.length) {
      query.andWhere(`course.id IN (SELECT course_id FROM (${membershipsOf('ANY(:members)')}) memberships)`, {
        members: filters.members,
      })
    }

    const search = filters.search?.trim()
    if (search) {
      query.andWhere(`(f_unaccent(course.name) ILIKE f_unaccent(:search))`, { search: `%${search}%` })
    }

    if (filters.archived !== undefined && filters.members?.length) {
      if (filters.archived) {
        query.andWhere(
          `EXISTS (
            SELECT 1 FROM "CourseMembers" cm
            WHERE cm.course_id = course.id
            AND cm.user_id IN (:...archivedMemberIds)
            AND cm.archived = TRUE
          )`,
          { archivedMemberIds: filters.members }
        )
      } else {
        query.andWhere(
          `NOT EXISTS (
            SELECT 1 FROM "CourseMembers" cm
            WHERE cm.course_id = course.id
            AND cm.user_id IN (:...archivedMemberIds)
            AND cm.archived = TRUE
          )`,
          { archivedMemberIds: filters.members }
        )
      }
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
        CREATED_AT: 'course.createdAt',
        UPDATED_AT: 'course.updatedAt',
      }

      query.orderBy(fields[filters.order], filters.direction || COURSE_ORDERING_DIRECTIONS[filters.order])
    }

    // One row per course, its owner being one: the page is the plain offset and limit of the query.
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
    return this.dataSource.transaction(async (manager) => {
      const course = await manager.save(CourseEntity, input)
      await manager.save(CourseSectionEntity, {
        courseId: course.id,
        name: 'Section 1',
        order: 0,
      })
      return course
    })
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

  async duplicate(sourceCourseId: string, targetCourseId: string, guards?: DuplicateGuards): Promise<CourseEntity> {
    if (sourceCourseId === targetCourseId) {
      throw new BadRequestResponse('Source and target courses cannot be the same')
    }

    const sourceCourse = await this.courseRepository.findOne({ where: { id: sourceCourseId } })
    const targetCourse = await this.courseRepository.findOne({ where: { id: targetCourseId } })
    if (!sourceCourse) {
      throw new NotFoundResponse('Source course not found')
    }
    if (!targetCourse) {
      throw new NotFoundResponse('Target course not found')
    }
    if (guards?.sourceGuard) {
      await guards.sourceGuard(sourceCourse)
    }
    if (guards?.targetGuard) {
      await guards.targetGuard(targetCourse)
    }
    return this.dataSource.transaction(async (manager) => {
      const sourceSections = await manager.find(CourseSectionEntity, {
        where: { courseId: sourceCourseId },
        order: { order: 'ASC' },
      })

      const sourceActivities = await manager.find(ActivityEntity, {
        where: { courseId: sourceCourseId },
        order: { sectionId: 'ASC', order: 'ASC' },
      })

      const targetSectionsNumber = await manager.count(CourseSectionEntity, { where: { courseId: targetCourseId } })

      for (const section of sourceSections) {
        const newSection = await manager.save(CourseSectionEntity, {
          courseId: targetCourseId,
          name: section.name,
          order: section.order + targetSectionsNumber,
        })
        const sectionAcitivities = sourceActivities.filter((a) => a.sectionId === section.id)
        for (const activity of sectionAcitivities) {
          const { id: _oldId, createdAt: _c, updatedAt: _u, ...activityProps } = activity
          await manager.save(ActivityEntity, {
            ...activityProps,
            courseId: targetCourseId,
            sectionId: newSection.id,
            openAt: this.adjustDate(activity.openAt),
            closeAt: this.adjustDate(activity.closeAt),
          })
        }
      }

      return manager.findOneOrFail(CourseEntity, { where: { id: targetCourseId } })
    })
  }

  /** update the date for the duplication. */
  private adjustDate(dateInput?: Date | string | null): Date | null {
    if (!dateInput) {
      return null
    }
    const date = new Date(dateInput)
    if (isNaN(date.getTime())) {
      return null
    }
    const currentYear = new Date().getFullYear()
    const yearDiff = currentYear - date.getFullYear()
    if (yearDiff >= 0) {
      date.setFullYear(date.getFullYear() + yearDiff + 1)
    } else {
      date.setFullYear(date.getFullYear() + 1) // already in the futur but update to be in order with the other date
    }
    return date
  }
}
