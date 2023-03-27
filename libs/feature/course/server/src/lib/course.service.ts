import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundResponse, OrderingDirections, User } from '@platon/core/common';
import { CourseFilters, CourseOrderings } from '@platon/feature/course/common';
import { Repository } from 'typeorm';
import { Optional } from 'typescript-optional';
import { CourseActivityEntity } from './activity/activity.entity';
import { CourseEntity } from './course.entity';
import { CourseMemberEntity } from './member/member.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectRepository(CourseActivityEntity)
    private readonly activityRepository: Repository<CourseActivityEntity>,
  ) { }

  findCourseActivityById(id: string): Promise<CourseActivityEntity | undefined> {
    return this.activityRepository.findOne({
      where: { id }
    }) as Promise<CourseActivityEntity | undefined>;
  }


  canViewActivity(user: User, activity: CourseActivityEntity): Promise<boolean> {
    // TODO
    return Promise.resolve(true);
  }

  async search(filters: CourseFilters = {}): Promise<[CourseEntity[], number]> {
    const query = this.courseRepository.createQueryBuilder('course');

    filters = {
      ...filters,
      order: filters.order || CourseOrderings.NAME
    }

    if (filters.members) {
      query.innerJoin(
        CourseMemberEntity,
        'member',
        'member.course_id = course.id AND member.user_id IN (:...ids)',
        { ids: filters.members }
      );
    }

    if (filters.search) {
      query.andWhere(`(
        f_unaccent(course.name) ILIKE f_unaccent(:search)
      )`, { search: `%${filters.search}%` });
    }

    if (filters.period) {
      const subtractDays = (days: number): Date => {
        const result = new Date();
        result.setDate(result.getDate() - days);
        return result;
      }
      query.andWhere('course.updated_at >= :date', { date: subtractDays(filters.period) });
    }

    if (filters.order) {
      const fields: Record<CourseOrderings, string> = {
        'NAME': 'course.name',
        'CREATED_AT': 'course.created_at',
        'UPDATED_AT': 'course.updated_at',
      }

      const orderings: Record<CourseOrderings, keyof typeof OrderingDirections> = {
        'NAME': 'ASC',
        'CREATED_AT': 'DESC',
        'UPDATED_AT': 'DESC',
      }

      query.orderBy(fields[filters.order], filters.direction || orderings[filters.order])
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
    return Optional.ofNullable(
      await query.where('course.id = :id', { id }).getOne()
    );
  }


  async create(input: Partial<CourseEntity>): Promise<CourseEntity> {
    return this.courseRepository.save(input);
  }

  async update(id: string, changes: Partial<CourseEntity>): Promise<CourseEntity> {
    const course = await this.courseRepository.findOne({ where: { id } })
    if (!course) {
      throw new NotFoundResponse(`Course not found: ${id}`)
    }
    Object.assign(course, changes);
    return this.courseRepository.save(course);
  }

  async delete(id: string) {
    return this.courseRepository.delete(id);
  }

}
