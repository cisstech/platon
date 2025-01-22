import { ExpandContext, Expander } from '@cisstech/nestjs-expand'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IRequest } from '@platon/core/server'
import { ResourceStatistic, ResourceTypes } from '@platon/feature/resource/common'
import { ResourceDTO, ResourceDependencyEntity, ResourceStatisticEntity } from '@platon/feature/resource/server'
import { IsNull, Not, Repository } from 'typeorm'
import { ActivityTotalAttempts } from '../dashboard/aggregators/activity.aggregator'
import { ExerciseUniqueAttempts } from '../dashboard/aggregators/exercise.aggregator'
import { SessionAverageScore } from '../dashboard/aggregators/session.aggregator'
import { SessionDataEntity } from '../sessions/session-data.entity'

@Injectable()
@Expander(ResourceDTO)
export class ResourceExpander {
  constructor(
    @InjectRepository(SessionDataEntity)
    private readonly sessionData: Repository<SessionDataEntity>,

    @InjectRepository(ResourceStatisticEntity)
    private readonly statisticView: Repository<ResourceStatisticEntity>,

    @InjectRepository(ResourceDependencyEntity)
    private readonly dependencyRepo: Repository<ResourceDependencyEntity>
  ) {}

  async statistic(context: ExpandContext<IRequest, ResourceDTO>): Promise<ResourceStatistic | undefined> {
    const { parent } = context

    const statistic = await this.statisticView.findOne({ where: { id: parent.id } })
    if (!statistic) {
      return undefined
    }

    const [sessions, references] = await Promise.all([
      this.sessionData.find({
        where: { resourceId: parent.id, userId: Not(IsNull()) },
      }),
      this.dependencyRepo.find({
        where: {
          dependOnId: parent.id,
        },
        select: {
          resource: {
            type: true,
          },
        },
        relations: {
          resource: true,
        },
      }),
    ])

    const averageScore = new SessionAverageScore()
    const activityTotalAttempts = new ActivityTotalAttempts()
    const exerciseUniqueAttempts = new ExerciseUniqueAttempts()

    const aggregators = [averageScore, activityTotalAttempts, exerciseUniqueAttempts]
    sessions.forEach((session) => aggregators.forEach((aggregator) => aggregator.next(session)))
    aggregators.forEach((aggregator) => aggregator.complete())

    let refCount = 0
    let activityRefCount = 0
    let templateRefCount = 0
    references.forEach((ref) => {
      activityRefCount += ref.resource.type === ResourceTypes.ACTIVITY ? 1 : 0
      templateRefCount += ref.resource.type === ResourceTypes.EXERCISE ? 1 : 0
    })

    refCount = activityRefCount + templateRefCount

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
              averageScore: averageScore.complete(),
            }
          : undefined,
      exercise:
        parent.type === ResourceTypes.EXERCISE
          ? {
              attemptCount: exerciseUniqueAttempts.complete(),
              averageScore: averageScore.complete(),
              references: refCount
                ? {
                    total: refCount,
                    activity: activityRefCount,
                    template: templateRefCount,
                  }
                : undefined,
            }
          : undefined,
    }
  }
}
