import { ExpandContext, Expander } from '@cisstech/nestjs-expand'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User, UserRoles } from '@platon/core/common'
import { IRequest } from '@platon/core/server'
import { CourseMemberRoles, CourseStatistic } from '@platon/feature/course/common'
import {
  ActivityEntity,
  ActivityMemberView,
  CourseDTO,
  CourseMemberService,
  membershipsOf,
} from '@platon/feature/course/server'
import { PlayerActivityVariables } from '@platon/feature/player/common'
import { AnswerStates, isExerciseDone } from '@platon/feature/result/common'
import differenceInSeconds from 'date-fns/differenceInSeconds'
import { IsNull, Repository } from 'typeorm'
import { SessionEntity } from '../sessions/session.entity'

@Injectable()
@Expander(CourseDTO)
export class CourseExpander {
  constructor(
    private readonly courseMemberService: CourseMemberService,
    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>,
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>
  ) {}

  async statistic(context: ExpandContext<IRequest, CourseDTO>): Promise<CourseStatistic> {
    const { parent, request } = context
    const { user } = request
    const [members, sessions, activities] = await Promise.all([
      this.courseMemberService.findViewsByCourseIds([parent.id]),
      this.sessionRepository.find({
        where: {
          parentId: IsNull(),
          activity: { courseId: parent.id },
          userId: user.id,
        },
        relations: { activity: true },
      }),
      this.activitiesOf(parent.id, user),
    ])

    let timeSpent = 0
    let progressionSum = 0

    sessions.forEach((session: SessionEntity<PlayerActivityVariables>) => {
      const { lastGradedAt, startedAt } = session
      if (lastGradedAt && startedAt) {
        timeSpent += differenceInSeconds(lastGradedAt, startedAt)
      }

      const { navigation } = session.variables
      if (navigation?.exercises) {
        const { exercises } = navigation
        const graded = exercises.filter((e) => isExerciseDone(e.state)).length
        const started = exercises.filter((e) => e.state !== AnswerStates.NOT_STARTED).length
        progressionSum += (100 * graded + 10 * (started - graded)) / exercises.length
      }
    })

    return {
      studentCount: members.filter((member) => member.role === 'student').length,
      teacherCount: members.filter((member) => member.role === 'teacher').length,
      progression: Math.round(progressionSum ? progressionSum / activities.length : 0),
      activityCount: activities.length,
      challengeCount: activities.filter((activity) => activity.isChallenge).length,
      timeSpent,
    }
  }

  /** Who manages the course counts every activity of it; anyone else, those open to them. */
  private activitiesOf(courseId: string, user: User): Promise<ActivityEntity[]> {
    const query = this.activityRepository
      .createQueryBuilder('activity')
      .select(['activity.courseId', 'activity.isChallenge'])
      .where('activity.course_id = :courseId', { courseId })
    if (user.role === UserRoles.admin) return query.getMany()
    return query
      .leftJoin(ActivityMemberView, 'member', 'member.activity_id = activity.id AND member.id = :userId', {
        userId: user.id,
      })
      .andWhere(
        `(activity.creator_id = :userId OR member.id IS NOT NULL OR EXISTS (
          SELECT 1 FROM (${membershipsOf(':userId')}) memberships
          WHERE memberships.course_id = activity.course_id AND memberships.role = :teacher
        ))`,
        { userId: user.id, teacher: CourseMemberRoles.teacher }
      )
      .getMany()
  }
}
