/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { RegisterVirtualColumnsResolver, UserEntity, VirtualColumnResolver } from '@platon/core/server'
import { ActivityVariables } from '@platon/feature/compiler'
import { ActivityEntity, ActivityMemberView, CourseEntity } from '@platon/feature/course/server'
import differenceInSeconds from 'date-fns/differenceInSeconds'
import { In, IsNull, Repository } from 'typeorm'
import { SessionEntity } from '../sessions/session.entity'

/**
 * Compute virtual columns for courses of requester user by calculating:
 *
 * - timeSpent: total time spent on the course
 * - progression: average progression of the course (average of all activities progression / number of activities linked to the user)
 *
 */
@Injectable()
@RegisterVirtualColumnsResolver(CourseEntity)
export class CourseResultsVirtualColumnsResolver implements VirtualColumnResolver<CourseEntity> {
  constructor(
    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>,
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>
  ) {}

  async resolve(courses: CourseEntity[], user: UserEntity): Promise<void> {
    const sessions = (await this.sessionRepository.find({
      where: {
        parentId: IsNull(),
        activity: { courseId: In(courses.map((e) => e.id)) },
        userId: user.id,
      },
      relations: { activity: true },
    })) as SessionEntity<ActivityVariables>[]

    const activities = await this.activityRepository
      .createQueryBuilder('activity')

      .leftJoin(ActivityMemberView, 'member', 'member.activity_id = activity.id AND member.id = :userId', {
        userId: user.id,
      })
      .select(['activity.courseId'])
      .where('activity.course_id IN (:...courseIds)', { courseIds: courses.map((e) => e.id) })
      .andWhere(`(activity.creator_id = :userId OR member.id IS NOT NULL)`, {
        userId: user.id,
      })
      .getMany()

    courses.forEach((course) => {
      const activitySessions = sessions.filter((e) => e.activity?.courseId === course.id)
      const courseActivities = activities.filter((e) => e.courseId === course.id)

      let timeSpent = 0
      let progressionSum = 0

      activitySessions.forEach((session) => {
        const { lastGradedAt, startedAt } = session
        if (lastGradedAt && startedAt) {
          timeSpent += differenceInSeconds(lastGradedAt, startedAt)
        }

        const { navigation } = session.variables
        if (navigation?.exercises) {
          const { exercises } = navigation
          const graded = exercises.filter((e: any) => !['NOT_STARTED', 'STARTED'].includes(e.state)).length
          const started = exercises.filter((e: any) => e.state !== 'NOT_STARTED').length
          progressionSum += (100 * graded + 10 * (started - graded)) / exercises.length
        }
      })

      Object.assign(course, {
        timeSpent,
        progression: progressionSum ? progressionSum / courseActivities.length : 0,
      } as Partial<CourseEntity>)
    })
  }
}
