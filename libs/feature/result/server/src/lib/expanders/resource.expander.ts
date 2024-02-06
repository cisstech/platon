import { ExpandContext, Expander } from '@cisstech/nestjs-expand'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IRequest } from '@platon/core/server'
import { ResourceStatistic, ResourceTypes } from '@platon/feature/resource/common'
import { ResourceDTO, ResourceStatisticEntity } from '@platon/feature/resource/server'
import { IsNull, Not, Repository } from 'typeorm'
import { SessionView } from '../sessions/session.view'
import { SessionSuccessRate } from '../dashboard/aggregators/session.aggregator'
import { ActivityTotalAttempts } from '../dashboard/aggregators/activity.aggregator'
import { ExerciseTotalAttempts } from '../dashboard/aggregators/exercise.aggregator'

@Injectable()
@Expander(ResourceDTO)
export class ResourceExpander {
  constructor(
    @InjectRepository(SessionView)
    private readonly sessionView: Repository<SessionView>,
    @InjectRepository(ResourceStatisticEntity)
    private readonly statisticView: Repository<ResourceStatisticEntity>
  ) {}

  async statistic(context: ExpandContext<IRequest, ResourceDTO>): Promise<ResourceStatistic | undefined> {
    const { parent } = context

    const statistic = await this.statisticView.findOne({
      where: { id: parent.id },
    })

    if (!statistic) {
      return undefined
    }

    const sessions = await this.sessionView.find({
      where: {
        resourceId: parent.id,
        userId: Not(IsNull()),
      },
    })

    const successRate = new SessionSuccessRate()
    const activityTotalAttempts = new ActivityTotalAttempts()
    const exerciseTotalAttempts = new ExerciseTotalAttempts()

    const aggregators = [successRate, activityTotalAttempts, exerciseTotalAttempts]
    sessions.forEach((session) => aggregators.forEach((aggregator) => aggregator.next(session)))

    aggregators.forEach((aggregator) => aggregator.complete())

    return {
      score: statistic.score,
      members: statistic.members,
      watchers: statistic.watchers,
      circle:
        parent.type === ResourceTypes.CIRCLE
          ? {
              children: statistic.children,
              circles: statistic.circles,
              exercises: statistic.exercises,
              activities: statistic.activities,
              ready: statistic.ready,
              deprecated: statistic.deprecated,
              bugged: statistic.bugged,
              not_tested: statistic.not_tested,
              draft: statistic.draft,
            }
          : undefined,
      activity:
        parent.type === ResourceTypes.ACTIVITY
          ? {
              attemptCount: activityTotalAttempts.complete(),
              successRate: successRate.complete(),
            }
          : undefined,
      exercise:
        parent.type === ResourceTypes.EXERCISE
          ? {
              attemptCount: exerciseTotalAttempts.complete(),
              successRate: successRate.complete(),
            }
          : undefined,
    }
  }
}
