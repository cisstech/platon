/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { RegisterVirtualColumnsResolver, UserEntity, VirtualColumnResolver } from '@platon/core/server'
import { ActivityVariables } from '@platon/feature/compiler'
import { ActivityEntity } from '@platon/feature/course/server'
import differenceInSeconds from 'date-fns/differenceInSeconds'
import { In, IsNull, Repository } from 'typeorm'
import { SessionEntity } from '../sessions/session.entity'

/**
 * Compute virtual columns for activities of requester user by calculating:
 * - timeSpent: total time spent on the activity
 * - progression: average progression of the activity
 */
@Injectable()
@RegisterVirtualColumnsResolver(ActivityEntity)
export class ActivityResultsVirtualColumnsResolver implements VirtualColumnResolver<ActivityEntity> {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>
  ) {}

  async resolve(activities: ActivityEntity[], user: UserEntity): Promise<void> {
    if (!activities.length) return

    const sessions = (await this.sessionRepository.find({
      where: {
        parentId: IsNull(),
        activityId: In(activities.map((e) => e.id)),
        userId: user.id,
      },
    })) as SessionEntity<ActivityVariables>[]

    activities.forEach((activity) => {
      const session = sessions.find((e) => e.activityId === activity.id)
      if (!session) {
        return
      }

      const { lastGradedAt, startedAt } = session
      if (lastGradedAt && startedAt) {
        Object.assign(activity, {
          timeSpent: differenceInSeconds(lastGradedAt, startedAt),
        } as Partial<ActivityEntity>)
      }

      const { navigation } = session.variables
      if (navigation?.exercises) {
        const { exercises } = navigation
        const graded = exercises.filter((e: any) => !['NOT_STARTED', 'STARTED'].includes(e.state)).length
        const started = exercises.filter((e: any) => e.state !== 'NOT_STARTED').length
        Object.assign(activity, {
          // the progression is a percentage of graded exercises
          // and started exercises (but not graded)
          // over the total number of exercises
          progression: (100 * graded + 10 * (started - graded)) / exercises.length,
        } as Partial<ActivityEntity>)
      }
    })
  }
}
